/**
 * Lee los mensajes recientes de los proveedores desde WhatsApp.
 *
 * Corre en tu máquina, no en Vercel: una sesión de WhatsApp Web es una
 * conexión abierta con estado en disco, y las funciones de Vercel se apagan
 * entre pedido y pedido. Por eso esto es un comando local que deja un archivo,
 * y el panel lo lee de ahí.
 *
 *   npm run whatsapp          la primera vez pide escanear un QR
 *   npm run whatsapp -- 3     los últimos 3 días (por defecto, 2)
 *
 * SOLO LECTURA. No manda mensajes, no marca como leído y no se pone en línea.
 * Las tres cosas son deliberadas: lo que hace que WhatsApp bloquee un número
 * es el envío automatizado, y `markOnlineOnConnect: false` evita además que el
 * teléfono deje de recibir notificaciones mientras esto está conectado.
 *
 * La sesión queda en .whatsapp-auth/ y no va al repo: son las credenciales de
 * la línea, equivalen a la cuenta.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeWASocket,
  // Con su nombre original, el linter la toma por un hook de React y falla:
  // la regla se guía solo por el prefijo "use".
  useMultiFileAuthState as cargarSesion,
} from "baileys";
import qr from "qrcode-terminal";

const DIAS = Number(process.argv[2] ?? 2);
const AUTH = path.join(process.cwd(), ".whatsapp-auth");
const SALIDA = path.join(process.cwd(), "datos-proveedor");

/** Cuánto se espera sin mensajes nuevos antes de dar la sincronización por terminada. */
const QUIETO_MS = 12_000;
/** Techo duro, por si el historial no para de llegar. */
const TOPE_MS = 180_000;

const desde = Date.now() - DIAS * 86_400_000;

/** jid → { nombre, mensajes: [{ fecha, texto }] } */
const chats = new Map();

/**
 * Saca el texto de un mensaje, sea cual sea la forma que tenga.
 *
 * Las listas llegan de todas: como texto suelto, como pie de una foto de la
 * mercadería, o citando el mensaje anterior. Si solo se leyera `conversation`
 * se perderían justo las que vienen con foto, que son la mayoría.
 */
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
  if (!marca || marca < desde) return;

  const texto = textoDe(m);
  // Sin texto no hay lista que leer: una foto sola no dice precios.
  if (!texto || texto.trim().length < 8) return;

  if (!chats.has(jid)) {
    chats.set(jid, { jid, nombre: m.pushName ?? null, mensajes: new Map() });
  }
  const chat = chats.get(jid);
  if (!chat.nombre && m.pushName) chat.nombre = m.pushName;
  // Por id, porque el historial y los mensajes en vivo se pisan.
  chat.mensajes.set(m.key.id, {
    fecha: new Date(marca).toISOString(),
    mio: Boolean(m.key.fromMe),
    texto: texto.trim(),
  });
}

async function main() {
  await mkdir(AUTH, { recursive: true });
  await mkdir(SALIDA, { recursive: true });

  const { state, saveCreds } = await cargarSesion(AUTH);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    // Que el teléfono siga recibiendo notificaciones mientras esto lee.
    markOnlineOnConnect: false,
    // Trae el historial que el teléfono tenga para dar; sin esto solo llegan
    // los mensajes nuevos y la primera corrida vuelve casi vacía.
    syncFullHistory: true,
    browser: ["iPhone Purple — panel", "Chrome", "1.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  let ultimo = Date.now();
  const arranque = Date.now();

  sock.ev.on("messaging-history.set", ({ messages }) => {
    for (const m of messages ?? []) guardar(m);
    ultimo = Date.now();
    process.stdout.write(`\r  ${chats.size} chats, ${totalMensajes()} mensajes…`);
  });

  sock.ev.on("messages.upsert", ({ messages }) => {
    for (const m of messages ?? []) guardar(m);
    ultimo = Date.now();
  });

  sock.ev.on("connection.update", (u) => {
    if (u.qr) {
      console.log("\nEscaneá este código con la línea del negocio:");
      console.log("WhatsApp → Dispositivos vinculados → Vincular dispositivo\n");
      qr.generate(u.qr, { small: true });
    }
    if (u.connection === "open") {
      console.log("\nConectado. Bajando el historial…\n");
      ultimo = Date.now();
    }
    if (u.connection === "close") {
      const codigo = u.lastDisconnect?.error?.output?.statusCode;
      if (codigo === DisconnectReason.loggedOut) {
        console.error(
          "\nLa sesión se cerró desde el teléfono. Borrá .whatsapp-auth y volvé a escanear."
        );
        process.exit(1);
      }
      console.error("\nSe cortó la conexión. Volvé a correr el comando.");
      process.exit(1);
    }
  });

  const totalMensajes = () =>
    [...chats.values()].reduce((n, c) => n + c.mensajes.size, 0);

  // Se espera a que el historial deje de llegar. No hay un evento que diga
  // "terminé": llega por tandas y simplemente para.
  await new Promise((listo) => {
    const reloj = setInterval(() => {
      const quieto = Date.now() - ultimo > QUIETO_MS;
      const pasado = Date.now() - arranque > TOPE_MS;
      if (quieto || pasado) {
        clearInterval(reloj);
        listo();
      }
    }, 1000);
  });

  const salida = [...chats.values()]
    .map((c) => ({
      jid: c.jid,
      nombre: c.nombre,
      telefono: c.jid.split("@")[0],
      grupo: c.jid.endsWith("@g.us"),
      mensajes: [...c.mensajes.values()].sort((a, b) => a.fecha.localeCompare(b.fecha)),
    }))
    // Los chats con más texto primero: son los que traen listas.
    .sort((a, b) => b.mensajes.length - a.mensajes.length);

  const archivo = path.join(
    SALIDA,
    `whatsapp-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.json`
  );
  await writeFile(
    archivo,
    JSON.stringify(
      { dias: DIAS, generado: new Date().toISOString(), chats: salida },
      null,
      2
    ),
    "utf8"
  );

  console.log(`\n\n${salida.length} chats con mensajes en los últimos ${DIAS} días.`);
  for (const c of salida.slice(0, 12)) {
    console.log(
      `  ${String(c.mensajes.length).padStart(3)} mensajes · ${c.nombre ?? c.telefono}${c.grupo ? " (grupo)" : ""}`
    );
  }
  if (salida.length > 12) console.log(`  … y ${salida.length - 12} chats más.`);
  console.log(`\nGuardado en ${path.relative(process.cwd(), archivo)}`);
  console.log("Abrilo desde el panel: /admin/importar");

  await sock.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("\n" + (e?.message ?? e));
  process.exit(1);
});
