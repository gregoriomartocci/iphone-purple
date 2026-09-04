/**
 * Copia al catálogo las fotos y videos elegidos de una carpeta de proveedor.
 *
 * Se le pasa un archivo de mapeo con tres columnas separadas por tabulaciones:
 *
 *   slug-del-producto <TAB> id-de-la-miniatura <TAB> orden
 *
 * El orden es el número con el que se guarda: 1 es la que sale en la grilla
 * del catálogo, y los videos se numeran últimos porque la galería los muestra
 * al final. Las líneas que empiezan con # se ignoran.
 *
 * Qué hace con cada archivo:
 *
 *   · Lo endereza según la orientación de la cámara y lo achica a 1600 px.
 *   · Le saca los metadatos. Las fotos vienen del teléfono del proveedor y
 *     pueden traer GPS y modelo de cámara; nada de eso tiene que publicarse.
 *   · Deja una marca vacía en la carpeta, para que el descargador de Commons
 *     sepa que esos archivos no son suyos y no los pise.
 *
 * Los videos se copian tal cual: recodificarlos sin necesidad solo empeora la
 * imagen.
 *
 * Uso: npm run proveedor:aplicar fotos-proveedor/<carpeta> <mapeo.tsv>
 */
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [origen, mapeo] = process.argv.slice(2);
if (!origen || !mapeo) {
  console.error("Uso: npm run proveedor:aplicar fotos-proveedor/<carpeta> <mapeo.tsv>");
  process.exit(1);
}

const DESTINO = path.join(process.cwd(), "public", "productos");
const VIDEOS = /\.(mp4|mov|webm)$/i;

/** id de miniatura → nombre del archivo original. */
const mapa = new Map(
  (await readFile(path.join(origen, ".revision", "mapa.tsv"), "utf8"))
    .split("\n")
    .filter(Boolean)
    .map((l) => l.split("\t"))
    .map(([id, , nombre]) => [id, nombre])
);

const lineas = (await readFile(mapeo, "utf8"))
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"));

const tocados = new Set();

for (const linea of lineas) {
  const [slug, id, orden] = linea.split(/\s+/);
  const nombre = mapa.get(id);
  if (!nombre) {
    console.error(`✗ ${id}: no está en el mapa de ${origen}`);
    continue;
  }

  const carpeta = path.join(DESTINO, slug);
  await mkdir(carpeta, { recursive: true });
  tocados.add(carpeta);

  const fuente = path.join(origen, nombre);
  if (VIDEOS.test(nombre)) {
    const salida = path.join(carpeta, `${orden}.mp4`);
    await copyFile(fuente, salida);
    console.log(`✓ ${slug}/${orden}.mp4  (video)`);
  } else {
    const salida = path.join(carpeta, `${orden}.jpg`);
    await sharp(fuente)
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 86 })
      .toFile(salida);
    console.log(`✓ ${slug}/${orden}.jpg`);
  }
}

for (const carpeta of tocados) {
  await writeFile(path.join(carpeta, ".commons.json"), "{}", "utf8");
}

console.log(`\n${lineas.length} archivos en ${tocados.size} productos.`);
console.log("Falta armar el índice: npm run fotos:indexar");
