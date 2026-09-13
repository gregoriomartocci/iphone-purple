/**
 * Encuadra en el lugar todos los renders del catálogo que no lo estén.
 *
 * Recorre el índice, toma lo que está clasificado como render sobre fondo
 * claro, y a cada archivo le recorta el aire y le pone el margen parejo de
 * `lib/encuadre.mjs`. Los que ya están encuadrados se saltean, así se puede
 * correr las veces que haga falta sin recodificar todo el catálogo.
 *
 * Después hay que reindexar: cambia el tamaño y puede cambiar el color de
 * fondo medido.
 *
 * Uso: npm run fotos:encuadrar
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { FOTOS_PRODUCTO } from "../lib/data/fotos.generado.ts";
import { encuadrar } from "./lib/encuadre.mjs";

const RAIZ = path.join(process.cwd(), "public");

/** Un fondo claro: la misma vara del indexador, los tres canales por encima de 232. */
function claro(hex) {
  if (!hex) return false;
  const m = hex.replace("#", "");
  return [0, 2, 4].every((i) => parseInt(m.slice(i, i + 2), 16) > 232);
}

let vistas = 0;
let cambiadas = 0;
for (const [slug, fotos] of Object.entries(FOTOS_PRODUCTO)) {
  for (const f of fotos) {
    if (f.video || f.recorte !== "render" || !claro(f.fondo)) continue;
    vistas++;
    // La ruta pública puede traer ?v= de caché; el archivo no.
    const archivo = path.join(RAIZ, f.url.split("?")[0]);
    const pipeline = await encuadrar(archivo);
    if (!pipeline) continue;
    // A un buffer primero: sharp no puede leer y escribir el mismo archivo.
    const buffer = await pipeline.jpeg({ quality: 88 }).toBuffer();
    await writeFile(archivo, buffer);
    cambiadas++;
    console.log(`✓ ${slug}/${path.basename(archivo)}`);
  }
}

console.log(`\n${vistas} renders revisados · ${cambiadas} encuadrados.`);
if (cambiadas > 0) console.log("Falta reindexar: npm run fotos:indexar");
