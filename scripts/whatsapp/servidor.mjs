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
 *   TOKEN_WHATSAPP   obligatoria. Protege el endpoint de mensajes.
 *   PORT             por defecto 8080.
 *   DIAS             ventana de mensajes que se conserva. Por defecto 3.
 */
import { createServer } from "node:http";
import { mkdir } from "node:fs/promises";
import {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeWASocket,
  useMultiFileAuthState as cargarSesion,
} from "baileys";
import QRCode from "qrcode-terminal";

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

/** jid → { nombre, mensajes: Map<id, mensaje> } */
const chats = new Map();

const estado = {
  conexion: "arrancando",
  vinculado: false,
  qr: null,
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
  chat.mensajes.set(m.key.id, {
    fecha: new Date(marca).toISOString(),
    mio: Boolean(m.key.fromMe),
    texto: texto.trim(),
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

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("messaging-history.set", ({ messages }) => {
    for (const m of messages ?? []) guardar(m);
  });
  sock.ev.on("messages.upsert", ({ messages }) => {
    for (const m of messages ?? []) guardar(m);
  });

  sock.ev.on("connection.update", (u) => {
    if (u.qr) {
      estado.qr = u.qr;
      estado.vinculado = false;
      console.log("\nVinculá la línea escaneando este código:\n");
      QRCode.generate(u.qr, { small: true });
    }
    if (u.connection) estado.conexion = u.connection;
    if (u.connection === "open") {
      estado.vinculado = true;
      estado.qr = null;
      console.log("Conectado a WhatsApp.");
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
      faltaVincular: Boolean(estado.qr),
      chats: chats.size,
      mensajes: [...chats.values()].reduce((n, c) => n + c.mensajes.size, 0),
      ultimoMensaje: estado.ultimoMensaje,
      desde: estado.desde,
    });
  }

  if (req.headers.authorization !== `Bearer ${TOKEN}`) {
    return responder(401, { error: "No autorizado" });
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
