/**
 * Ordena fotos-proveedor/ por producto.
 *
 * Lo que llega son carpetas con nombres como "WhatsApp Unknown 2026-09-03 at
 * 23.40.07" y archivos "WhatsApp Image 2026-08-27 at 08.44.40.jpeg". Nada de
 * eso dice de qué equipo es la foto, así que para encontrar algo había que
 * abrir las ciento y pico una por una.
 *
 * Después de correr esto queda:
 *
 *   fotos-proveedor/
 *     iphone-17-pro/
 *       iphone-17-pro-cosmic-orange-dorso.jpg
 *       ...
 *       origen.tsv          de qué archivo original salió cada uno
 *     _por-revisar/<lote>/  lo que todavía no está clasificado
 *     _descartado/<lote>/   flyers del proveedor, capturas, fotos de depósito
 *
 * La clasificación no la decide este script: la lee de clasificacion.tsv, que
 * se escribe mirando las miniaturas que deja `preparar.mjs`. Acá solo se
 * mueven y se renombran archivos.
 *
 * Uso: npm run proveedor:ordenar
 */
import { mkdir, readdir, readFile, rename, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const RAIZ = path.join(process.cwd(), "fotos-proveedor");
const TABLA = path.join(process.cwd(), "scripts", "proveedor", "clasificacion.tsv");

/** Nombre de carpeta original → nombre corto que se usa en la tabla. */
const LOTES = {
  "whatsapp-2026-09": "lote-agosto",
  "WhatsApp Unknown 2026-09-03 at 23.33.51": "lote-septiembre-a",
  "WhatsApp Unknown 2026-09-03 at 23.40.07": "lote-septiembre-b",
  "WhatsApp Unknown 2026-09-03 at 23.47.51": "lote-septiembre-c",
  "WhatsApp Unknown 2026-09-03 at 23.55.28": "lote-septiembre-d",
  "WhatsApp Unknown 2026-09-03 at 12.14.49": "lote-septiembre-g",
  "WhatsApp Unknown 2026-09-03 at 23.46.10": "lote-septiembre-f",
  "WhatsApp Unknown 2026-09-03 at 23.46.47": "lote-septiembre-e",
};

const filas = (await readFile(TABLA, "utf8"))
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"))
  .map((l) => l.split("\t"));

const origenes = new Map();
const paraCatalogo = [];

/**
 * Nombre final de un archivo.
 *
 * Los descartes llevan el lote y el id adelante del motivo. Sin eso, dos fotos
 * de depósito de lotes distintos se llamaban igual y la segunda pisaba a la
 * primera: así se perdieron treinta y nueve archivos en una corrida, y como
 * fotos-proveedor no va al repo, no había de dónde recuperarlos salvo la
 * descarga original.
 */
function nombreDe(elegido, lote, id, ext) {
  return elegido.destino.startsWith("_")
    ? `${lote}-${id}-${elegido.nombre}${ext}`
    : `${elegido.nombre}${ext}`;
}

/** lote → id → { destino, nombre, orden } */
const decidido = new Map();
for (const [lote, id, destino, nombre, orden] of filas) {
  if (!decidido.has(lote)) decidido.set(lote, new Map());
  decidido.get(lote).set(id, { destino, nombre, orden });
}

// Segunda pasada sobre lo que ya se había ordenado antes y quedó pendiente.
// Ahí los archivos ya se llaman <lote>-<id>, así que el id sale del nombre y no
// hace falta el mapa del lote original, que se borró al ordenarlo.
const pendientes = path.join(RAIZ, "_por-revisar");
if (existsSync(pendientes)) {
  for (const lote of await readdir(pendientes)) {
    const carpeta = path.join(pendientes, lote);
    for (const archivo of await readdir(carpeta)) {
      if (archivo === "origen.tsv") continue;
      const id = path.basename(archivo, path.extname(archivo)).replace(`${lote}-`, "");
      const elegido = decidido.get(lote)?.get(id);
      if (!elegido) continue;

      const destino = elegido.destino.startsWith("_")
        ? path.join(RAIZ, elegido.destino, lote)
        : path.join(RAIZ, elegido.destino);
      await mkdir(destino, { recursive: true });
      const nombre = nombreDe(elegido, lote, id, path.extname(archivo));
      await rename(path.join(carpeta, archivo), path.join(destino, nombre));

      if (!origenes.has(destino)) origenes.set(destino, []);
      origenes.get(destino).push([nombre, lote, archivo]);
      if (elegido.orden) paraCatalogo.push([elegido.destino, nombre, elegido.orden]);
    }
  }
}

for (const [carpeta, lote] of Object.entries(LOTES)) {
  const base = path.join(RAIZ, carpeta);
  if (!existsSync(base)) continue;

  const mapa = (await readFile(path.join(base, ".revision", "mapa.tsv"), "utf8"))
    .split("\n")
    .filter(Boolean)
    .map((l) => l.split("\t"));

  for (const [id, , archivo] of mapa) {
    const ext = path.extname(archivo).toLowerCase();
    const elegido = decidido.get(lote)?.get(id);

    // Sin decisión todavía: no se tira ni se publica, queda a la vista.
    const destino = elegido?.destino ?? "_por-revisar";
    const carpetaDestino = destino.startsWith("_")
      ? path.join(RAIZ, destino, lote)
      : path.join(RAIZ, destino);
    const nombre = elegido ? nombreDe(elegido, lote, id, ext) : `${lote}-${id}${ext}`;

    await mkdir(carpetaDestino, { recursive: true });
    await rename(path.join(base, archivo), path.join(carpetaDestino, nombre));

    if (!origenes.has(carpetaDestino)) origenes.set(carpetaDestino, []);
    origenes.get(carpetaDestino).push([nombre, lote, archivo]);

    if (elegido?.orden) paraCatalogo.push([destino, nombre, elegido.orden]);
  }

  await rm(base, { recursive: true, force: true });
}

for (const [carpeta, filas] of origenes) {
  await writeFile(
    path.join(carpeta, "origen.tsv"),
    "# archivo\tlote\tnombre original que mandó el proveedor\n" +
      filas.map((f) => f.join("\t")).join("\n") +
      "\n",
    "utf8"
  );
}

await writeFile(
  path.join(RAIZ, "publicar.tsv"),
  "# producto\tarchivo\torden en la galería\n" +
    paraCatalogo.map((f) => f.join("\t")).join("\n") +
    "\n",
  "utf8"
);

const productos = new Set(paraCatalogo.map((f) => f[0]));
console.log(
  `Ordenadas. ${paraCatalogo.length} archivos marcados para publicar en ${productos.size} productos.`
);
console.log("Para publicarlos: npm run proveedor:publicar");
