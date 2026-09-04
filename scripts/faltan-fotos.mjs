/**
 * Arma el pedido de fotos que faltan, listo para pegarle a la extensión de
 * Chrome (docs/prompt-busqueda-fotos.md).
 *
 * Lista cada producto sin imagen con marca, nombre, colores en stock y —lo
 * importante— el nombre exacto de archivo con el que hay que guardar cada
 * foto. Sin eso, la carpeta que vuelve es un montón de "descarga (3).jpg" y
 * hay que abrir una por una para saber de qué equipo es.
 *
 * Uso: npm run fotos:faltan
 */
import { PRODUCTS } from "../lib/data/seed.ts";
import { FOTOS_PRODUCTO } from "../lib/data/fotos.generado.ts";

const sinFoto = PRODUCTS.filter((p) => !FOTOS_PRODUCTO[p.slug]?.length);

for (const p of sinFoto) {
  const colores = [...new Set(p.variants.map((v) => v.color))];
  console.log(`${p.brand} ${p.name}`);
  console.log(`  colores en stock: ${colores.join(", ") || "—"}`);
  console.log(`  guardar como: ${p.slug}-1.jpg, ${p.slug}-2.jpg, ${p.slug}-3.jpg`);
  console.log("");
}

console.error(`${sinFoto.length} productos sin foto.`);
