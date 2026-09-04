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
import { mkdir, readFile, rename, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const RAIZ = path.join(process.cwd(), "fotos-proveedor");
const TABLA = path.join(process.cwd(), "scripts", "proveedor", "clasificacion.tsv");

/** Nombre de carpeta original → nombre corto que se usa en la tabla. */
const LOTES = {
  "whatsapp-2026-09": "lote-agosto",
  "WhatsApp Unknown 2026-09-03 at 23.33.51": "lote-septiembre-a",
  "WhatsApp Unknown 2026-09-03 at 23.40.07": "lote-septiembre-b",
};

const filas = (await readFile(TABLA, "utf8"))
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"))
  .map((l) => l.split("\t"));

/** lote → id → { destino, nombre, orden } */
const decidido = new Map();
for (const [lote, id, destino, nombre, orden] of filas) {
  if (!decidido.has(lote)) decidido.set(lote, new Map());
  decidido.get(lote).set(id, { destino, nombre, orden });
}

const origenes = new Map();
const paraCatalogo = [];

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
    const nombre = elegido?.nombre ?? `${lote}-${id}`;

    await mkdir(carpetaDestino, { recursive: true });
    await rename(path.join(base, archivo), path.join(carpetaDestino, nombre + ext));

    if (!origenes.has(carpetaDestino)) origenes.set(carpetaDestino, []);
    origenes.get(carpetaDestino).push([nombre + ext, lote, archivo]);

    if (elegido?.orden) paraCatalogo.push([destino, nombre + ext, elegido.orden]);
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
