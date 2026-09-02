/**
 * Baja las fotos de catálogo a public/productos/<slug>/ y genera el índice
 * lib/data/fotos.generado.ts con los créditos de cada una.
 *
 * Por qué se descargan en vez de enlazarlas: las fotos quedan servidas desde
 * el propio dominio, así no dependen de que un tercero no las mueva, no hay
 * que abrir hosts en la CSP ni en next.config, y next/image puede
 * optimizarlas.
 *
 * Uso: npm run fotos
 *
 * Las que están acá son de Wikimedia Commons y son del producto exacto: se
 * revisaron una por una, porque la búsqueda mezcla imitaciones, cajas y
 * modelos parecidos de otra generación. Una foto que no es del producto es
 * peor que no tener foto.
 *
 * Para sumar fotos propias no hace falta tocar este archivo: alcanza con
 * dejarlas en public/productos/<slug>/ y tienen prioridad sobre estas.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const API = "https://commons.wikimedia.org/w/api.php";
const RAIZ = path.join(process.cwd(), "public", "productos");

/** slug del producto → archivos de Commons, en el orden en que se muestran. */
const FOTOS = {
  "nintendo-switch-oled": [
    "Nintendo switch OLED model - 1.jpg",
    "Nintendo switch OLED model - 2.jpg",
    "Switch oled console.jpg",
  ],
  "nintendo-switch-2-mario-kart": [
    "Nintendo Switch 2 in Docking Console.jpg",
    "Nintendo Switch 2 in Handheld Mode.jpg",
    "Nintendo Switch 2 Joy-Con 2 Blue and Orange.jpg",
  ],
  "logitech-g29-driving-force": ["Logitech G29 steering wheel.jpg"],
  "playstation-5-slim": [
    "PlayStation 5 and DualSense.jpg",
    "Playstation 5.jpg",
    "PlayStation 5 and DualSense (2).jpg",
  ],
  "redmi-15c": ["Redmi 15C front.jpg", "Redmi 15C back.jpg"],
  "garmin-instinct-2s-solar": ["Garmin Instinct 2s.jpg"],
};

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Pide a Commons con reintentos. La API corta con 429 si se le pega seguido,
 * así que ante un rechazo se espera cada vez más antes de volver a probar.
 */
async function pedir(url) {
  // Ritmo fijo entre pedidos: Commons tolera mal las ráfagas y con esto no
  // llega a cortar. Son pocas decenas de archivos, la espera no molesta.
  await esperar(1200);
  for (let intento = 0; intento < 6; intento++) {
    const r = await fetch(url, { headers: { "User-Agent": "iphonepurple-fotos/1.0" } });
    if (r.ok) return r;
    if (r.status !== 429 && r.status < 500)
      throw new Error(`Commons respondió ${r.status}`);
    await esperar(4000 * (intento + 1));
  }
  throw new Error("Commons sigue rechazando pedidos; probá de nuevo más tarde");
}

/** Pide a Commons la URL de descarga y la ficha de autoría de un archivo. */
async function ficha(archivo) {
  const url =
    `${API}?action=query&titles=${encodeURIComponent(`File:${archivo}`)}` +
    `&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1600&format=json`;
  const r = await pedir(url);
  const d = await r.json();
  const pagina = Object.values(d?.query?.pages ?? {})[0];
  const info = pagina?.imageinfo?.[0];
  if (!info) throw new Error(`Commons no conoce el archivo ${archivo}`);
  const meta = info.extmetadata ?? {};
  const limpiar = (v) =>
    (v ?? "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  return {
    // thumburl viene redimensionada a 1600 px: alcanza y de sobra, y evita
    // bajar originales de 20 MB.
    descarga: info.thumburl ?? info.url,
    autor: limpiar(meta.Artist?.value) || "Wikimedia Commons",
    licencia: limpiar(meta.LicenseShortName?.value) || "ver Commons",
    origen: info.descriptionurl,
  };
}

const indice = {};

for (const [slug, archivos] of Object.entries(FOTOS)) {
  await mkdir(path.join(RAIZ, slug), { recursive: true });
  indice[slug] = [];

  for (const [i, archivo] of archivos.entries()) {
    const { descarga, autor, licencia, origen } = await ficha(archivo);
    const r = await pedir(descarga);
    const nombre = `${i + 1}.jpg`;
    await writeFile(path.join(RAIZ, slug, nombre), Buffer.from(await r.arrayBuffer()));
    indice[slug].push({ url: `/productos/${slug}/${nombre}`, autor, licencia, origen });
    console.log(`✓ ${slug}/${nombre}  ${licencia} — ${autor}`);
  }
}

const cabecera = `// GENERADO por scripts/descargar-fotos.mjs — no editar a mano.
// Fotos de catálogo servidas desde public/productos/, con su autoría.
// Las licencias Creative Commons exigen crédito visible: lo muestra la ficha
// de producto.

export type CreditoFoto = {
  url: string;
  autor: string;
  licencia: string;
  origen: string;
};

export const FOTOS_PRODUCTO: Record<string, CreditoFoto[]> = `;

await writeFile(
  path.join(process.cwd(), "lib", "data", "fotos.generado.ts"),
  `${cabecera}${JSON.stringify(indice, null, 2)};\n`
);

const total = Object.values(indice).reduce((n, l) => n + l.length, 0);
console.log(`\n${total} fotos en ${Object.keys(indice).length} productos.`);
