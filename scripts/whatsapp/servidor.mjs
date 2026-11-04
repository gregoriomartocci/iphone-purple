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
 *                    Es solo verificación: vincular siempre es por QR.
 *   PORT             por defecto 8080.
 *   DIAS             ventana de mensajes que se conserva. Por defecto 3.
 *   SITIO_URL y CRON_SECRET  para refrescar el dólar cada hora.
 */
import { createServer } from "node:http";
import { appendFile, cp, rename, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeWASocket,
  normalizeMessageContent,
  useMultiFileAuthState as cargarSesion,
} from "baileys";
import QRCode from "qrcode-terminal";
import { comparable } from "./telefono.mjs";
import { jidParaConsultar, nombreDeContacto, registrarContacto } from "./contactos.mjs";
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

/*
 * Ojo con AUTH: se borra entero cuando un intento de vinculación no prospera.
 * Nada que haga falta conservar —un registro, por ejemplo— puede vivir ahí
 * adentro, porque se va con el reintento justo cuando más se necesita leerlo.
 */

/**
 * La línea que se espera, si alguien la declaró.
 *
 * Sin esto el lector lee lo que sea que haya escaneado, y escanear con el
 * WhatsApp personal en vez del del negocio es un error de un segundo: se
 * terminan leyendo conversaciones privadas y publicando precios de charlas que
 * no son de proveedores.
 */
const ESPERADO = comparable(process.env.WHATSAPP_NUMERO);

/** jid → { nombre, mensajes: Map<id, mensaje> } */
const chats = new Map();

const estado = {
  conexion: "arrancando",
  vinculado: false,
  qr: null,
  /** La línea vinculada, tal como la informa WhatsApp. */
  numero: null,
  /** La vinculada no es la esperada: no se sirve nada y se corta. */
  lineaIncorrecta: false,
  /** Dejó de pedir vinculaciones porque nadie escaneaba. */
  enPausa: false,
  /** Cuántos QR se ofrecieron desde el último enganche, y cuántos admite. */
  intentos: 0,
  intentosMaximos: 0,
  /** Cuándo WhatsApp rechazó la conexión por última vez. */
  ultimoRechazo: null,
  /**
   * Las últimas cosas que pasaron, con su hora.
   *
   * Hasta ahora todo esto vivía solo en el log del proceso, que nadie mira. Sin
   * eso, desde el panel la conexión era una caja negra: no se podía saber si
   * recién arrancó, si WhatsApp venía rechazando, o si hacía rato que esperaba
   * un escaneo. Cada problema parecía un misterio nuevo.
   */
  eventos: [],
  desde: new Date().toISOString(),
  ultimoMensaje: null,
};

function textoDe(m) {
  // Abre los envoltorios: mensajes temporales, de una sola vista, documentos.
  const c = normalizeMessageContent(m.message);
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

/**
 * Nombres de grupo y de contacto, que no vienen con los mensajes.
 *
 * El mensaje trae `pushName`, que es el nombre de quien escribió, no el del
 * grupo. Sin preguntar aparte, un chat de grupo queda identificado por su jid
 * —"120363427939785789"— y no hay forma de saber de qué grupo se trata.
 */
/**
 * Dónde se guardan los mensajes entre reinicios.
 *
 * Va al lado de la carpeta de sesión y no adentro, porque esa se borra entera
 * cuando un intento de vinculación no prospera. En la imagen de Docker el
 * volumen está montado en el directorio padre, así que esto cae dentro.
 */
const ARCHIVO = join(dirname(AUTH), "mensajes-whatsapp.json");

/**
 * Todo lo que pasó, sin ventana.
 *
 * La poda borra de memoria lo más viejo que `DIAS` para que el proceso no se
 * coma la RAM, y eso está bien para lo que el panel necesita ver. Pero WhatsApp
 * no reenvía nada: lo que se podó y no se importó, se perdió para siempre. Si
 * el lector estuvo caído cuatro días, esas listas no vuelven.
 *
 * Esto es la red debajo. Un renglón por mensaje, agregado al final y nunca
 * reescrito —agregar al final es barato y sobrevive a que el proceso muera a
 * mitad—, y no se carga en memoria: está para recuperar y para auditar un
 * precio dentro de seis meses.
 */
const HISTORICO = join(dirname(AUTH), "historico-whatsapp.ndjson");

const ARCHIVO_CONTACTOS = join(dirname(AUTH), "contactos-whatsapp.json");
/** Lo que WhatsApp informa de cada contacto. Sobrevive reinicios. */
const contactos = new Map();
let guardadoContactos = null;

function anotarContactos(lista) {
  let cambio = false;
  for (const c of lista ?? []) cambio = registrarContacto(contactos, c) || cambio;
  if (!cambio || guardadoContactos) return;
  guardadoContactos = setTimeout(() => {
    guardadoContactos = null;
    writeFile(ARCHIVO_CONTACTOS, JSON.stringify([...contactos]), "utf8").catch((e) =>
      console.error("No se pudieron guardar los contactos:", e?.message ?? e)
    );
  }, 5_000);
}

/** Mensajes descartados por no traer texto, por tipo. Una lista en foto cae acá. */
const sinTexto = {};

const nombresDeChat = new Map();

/**
 * Lo que WhatsApp sabe de cada proveedor, más allá de sus mensajes.
 *
 * Se pide una vez por contacto y se guarda. Un perfil de negocio no cambia de
 * un día para el otro, y cada consulta es una llamada a WhatsApp: repetirlas
 * en cada visita al panel sería una ráfaga sobre la misma línea, que es lo que
 * mira WhatsApp para bloquear.
 */
const perfiles = new Map();
let socketVivo = null;
/** El socket en curso, vinculado o no: `socketVivo` recién existe al conectar. */
let socketActual = null;

/**
 * Cuánto esperar antes de reconectar, creciendo.
 *
 * Antes eran diez segundos fijos. Cuando WhatsApp rechaza —y rechaza por
 * tandas— reintentar cada diez segundos es insistir seis veces por minuto
 * sobre una línea que ya dijo que no, y eso es lo que termina en un bloqueo.
 * Creciendo, un corte de red se recupera igual de rápido y un rechazo
 * sostenido deja de ser una ráfaga.
 */
const ESPERA_MINIMA = 5_000;
const ESPERA_MAXIMA = 300_000;
let espera = ESPERA_MINIMA;

/**
 * Cuántos códigos se ofrecen antes de dejar de pedir.
 *
 * Esto es lo que faltaba y costó caro: el lector quedó prendido tres días sin
 * que nadie escaneara y pidió 3247 vinculaciones, una cada veinte segundos.
 * WhatsApp cuenta eso y termina frenando la línea.
 *
 * Baileys abandona solo después de unos pocos QR —"QR refs attempts ended"—
 * pero nuestro reconexión lo volvía a levantar, para siempre. Con seis
 * intentos hay unos dos minutos para agarrar el teléfono, que es de sobra para
 * alguien que está mirando la pantalla, y nada para una máquina olvidada.
 *
 * No es un error: es esperar a que haya alguien. Se reanuda desde el panel.
 */
const INTENTOS_MAXIMOS = Number(process.env.INTENTOS_VINCULACION ?? 6);
let intentosDeVinculacion = 0;

/** Deja constancia de algo que pasó, para que el panel pueda contarlo. */
function anotar(tipo, detalle = null) {
  estado.eventos.push({ cuando: new Date().toISOString(), tipo, detalle });
  // Un anillo corto: lo viejo no ayuda a entender qué está pasando ahora, y
  // el proceso tiene que poder quedar prendido meses sin crecer.
  if (estado.eventos.length > 40) estado.eventos.shift();
}

/** Deja de pedir y se queda quieto hasta que alguien lo reanude. */
function pausar() {
  estado.enPausa = true;
  estado.conexion = "en pausa";
  estado.qr = null;
  try {
    socketActual?.end?.(undefined);
  } catch {
    // Si ya estaba cerrado, mejor.
  }
  socketVivo = null;
  anotar("pausa", `Nadie escaneó en ${INTENTOS_MAXIMOS} códigos`);
  console.log(
    `Nadie escaneó en ${INTENTOS_MAXIMOS} intentos. Me quedo quieto para no gastar vinculaciones; reanudá desde el panel.`
  );
}

/**
 * Una copia de la sesión, hecha cuando se sabe que funciona.
 *
 * Volver a vincular cuesta que alguien agarre el teléfono. Si los archivos se
 * corrompen —un corte de luz a mitad de una escritura— tener de dónde volver
 * es la diferencia entre reiniciar y repetir todo el trámite.
 */
async function respaldarSesion() {
  try {
    await rm(`${AUTH}-respaldo`, { recursive: true, force: true });
    await cp(AUTH, `${AUTH}-respaldo`, { recursive: true });
  } catch (e) {
    console.error("No se pudo respaldar la sesión:", e?.message ?? e);
  }
}
/** Identificador interno de un participante → su teléfono, cuando se puede. */
const telefonoDeLid = new Map();

/**
 * Pregunta por todos los grupos de una sola vez.
 *
 * Una llamada en vez de una por grupo: pedirlas de a una, con diez o veinte
 * grupos, es la clase de ráfaga que WhatsApp mira para bloquear una línea.
 */
async function traerNombresDeGrupos(sock) {
  try {
    const grupos = await sock.groupFetchAllParticipating();
    for (const [jid, meta] of Object.entries(grupos ?? {})) {
      if (meta?.subject) nombresDeChat.set(jid, meta.subject);
      /*
       * Los participantes a veces traen las dos identidades: el identificador
       * interno con el que firman los mensajes y el teléfono real. Guardar esa
       * correspondencia es lo que permite emparejar a un proveedor que escribe
       * en un grupo con el mismo que escribe por privado.
       */
      for (const p of meta?.participants ?? []) {
        const lid = String(p.id ?? "").split("@")[0];
        const tel = String(p.jid ?? p.phoneNumber ?? "").split("@")[0];
        if (lid && tel && lid !== tel) telefonoDeLid.set(lid, tel);
      }
    }
    /* Los nombres llegan después de los mensajes —y después de los
       recuperados del disco—, así que hay que aplicarlos a lo que ya está. */
    for (const [jid, nombre] of nombresDeChat) {
      const chat = chats.get(jid);
      if (chat) chat.nombre = nombre;
    }
    if (nombresDeChat.size > 0) pedirGuardado();

    console.log(
      `Nombres de grupo: ${nombresDeChat.size} · identificadores resueltos a teléfono: ${telefonoDeLid.size}`
    );
  } catch (e) {
    console.error("No se pudieron traer los nombres de los grupos:", e?.message ?? e);
  }
}

/*
 * Los mensajes se persisten porque si no, un reinicio los borra.
 *
 * Viven en memoria y WhatsApp no reenvía el historial al reconectar: solo lo
 * manda la primera vez que se vincula un dispositivo. Sin esto, cada reinicio
 * —un deploy, una caída de red, cambiar una variable— dejaba la ventana en
 * cero hasta que entrara un mensaje nuevo, y el panel decía "todavía no juntó
 * mensajes" aunque hubiera veinte listas de esta mañana.
 *
 * Se escribe con retraso y no en cada mensaje: cuando entra una ráfaga,
 * grabar por cada uno escribe el archivo entero decenas de veces.
 */
let guardadoPendiente = null;

function pedirGuardado() {
  if (guardadoPendiente) return;
  guardadoPendiente = setTimeout(async () => {
    guardadoPendiente = null;
    try {
      const datos = [...chats.values()].map((c) => ({
        jid: c.jid,
        nombre: c.nombre,
        mensajes: [...c.mensajes.entries()],
      }));
      await writeFile(ARCHIVO, JSON.stringify(datos), "utf8");
    } catch (e) {
      console.error("No se pudieron guardar los mensajes:", e?.message ?? e);
    }
  }, 5_000);
}

async function cargarDeDisco() {
  try {
    const datos = JSON.parse(await readFile(ARCHIVO, "utf8"));
    for (const c of datos) {
      chats.set(c.jid, {
        jid: c.jid,
        nombre: c.nombre ?? null,
        mensajes: new Map(c.mensajes),
      });
    }
    podar();
    const n = [...chats.values()].reduce((t, c) => t + c.mensajes.size, 0);
    console.log(`Recuperados ${n} mensajes de ${chats.size} chats del disco.`);
  } catch {
    // No existir es lo normal la primera vez.
  }
}

/**
 * Todo lo que se pueda averiguar de un contacto, de una sola pasada.
 *
 * Cada dato va en su propio try: un contacto sin perfil de negocio hace fallar
 * esa consulta y no tiene por qué llevarse puestas las otras dos. Un proveedor
 * del que sabemos la foto y el estado es mejor que uno del que no sabemos nada
 * porque no tenía cuenta de empresa.
 */
async function traerPerfil(id) {
  if (perfiles.has(id)) return perfiles.get(id);
  if (!socketVivo) throw new Error("Sin conexión con WhatsApp.");

  const jid = jidParaConsultar(contactos, id);
  const perfil = { id, negocio: null, estado: null, foto: null };

  try {
    const n = await socketVivo.getBusinessProfile(jid);
    if (n) {
      perfil.negocio = {
        descripcion: n.description || null,
        categoria: n.category || null,
        email: n.email || null,
        sitios: Array.isArray(n.website) ? n.website.filter(Boolean) : [],
        direccion: n.address || null,
      };
    }
  } catch {
    // La mayoría de los proveedores usan WhatsApp común, no Business.
  }

  try {
    const r = await socketVivo.fetchStatus(jid);
    const texto = Array.isArray(r) ? r[0]?.status?.status : r?.status;
    if (texto) perfil.estado = String(texto);
  } catch {
    // El estado se puede tener oculto.
  }

  try {
    perfil.foto = (await socketVivo.profilePictureUrl(jid, "preview")) ?? null;
  } catch {
    // Sin foto, o con la privacidad cerrada.
  }

  perfiles.set(id, perfil);
  return perfil;
}

function guardar(m) {
  const jid = m.key?.remoteJid;
  if (!jid || jid === "status@broadcast") return;

  const marca = Number(m.messageTimestamp ?? 0) * 1000;
  if (!marca) return;

  const texto = textoDe(m);
  if (!texto) {
    const tipo =
      Object.keys(normalizeMessageContent(m.message) ?? {})[0] ?? "sin-contenido";
    sinTexto[tipo] = (sinTexto[tipo] ?? 0) + 1;
  }
  if (!texto || texto.trim().length < 8) return;

  /*
   * El nombre de un grupo se pregunta; el de un chat de a dos es el `pushName`
   * de la otra persona. Antes se usaba `pushName` para los dos, y en un grupo
   * eso ponía de nombre al último que hubiera escrito.
   */
  const esGrupo = jid.endsWith("@g.us");
  const nombre = esGrupo ? (nombresDeChat.get(jid) ?? null) : (m.pushName ?? null);

  if (!chats.has(jid)) {
    chats.set(jid, { jid, nombre, mensajes: new Map() });
  }
  const chat = chats.get(jid);
  if (!chat.nombre && nombre) chat.nombre = nombre;

  /*
   * Quién escribió, que en un grupo no es lo mismo que el chat.
   *
   * En un chat de a dos, `remoteJid` ya es la otra persona. En un grupo es el
   * grupo, y quien mandó el mensaje viene aparte, en `participant`. Varios
   * proveedores publican sus listas en el mismo grupo de revendedores: sin
   * este dato son todos "el grupo", no se puede saber de quién es cada lista
   * ni, por lo tanto, qué margen le toca.
   */
  const autorJid = esGrupo ? (m.key.participant ?? null) : jid;
  if (autorJid && m.pushName && !m.key.fromMe) {
    anotarContactos([{ id: autorJid, notify: m.pushName }]);
  }
  const autorId = autorJid ? autorJid.split("@")[0] : null;

  chat.mensajes.set(m.key.id, {
    fecha: new Date(marca).toISOString(),
    mio: Boolean(m.key.fromMe),
    texto: texto.trim(),
    // Si se pudo resolver el identificador interno a un teléfono, va el
    // teléfono: es lo que permite reconocer al mismo proveedor en un grupo y
    // por privado.
    autor: autorId ? (telefonoDeLid.get(autorId) ?? autorId) : null,
    autorNombre: m.pushName ?? null,
  });
  estado.ultimoMensaje = new Date().toISOString();
  pedirGuardado();

  /*
   * Al histórico va todo, no solo lo que parece lista. Filtrar acá obligaría
   * a repetir la heurística del sitio dentro del lector, y el día que las dos
   * se separen el archivo deja afuera justo lo que haría falta recuperar.
   * Guardar de más cuesta unos megabytes al año.
   */
  void appendFile(
    HISTORICO,
    JSON.stringify({
      jid,
      chat: chat.nombre,
      fecha: new Date(marca).toISOString(),
      autor: autorId ? (telefonoDeLid.get(autorId) ?? autorId) : null,
      texto: texto.trim(),
    }) + "\n",
    "utf8"
  ).catch((e) => console.error("No se pudo escribir el histórico:", e?.message ?? e));
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
      nombre: c.nombre ?? nombreDeContacto(contactos, c.jid),
      telefono: c.jid.split("@")[0],
      grupo: c.jid.endsWith("@g.us"),
      mensajes: [...c.mensajes.values()]
        .filter((m) => new Date(m.fecha).getTime() >= desde)
        .map((m) => ({
          ...m,
          autorNombre: m.autorNombre ?? nombreDeContacto(contactos, m.autor ?? ""),
        }))
        .sort((a, b) => a.fecha.localeCompare(b.fecha)),
    }))
    .filter((c) => c.mensajes.length > 0)
    .sort((a, b) => b.mensajes.length - a.mensajes.length);
}

async function conectar() {
  await mkdir(AUTH, { recursive: true });
  if (contactos.size === 0) {
    try {
      for (const [id, c] of JSON.parse(await readFile(ARCHIVO_CONTACTOS, "utf8"))) {
        contactos.set(id, c);
      }
    } catch {
      // No existir es lo normal la primera vez.
    }
  }
  if (chats.size === 0) await cargarDeDisco();
  const { state, saveCreds } = await cargarSesion(AUTH);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    markOnlineOnConnect: false,
    /*
     * Sin el historial completo.
     *
     * Con `true`, WhatsApp empuja todo el historial apenas se vincula, y es
     * justo donde se caía: el log mostraba "logging in..." y enseguida
     * "connection errored", con la sesión cerrada después. Un bloque enorme
     * en el momento más frágil de la conexión.
     *
     * Y tampoco lo necesitamos: la ventana es de tres días. Lo que WhatsApp
     * manda por defecto al vincular alcanza para eso.
     */
    syncFullHistory: false,
    /*
     * Un identificador estándar y no uno propio.
     *
     * Decía ["iPhone Purple — panel", "Chrome", "1.0.0"], que quedaba lindo en
     * la lista de dispositivos vinculados del teléfono, pero WhatsApp rechaza
     * la vinculación por código con descriptores que no reconoce. Lo lindo
     * costaba que no se pudiera vincular.
     */
    browser: Browsers.ubuntu("Chrome"),
  });

  socketActual = sock;
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("contacts.upsert", anotarContactos);
  sock.ev.on("contacts.update", anotarContactos);
  sock.ev.on("chats.upsert", anotarContactos);
  sock.ev.on("messaging-history.set", ({ messages, contacts, chats: listaDeChats }) => {
    anotarContactos(contacts);
    anotarContactos(listaDeChats);
    for (const m of messages ?? []) guardar(m);
  });
  sock.ev.on("messages.upsert", ({ messages }) => {
    for (const m of messages ?? []) guardar(m);
  });

  sock.ev.on("connection.update", async (u) => {
    // Llega cuando el QR fue escaneado y aceptado: desde acá ya no se ofrece
    // otro, que sería pisar el login que está entrando.
    if (u.isNewLogin) {
      estado.qr = null;
      anotar("escaneado", "Alguien escaneó el código");
      console.log("QR aceptado, entrando…");
    }

    if (u.qr) {
      /*
       * Cada QR nuevo es un intento más contra el cupo de la línea. Se cuentan
       * y, pasado el tope, se deja de pedir: un lector olvidado encendido no
       * puede seguir gastando vinculaciones solo.
       */
      intentosDeVinculacion += 1;
      estado.intentos = intentosDeVinculacion;
      if (intentosDeVinculacion > INTENTOS_MAXIMOS) return pausar();
      anotar("qr", `Código ${intentosDeVinculacion} de ${INTENTOS_MAXIMOS}`);

      estado.qr = u.qr;
      estado.vinculado = false;
      // Un QR nuevo es un intento de vinculación nuevo: lo que se haya
      // rechazado antes deja de aplicar, si no habría que reiniciar el
      // proceso para poder escanear la línea correcta.
      estado.lineaIncorrecta = false;
      estado.numero = null;
      /*
       * Acá antes se pedía un código nuevo en cada rotación del QR, y era un
       * error: el código cambiaba debajo de la persona mientras lo escribía, y
       * con un login en curso llegaba a matarlo.
       *
       * Ahora el código se pide una vez y se queda quieto hasta que alguien
       * pide otro desde el panel. Si WhatsApp lo venció, el intento falla y se
       * pide uno nuevo a mano: es un clic más y a cambio se sabe exactamente
       * cuál está en pantalla.
       */
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
      socketVivo = sock;
      // Conectó: la espera vuelve al piso, el contador de intentos también, y
      // la sesión se respalda, porque recién ahora se sabe que sirve.
      espera = ESPERA_MINIMA;
      intentosDeVinculacion = 0;
      estado.intentos = 0;
      estado.enPausa = false;
      anotar("conectado", propio || null);
      void respaldarSesion();
      void traerNombresDeGrupos(sock);
      /*
       * Los nombres de la agenda llegan solos únicamente al vincular. Si esta
       * sesión ya estaba vinculada, se piden una vez a su colección.
       */
      if (![...contactos.values()].some((c) => c.agenda)) {
        void sock
          .resyncAppState(["critical_unblock_low"], true)
          .catch((e) => console.error("No se pudo pedir la agenda:", e?.message ?? e));
      }
      console.log(`Conectado a WhatsApp como ${propio || "?"}.`);
    }
    if (u.connection === "close") {
      const codigo = u.lastDisconnect?.error?.output?.statusCode;
      if (codigo === DisconnectReason.loggedOut) {
        /*
         * Hay dos cosas distintas detrás del mismo código.
         *
         * Si ya estábamos vinculados, alguien cerró la sesión desde el
         * teléfono: reconectar en bucle solo generaría intentos fallidos, que
         * es lo que mira WhatsApp para bloquear una línea. Se corta y se avisa.
         *
         * Pero si nunca llegamos a vincular, es un intento de vinculación que
         * no prosperó, y quedarse muerto deja la pantalla ofreciendo un código
         * que ya no sirve. Ahí se arranca de nuevo con credenciales limpias.
         */
        /*
         * `creds.me` y no solo `registered`: una sesión recuperada del disco
         * puede traer `registered` en false aunque tenga identidad y sea
         * perfectamente válida.
         *
         * La distinción importa porque la otra rama BORRA las credenciales.
         * Con el chequeo incompleto, un 401 sobre una sesión buena se leía
         * como un intento de vinculación fallido y se la llevaba puesta:
         * costaba volver a escanear por un error de clasificación.
         *
         * Ante la duda, no se borra. Reconectar de más es gratis; perder la
         * sesión cuesta que alguien agarre el teléfono.
         */
        estado.ultimoRechazo = new Date().toISOString();
        if (state.creds.registered || state.creds.me) {
          estado.conexion = "desvinculado";
          anotar("rechazado", "WhatsApp no aceptó la sesión guardada (401)");
          console.error(
            "WhatsApp no aceptó la sesión guardada. Hay que volver a vincular."
          );
          return;
        }

        /*
         * Reconectar sin borrar nada.
         *
         * Acá antes se limpiaba la carpeta de sesión, y eso fue lo que se
         * llevó puesta una sesión que andaba: con las credenciales a medio
         * cargar, un 401 se leía como "la vinculación falló" cuando en
         * realidad era otra cosa.
         *
         * Baileys genera un QR nuevo solo si de verdad no hay credenciales,
         * así que no borrar no impide volver a vincular. Y si quedaron
         * corruptas, para eso está el respaldo y el endpoint que lo repone:
         * una decisión de una persona, no de un `catch`.
         */
        estado.conexion = "reintentando";
        estado.qr = null;
        anotar("rechazado", "El intento de vinculación no prosperó");
        console.log("El intento de vinculación no prosperó. Reintento…");
        if (!estado.enPausa) setTimeout(conectar, espera);
        espera = Math.min(espera * 2, ESPERA_MAXIMA);
        return;
      }
      /*
       * 515 no es un error: es lo que WhatsApp manda justo después de una
       * vinculación exitosa para pedir que se reconecte con las credenciales
       * nuevas. Hay que volver enseguida; esperar diez segundos como si fuera
       * un corte de red deja pasar el momento.
       */
      if (codigo === DisconnectReason.restartRequired) {
        console.log("Vinculación aceptada, reconectando con la sesión nueva…");
        setTimeout(conectar, 500);
        return;
      }

      // Cualquier otro corte es de red: se reintenta con una espera, no al toque.
      anotar("caida", `Reintenta en ${Math.round(espera / 1000)} s`);
      console.log(`Conexión caída, reintentando en ${Math.round(espera / 1000)} s…`);
      if (!estado.enPausa) setTimeout(conectar, espera);
      espera = Math.min(espera * 2, ESPERA_MAXIMA);
    }
  });
}

setInterval(podar, 3_600_000);

/*
 * Refresca el dólar cada hora. Va acá porque este proceso está siempre prendido
 * y un cron de Vercel en este plan corre como mucho una vez por día.
 */
if (process.env.SITIO_URL && process.env.CRON_SECRET) {
  setInterval(() => {
    fetch(new URL("/api/cotizacion", process.env.SITIO_URL), {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
      signal: AbortSignal.timeout(60_000),
    })
      .then(async (r) => console.log(`Cotización: HTTP ${r.status} ${await r.text()}`))
      .catch((e) =>
        console.error("No se pudo refrescar la cotización:", e?.message ?? e)
      );
  }, 3_600_000);
}

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
      /* En pausa = dejó de pedir vinculaciones porque nadie escaneaba. No es
         un error: está esperando que haya alguien del otro lado. */
      enPausa: estado.enPausa,
      intentos: estado.intentos,
      intentosMaximos: INTENTOS_MAXIMOS,
      ultimoRechazo: estado.ultimoRechazo,
      eventos: estado.eventos,
      sinTexto,
      /* La hora del lector, que es el reloj con el que están sellados los
         eventos. Comparar contra él y no contra el del sitio evita diferencias
         si los dos relojes no están en hora. */
      ahora: new Date().toISOString(),
      verificaNumero: Boolean(ESPERADO),
      /* Falta vincular si hay cualquiera de las dos vías esperando: el QR
         para escanear, o el código para escribir en el teléfono. */
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
      return responder(200, { svg: null, vinculado: estado.vinculado });
    }
    return qrSvg(estado.qr, { type: "svg", margin: 1, width: 280 })
      .then((svg) => responder(200, { svg, vinculado: false }))
      .catch(() => responder(200, { svg: null, vinculado: false }));
  }

  /*
   * El perfil se pide de a uno y cuando alguien lo mira, no para todos al
   * conectar. Con veinte proveedores, pedirlos todos de golpe son sesenta
   * llamadas seguidas sobre la misma línea.
   */
  if (url.pathname === "/perfil") {
    const id = url.searchParams.get("id");
    if (!id) return responder(400, { error: "Falta el id" });
    return traerPerfil(id)
      .then((p) => responder(200, p))
      .catch((e) => responder(502, { error: String(e?.message ?? e) }));
  }

  /*
   * Reponer la sesión desde el respaldo.
   *
   * Es destructivo —pisa las credenciales actuales— así que lo dispara una
   * persona y nunca un `catch`. Es justamente lo contrario de lo que hacía el
   * reintento automático, que borraba por su cuenta y se llevó puesta una
   * sesión buena.
   */
  if (url.pathname === "/restaurar-sesion") {
    return (async () => {
      try {
        await cp(`${AUTH}-respaldo`, AUTH, { recursive: true, force: true });
        console.log("Sesión repuesta desde el respaldo. Reconectando…");
        setTimeout(conectar, 1_000);
        return responder(200, { ok: true });
      } catch (e) {
        return responder(404, {
          error: `No hay respaldo para reponer: ${e?.message ?? e}`,
        });
      }
    })();
  }

  /*
   * El histórico, para recuperar lo que la ventana ya no tiene. Se lee de a
   * renglones y no de una: el archivo crece sin techo y cargarlo entero en
   * memoria sería reintroducir el problema que la poda vino a resolver.
   */
  if (url.pathname === "/historico") {
    const desde = url.searchParams.get("desde") ?? "";
    const tope = Math.min(Number(url.searchParams.get("tope") ?? 500), 2000);
    return (async () => {
      const filas = [];
      try {
        const lector = createInterface({
          input: createReadStream(HISTORICO, "utf8"),
          crlfDelay: Infinity,
        });
        for await (const linea of lector) {
          if (!linea) continue;
          try {
            const m = JSON.parse(linea);
            if (desde && m.fecha < desde) continue;
            filas.push(m);
            if (filas.length > tope) filas.shift();
          } catch {
            // Un renglón a medio escribir —el proceso murió justo ahí— no
            // puede invalidar los otros diez mil.
          }
        }
      } catch {
        // Todavía no existe: la primera vez es lo normal.
      }
      return responder(200, { desde, cantidad: filas.length, mensajes: filas });
    })();
  }

  if (url.pathname === "/reanudar") {
    estado.enPausa = false;
    intentosDeVinculacion = 0;
    estado.intentos = 0;
    espera = ESPERA_MINIMA;
    if (estado.vinculado) return responder(200, { ok: true, yaVinculado: true });
    anotar("reanudado", "Alguien pidió reintentar desde el panel");
    /*
     * Después de un 401 las credenciales guardadas están muertas: reconectar
     * con ellas da otro 401 y nunca llega a pedir un QR. Se apartan, sin
     * borrarlas, para que la conexión arranque limpia. Lo decide una persona.
     */
    const descartar = estado.conexion === "desvinculado";
    estado.conexion = "conectando";
    return (async () => {
      if (descartar) {
        await rename(AUTH, `${AUTH}-rechazada-${Date.now()}`).catch(() => {});
      }
      setTimeout(conectar, 200);
      return responder(200, { ok: true });
    })();
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
