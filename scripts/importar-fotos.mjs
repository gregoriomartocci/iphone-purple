/**
 * Importa una carpeta de fotos bajadas por la extensión de Chrome.
 *
 * Espera archivos llamados <slug>-<n>.<ext>, que es el nombre que pide
 * docs/prompt-busqueda-fotos.md. El slug se resuelve contra el catálogo, así
 * que un nombre que no corresponde a ningún producto no entra: queda apartado
 * en _sin-producto/ para mirarlo, en vez de publicarse en el lugar equivocado.
 *
 * Las fotos no van directo al catálogo. Se copian a fotos-proveedor/<slug>/,
 * que es donde vive el material antes de elegirlo, y recién se publican después
 * de mirarlas. Es el mismo paso que evitó que se colaran las veintidós que
 * había que borrar.
 *
 * Uso: npm run fotos:importar <carpeta>
 */
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { PRODUCTS } from "../lib/data/seed.ts";

const origen = process.argv[2];
if (!origen) {
  console.error("Uso: npm run fotos:importar ~/Descargas/fotos-iphone-purple");
  process.exit(1);
}

const DESTINO = path.join(process.cwd(), "fotos-proveedor");
const SLUGS = new Set(PRODUCTS.map((p) => p.slug));
const IMG = /\.(jpe?g|png|webp|avif)$/i;

/**
 * De "iphone-17-pro-max-2.jpg" saca "iphone-17-pro-max" y 2.
 *
 * Se prueba el prefijo más largo primero: "iphone-17-pro-max" y "iphone-17"
 * son los dos slugs válidos, y quedarse con el primero que coincida mandaría
 * las fotos del Pro Max a la ficha del 17.
 */
function resolver(nombre) {
  const base = path
    .basename(nombre, path.extname(nombre))
    // El navegador antepone el nombre de la carpeta y numera las repeticiones:
    // "fotos-iphone-purple_iphone-16-pro-max-1 (3).jpg". Sin sacar las dos
    // cosas, el slug no coincide con ningún producto y la foto queda afuera.
    .replace(/^fotos-iphone-purple[_-]/i, "")
    .replace(/\s*\(\d+\)$/, "")
    .trim();
  const partes = base.split("-");
  for (let i = partes.length - 1; i > 0; i--) {
    const slug = partes.slice(0, i).join("-");
    if (SLUGS.has(slug)) return { slug, orden: partes.slice(i).join("-") || "1" };
  }
  return null;
}

const archivos = (await readdir(origen)).filter((f) => IMG.test(f)).sort();
const porProducto = new Map();
const huerfanos = [];

for (const nombre of archivos) {
  const r = resolver(nombre);
  if (!r) {
    huerfanos.push(nombre);
    continue;
  }
  const carpeta = path.join(DESTINO, r.slug);
  await mkdir(carpeta, { recursive: true });

  // Varias fotos pueden venir con el mismo número, porque el navegador
  // desambigua con "(1)", "(2)" y eso se descarta al resolver el slug. Se
  // numeran por orden de llegada para que ninguna pise a la anterior.
  const yaHay = (porProducto.get(r.slug) ?? []).length;
  const salida = path.join(carpeta, `buscada-${r.orden}-${yaHay + 1}.jpg`);
  const { width, height } = await sharp(path.join(origen, nombre)).metadata();
  await sharp(path.join(origen, nombre))
    .rotate()
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toFile(salida);

  if (!porProducto.has(r.slug)) porProducto.set(r.slug, []);
  porProducto.get(r.slug).push(`${path.basename(salida)} (${width}×${height})`);
}

if (huerfanos.length > 0) {
  const aparte = path.join(DESTINO, "_sin-producto");
  await mkdir(aparte, { recursive: true });
  for (const nombre of huerfanos) {
    await sharp(path.join(origen, nombre))
      .rotate()
      .jpeg({ quality: 88 })
      .toFile(path.join(aparte, path.basename(nombre, path.extname(nombre)) + ".jpg"));
  }
  await writeFile(
    path.join(aparte, "LEEME.txt"),
    "El nombre de estos archivos no coincide con ningún producto del catálogo.\n",
    "utf8"
  );
}

for (const [slug, fotos] of [...porProducto].sort()) {
  console.log(`${slug}: ${fotos.join(", ")}`);
}
console.log(
  `\n${archivos.length - huerfanos.length} fotos en ${porProducto.size} productos.`
);
if (huerfanos.length > 0) {
  console.log(
    `${huerfanos.length} sin producto reconocible, apartadas en fotos-proveedor/_sin-producto/:`
  );
  for (const h of huerfanos) console.log("  · " + h);
}
