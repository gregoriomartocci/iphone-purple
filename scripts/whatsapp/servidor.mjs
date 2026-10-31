/**
 * El lector de WhatsApp, como servicio que queda prendido.
 *
 * Es la versión servidor de `leer.mjs`. La diferencia no es el código de
 * lectura sino el ciclo de vida: acá la sesión se mantiene abierta, los
 * mensajes se acumulan a medida que llegan, y el panel los pide por HTTP
 * cuando los necesita. Así el catálogo se puede cargar con las listas del día
 * sin que nadie tenga que correr un comando.
 *
 * Va en su propia máquina y no en Vercel. Una sesión de WhatsApp Web es una
 * conexión abierta con credenciales en disco, y las funciones de Vercel se
 * apagan entre pedido y pedido: cada visita reabriría la sesión desde cero, lo
 * que además es la forma más rápida de que WhatsApp bloquee la línea.
 *
 * SOLO LECTURA. No manda mensajes, no marca como leído y no se pone en línea.
 *
 * Variables:
 *   TOKEN_WHATSAPP   obligatoria. Protege los endpoints de mensajes y QR.
 *   WHATSAPP_NUMERO  la línea que se espera. Si la vinculada es otra, el
 *                    lector se desvincula solo y no sirve ni un mensaje.
 *   PORT             por defecto 8080.
 *   DIAS             ventana de mensajes que se conserva. Por defecto 3.
 */
import { createServer } from "node:http";
import { mkdir, rm } from "node:fs/promises";
import {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeWASocket,
  useMultiFileAuthState as cargarSesion,
} from "baileys";
import QRCode from "qrcode-terminal";
import { comparable } from "./telefono.mjs";
import { toString as qrSvg } from "qrcode";

const PUERTO = Number(process.env.PORT ?? 8080);
const DIAS = Number(process.env.DIAS ?? 3);
const TOKEN = process.env.TOKEN_WHATSAPP;

if (!TOKEN) {
  console.error(
    "Falta TOKEN_WHATSAPP. Sin eso el endpoint queda abierto y cualquiera puede " +
      "leer los mensajes de los proveedores."
  );
  process.exit(1);
}

const AUTH = process.env.AUTH_DIR ?? "/datos/whatsapp-auth";

/**
 * La línea que se espera, si alguien la declaró.
 *
 * Sin esto el lector lee lo que sea que haya escaneado, y escanear con el
 * WhatsApp personal en vez del del negocio es un error de un segundo: se
 * terminan leyendo conversaciones privadas y publicando precios de charlas que
 * no son de proveedores.
 */
const ESPERADO = comparable(process.env.WHATSAPP_NUMERO);

/**
 * El mismo número, en la forma que pide WhatsApp para vincular por código:
 * solo dígitos, con código de país y sin el +.
 */
const ESPERADO_CRUDO = String(process.env.WHATSAPP_NUMERO ?? "").replace(/\D/g, "");

/** jid → { nombre, mensajes: Map<id, mensaje> } */
const chats = new Map();

const estado = {
  conexion: "arrancando",
  vinculado: false,
  qr: null,
  /** Código de 8 caracteres para vincular sin escanear nada. */
  codigo: null,
  /** La línea vinculada, tal como la informa WhatsApp. */
  numero: null,
  /** La vinculada no es la esperada: no se sirve nada y se corta. */
  lineaIncorrecta: false,
  desde: new Date().toISOString(),
  ultimoMensaje: null,
};

function textoDe(m) {
  const c = m.message;
  if (!c) return null;
  return (
    c.conversation ??
    c.extendedTextMessage?.text ??
    c.imageMessage?.caption ??
    c.videoMessage?.caption ??
    c.documentMessage?.caption ??
    null
  );
}

function guardar(m) {
  const jid = m.key?.remoteJid;
  if (!jid || jid === "status@broadcast") return;

  const marca = Number(m.messageTimestamp ?? 0) * 1000;
  if (!marca) return;

  const texto = textoDe(m);
  if (!texto || texto.trim().length < 8) return;

  if (!chats.has(jid)) {
    chats.set(jid, { jid, nombre: m.pushName ?? null, mensajes: new Map() });
  }
  const chat = chats.get(jid);
  if (!chat.nombre && m.pushName) chat.nombre = m.pushName;

  /*
   * Quién escribió, que en un grupo no es lo mismo que el chat.
   *
   * En un chat de a dos, `remoteJid` ya es la otra persona. En un grupo es el
   * grupo, y quien mandó el mensaje viene aparte, en `participant`. Varios
   * proveedores publican sus listas en el mismo grupo de revendedores: sin
   * este dato son todos "el grupo", no se puede saber de quién es cada lista
   * ni, por lo tanto, qué margen le toca.
   */
  const autorJid = jid.endsWith("@g.us") ? (m.key.participant ?? null) : jid;

  chat.mensajes.set(m.key.id, {
    fecha: new Date(marca).toISOString(),
    mio: Boolean(m.key.fromMe),
    texto: texto.trim(),
    autor: autorJid ? autorJid.split("@")[0] : null,
    autorNombre: m.pushName ?? null,
  });
  estado.ultimoMensaje = new Date().toISOString();
}

/**
 * Tira lo que quedó fuera de la ventana.
 *
 * Sin esto el proceso acumula meses de conversaciones en memoria y termina
 * reiniciándose solo por quedarse sin RAM, justo en la máquina más chica, que
 * es la que conviene pagar para esto.
 */
function podar() {
  const limite = Date.now() - DIAS * 86_400_000;
  for (const [jid, chat] of chats) {
    for (const [id, m] of chat.mensajes) {
      if (new Date(m.fecha).getTime() < limite) chat.mensajes.delete(id);
    }
    if (chat.mensajes.size === 0) chats.delete(jid);
  }
}

function instantanea(dias = DIAS) {
  const desde = Date.now() - dias * 86_400_000;
  return [...chats.values()]
    .map((c) => ({
      jid: c.jid,
      nombre: c.nombre,
      telefono: c.jid.split("@")[0],
      grupo: c.jid.endsWith("@g.us"),
      mensajes: [...c.mensajes.values()]
        .filter((m) => new Date(m.fecha).getTime() >= desde)
        .sort((a, b) => a.fecha.localeCompare(b.fecha)),
    }))
    .filter((c) => c.mensajes.length > 0)
    .sort((a, b) => b.mensajes.length - a.mensajes.length);
}

async function conectar() {
  await mkdir(AUTH, { recursive: true });
  const { state, saveCreds } = await cargarSesion(AUTH);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    markOnlineOnConnect: false,
    syncFullHistory: true,
    browser: ["iPhone Purple — panel", "Chrome", "1.0.0"],
  });

  /*
   * Vincular por código en vez de por QR, cuando sabemos qué línea queremos.
   *
   * Esto es mejor que el QR y no solo más cómodo: el número se declara de
   * antemano y WhatsApp solo acepta el código en el teléfono de ESA línea. Con
   * el QR cualquiera puede escanear con la cuenta que tenga a mano —el error
   * de un segundo que nos preocupaba— y recién después lo detectamos y
   * deshacemos. Acá no puede pasar.
   *
   * El QR se sigue emitiendo por si esto falla: pedir el código es una llamada
   * a los servidores de WhatsApp y puede no contestar.
   *
   * La espera es porque el socket tiene que estar abierto antes de pedirlo;
   * sin ella la llamada se va contra una conexión que todavía no existe.
   */
  if (ESPERADO_CRUDO && !state.creds.registered) {
    setTimeout(async () => {
      try {
        const codigo = await sock.requestPairingCode(ESPERADO_CRUDO);
        estado.codigo = codigo;
        console.log(`\nCódigo para vincular ${ESPERADO_CRUDO}: ${codigo}\n`);
      } catch (e) {
        console.error(
          "No se pudo pedir el código de vinculación, queda el QR:",
          e?.message ?? e
        );
      }
    }, 4_000);
  }

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("messaging-history.set", ({ messages }) => {
    for (const m of messages ?? []) guardar(m);
  });
  sock.ev.on("messages.upsert", ({ messages }) => {
    for (const m of messages ?? []) guardar(m);
  });

  sock.ev.on("connection.update", async (u) => {
    if (u.qr) {
      estado.qr = u.qr;
      estado.vinculado = false;
      // Un QR nuevo es un intento de vinculación nuevo: lo que se haya
      // rechazado antes deja de aplicar, si no habría que reiniciar el
      // proceso para poder escanear la línea correcta.
      estado.lineaIncorrecta = false;
      estado.numero = null;
      console.log("\nVinculá la línea escaneando este código:\n");
      QRCode.generate(u.qr, { small: true });
    }
    if (u.connection) estado.conexion = u.connection;
    if (u.connection === "open") {
      /*
       * El JID viene como "5492211234567:12@s.whatsapp.net": el ":12" es el
       * dispositivo y hay que sacarlo antes de comparar, porque si no se pega
       * al número y ninguna línea coincide nunca.
       */
      const propio = String(sock.user?.id ?? "")
        .split(":")[0]
        .split("@")[0];
      estado.numero = propio || null;

      if (ESPERADO && comparable(propio) !== ESPERADO) {
        /*
         * Línea equivocada. Se falla cerrado y en este orden: primero se tira
         * lo que ya se sincronizó —WhatsApp manda el historial apenas conecta,
         * así que para cuando llegamos acá ya hay mensajes en memoria que no
         * son nuestros— y recién después se desvincula.
         *
         * Desvincular no es cortés, es la reparación: deshace el error de
         * haber escaneado con la cuenta personal en vez de la del negocio, y
         * saca este dispositivo de la lista del teléfono. Sin eso quedaría
         * vinculado y leyendo conversaciones privadas.
         */
        estado.lineaIncorrecta = true;
        estado.vinculado = false;
        chats.clear();
        console.error(
          `Línea equivocada: vinculaste ${propio} y se esperaba ${ESPERADO}. ` +
            "Me desvinculo y borro la sesión."
        );
        try {
          await sock.logout();
        } catch {
          // Si no se pudo avisar al servidor, igual se borra la sesión local:
          // sin credenciales no hay con qué volver a leer nada.
        }
        await rm(AUTH, { recursive: true, force: true }).catch(() => {});
        return;
      }

      estado.vinculado = true;
      estado.qr = null;
      estado.codigo = null;
      console.log(`Conectado a WhatsApp como ${propio || "?"}.`);
    }
    if (u.connection === "close") {
      const codigo = u.lastDisconnect?.error?.output?.statusCode;
      if (codigo === DisconnectReason.loggedOut) {
        // Cerraron la sesión desde el teléfono: reconectar en bucle solo
        // generaría intentos fallidos, que es lo que mira WhatsApp para
        // bloquear. Se corta y se avisa.
        estado.conexion = "desvinculado";
        console.error("Sesión cerrada desde el teléfono. Hay que volver a vincular.");
        return;
      }
      // Cualquier otro corte es de red: se reintenta con una espera, no al toque.
      console.log("Conexión caída, reintentando en 10 s…");
      setTimeout(conectar, 10_000);
    }
  });
}

setInterval(podar, 3_600_000);

createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const responder = (codigo, cuerpo) => {
    res.writeHead(codigo, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(cuerpo));
  };

  // Sin token: sirve para que la plataforma sepa si el proceso está vivo, y
  // para ver desde el navegador si falta vincular la línea.
  if (url.pathname === "/salud") {
    return responder(200, {
      conexion: estado.conexion,
      vinculado: estado.vinculado,
      /* El número sí se publica sin token: no es un secreto —está en la web
         del negocio— y es lo que permite ver de un vistazo si se vinculó la
         línea que correspondía. El QR, que sí es credencial, no. */
      numero: estado.numero,
      lineaIncorrecta: estado.lineaIncorrecta,
      verificaNumero: Boolean(ESPERADO),
      /* Falta vincular si hay cualquiera de las dos vías esperando: el QR
         para escanear, o el código para escribir en el teléfono. */
      faltaVincular: Boolean(estado.qr || estado.codigo),
      chats: chats.size,
      mensajes: [...chats.values()].reduce((n, c) => n + c.mensajes.size, 0),
      ultimoMensaje: estado.ultimoMensaje,
      desde: estado.desde,
    });
  }

  if (req.headers.authorization !== `Bearer ${TOKEN}`) {
    return responder(401, { error: "No autorizado" });
  }

  /*
   * El QR, dibujado, para poder vincular desde el panel.
   *
   * Va detrás del token y no en /salud, que es público: este string ES la
   * credencial. Quien lo escanee queda con la sesión de WhatsApp vinculada, así
   * que exponerlo sin autenticación sería regalar la línea a cualquiera que
   * sepa la URL del servicio.
   *
   * Se devuelve el SVG ya armado y no el string crudo, por lo mismo: el panel
   * lo muestra y nadie más necesita el contenido.
   */
  /*
   * Con la línea equivocada no se sirve nada, ni siquiera el QR: la respuesta
   * explica qué pasó para que el panel pueda decirlo, y no se devuelve ningún
   * mensaje. Es el único estado en que el lector está vivo y aun así calla.
   */
  if (estado.lineaIncorrecta) {
    return responder(409, {
      error: "linea-incorrecta",
      numero: estado.numero,
      detalle:
        "La línea vinculada no es la esperada. Me desvinculé y borré lo leído. Reiniciá el lector para escanear de nuevo.",
    });
  }

  if (url.pathname === "/qr") {
    if (!estado.qr) {
      return responder(200, {
        svg: null,
        codigo: estado.codigo,
        vinculado: estado.vinculado,
      });
    }
    return qrSvg(estado.qr, { type: "svg", margin: 1, width: 280 })
      .then((svg) => responder(200, { svg, codigo: estado.codigo, vinculado: false }))
      .catch(() =>
        responder(200, { svg: null, codigo: estado.codigo, vinculado: false })
      );
  }

  if (url.pathname === "/mensajes") {
    const dias = Math.min(Number(url.searchParams.get("dias") ?? DIAS), DIAS);
    return responder(200, {
      dias,
      generado: new Date().toISOString(),
      chats: instantanea(dias),
    });
  }

  return responder(404, { error: "No existe" });
}).listen(PUERTO, () => {
  console.log(`Escuchando en :${PUERTO} — ventana de ${DIAS} días`);
});

conectar().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
