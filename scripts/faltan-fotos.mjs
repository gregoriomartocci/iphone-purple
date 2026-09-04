/**
 * Lista los productos que todavía no tienen ninguna foto.
 *
 * Es la entrada del pedido que se le pega a la extensión de Chrome
 * (docs/prompt-busqueda-fotos.md): slug, marca, nombre y colores en stock,
 * que es lo mínimo para buscar el modelo exacto y no uno parecido.
 *
 * Uso: npm run fotos:faltan
 */
import { PRODUCTS } from "../lib/data/seed.ts";
import { FOTOS_PRODUCTO } from "../lib/data/fotos.generado.ts";

const sinFoto = PRODUCTS.filter((p) => !FOTOS_PRODUCTO[p.slug]?.length);

for (const p of sinFoto) {
  const colores = [...new Set(p.variants.map((v) => v.color))].join(", ");
  console.log(`${p.slug}\t${p.brand} ${p.name}\tcolores: ${colores}`);
}

console.error(`\n${sinFoto.length} productos sin foto.`);
