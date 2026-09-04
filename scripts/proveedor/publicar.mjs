/**
 * Copia al catálogo las fotos ya ordenadas que están marcadas para publicar.
 *
 * Lee fotos-proveedor/publicar.tsv, que arma `ordenar.mjs` con las filas de la
 * clasificación que tienen orden. El orden es el número con el que se guarda:
 * 1 es la que sale en la grilla, y los videos van últimos porque la galería
 * los muestra al final.
 *
 * De cada foto se saca la orientación de la cámara y los metadatos: vienen del
 * teléfono del proveedor y pueden traer GPS. Los videos se copian tal cual;
 * recodificarlos sin necesidad solo empeora la imagen.
 *
 * Uso: npm run proveedor:publicar
 */
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const RAIZ = path.join(process.cwd(), "fotos-proveedor");
const DESTINO = path.join(process.cwd(), "public", "productos");
const VIDEOS = /\.(mp4|mov|webm)$/i;

const filas = (await readFile(path.join(RAIZ, "publicar.tsv"), "utf8"))
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"))
  .map((l) => l.split("\t"));

const tocados = new Set();

for (const [slug, archivo, orden] of filas) {
  const carpeta = path.join(DESTINO, slug);
  await mkdir(carpeta, { recursive: true });
  tocados.add(carpeta);

  const fuente = path.join(RAIZ, slug, archivo);
  if (VIDEOS.test(archivo)) {
    await copyFile(fuente, path.join(carpeta, `${orden}.mp4`));
    console.log(`✓ ${slug}/${orden}.mp4`);
  } else {
    await sharp(fuente)
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 86 })
      .toFile(path.join(carpeta, `${orden}.jpg`));
    console.log(`✓ ${slug}/${orden}.jpg`);
  }
}

// Marca vacía: nada de estas carpetas viene de Commons, así que el descargador
// no las pisa y la ficha no acredita a nadie.
for (const carpeta of tocados) {
  await writeFile(path.join(carpeta, ".commons.json"), "{}", "utf8");
}

console.log(`\n${filas.length} archivos en ${tocados.size} productos.`);
