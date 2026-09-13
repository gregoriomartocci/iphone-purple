/**
 * Escribe docs/pedido-galeria.md: el pedido de SEGUNDAS y TERCERAS fotos.
 *
 * `fotos:pedido` cubre la portada: qué producto no tiene ninguna foto o abre
 * con una que no sirve. Este cubre lo que viene después: que cada ficha tenga
 * varias tomas —dorso, perfil, abierta, con la malla— y no una sola. Se pide
 * para todo producto con menos de tres fotos, y se numera a partir de la que
 * sigue a la última que ya tiene, así lo que llega no pisa nada.
 *
 * La exigencia cambia con el estado. Un sellado quiere solo estudio: la misma
 * regla que la portada, para toda la galería (docs/criterio-fotos.md). Un
 * seminuevo admite la foto real del equipo, pero cuidada: no es lo mismo el
 * equipo sobre un fondo liso con luz pareja que tirado en un escritorio.
 *
 * Uso: npm run fotos:pedido-galeria
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { PRODUCTS } from "../lib/data/seed.ts";
import { FOTOS_PRODUCTO } from "../lib/data/fotos.generado.ts";
import { CATEGORY_LABELS } from "../types/index.ts";

/** Cuántas fotos se quiere que tenga cada ficha, como mínimo. */
const OBJETIVO = 3;

/**
 * Qué tomas pedir además de la portada, por categoría. La portada ya es el
 * dorso (celulares) o los tres cuartos (notebooks), así que acá van las que
 * la complementan. Se piden en este orden y se corta en las que falten.
 */
const TOMAS = {
  celular: [
    "de frente con la pantalla apagada",
    "de perfil, mostrando el borde y los botones",
  ],
  tablet: ["de frente con la pantalla apagada", "de canto, mostrando el grosor"],
  notebook: ["cerrada, vista desde arriba", "de perfil, abierta, mostrando el grosor"],
  reloj: ["de frente con la esfera encendida", "de perfil, mostrando la corona"],
  audio: [
    "el estuche abierto con los auriculares adentro",
    "un auricular solo, de cerca",
  ],
  consola: ["la consola sola, de frente", "el joystick solo, de tres cuartos"],
  hogar: ["de tres cuartos", "un detalle del cabezal o los accesorios"],
  accesorio: ["de frente", "de perfil"],
};

const filas = [];
for (const p of PRODUCTS) {
  const fotos = (FOTOS_PRODUCTO[p.slug] ?? []).filter((f) => !f.video);
  if (fotos.length === 0 || fotos.length >= OBJETIVO) continue;

  // El número que sigue al último archivo que ya existe, no a la cantidad:
  // una galería con 1.jpg y 3.jpg tiene dos fotos pero el siguiente es el 4.
  const ultimo = Math.max(
    ...fotos.map((f) => parseInt(path.basename(f.url.split("?")[0]), 10) || 0)
  );
  const faltan = OBJETIVO - fotos.length;
  const tomas = (TOMAS[p.category] ?? TOMAS.accesorio).slice(0, faltan);
  const nombres = tomas.map((_, i) => `\`${p.slug}-${ultimo + 1 + i}.jpg\``);
  const sellado = p.variants.every((v) => v.grade === "sellado");
  const colores = [...new Set(p.variants.map((v) => v.color))].filter(Boolean);

  filas.push({
    categoria: CATEGORY_LABELS[p.category] ?? p.category,
    linea: `- ${nombres.join(" ")} · ${p.brand} ${p.name} — ${tomas.join("; ")}${
      colores.length ? ` · colores: ${colores.join(", ")}` : ""
    }${sellado ? "" : " · (seminuevo: admite foto real, cuidada)"}`,
  });
}

const porCategoria = new Map();
for (const f of filas) {
  if (!porCategoria.has(f.categoria)) porCategoria.set(f.categoria, []);
  porCategoria.get(f.categoria).push(f.linea);
}

let md = `# Pedido de galería

GENERADO por \`npm run fotos:pedido-galeria\`. Pide segundas y terceras fotos
para todo producto que tenga menos de ${OBJETIVO}. Se regenera solo: cada foto que
entra saca una línea.

Son **${filas.length} productos** con galería incompleta.

Copiá todo lo que está entre las líneas y pegalo en la extensión de Claude en
Chrome. Cuando termine:

    npm run fotos:importar ~/Downloads

---

Buscá fotos de producto ADICIONALES para una tienda de electrónica y
descargalas a la carpeta de descargas, cada una con el nombre exacto que se
pide más abajo. Cada producto ya tiene su foto principal; lo que se busca ahora
son otras tomas del mismo equipo —de frente, de perfil, cerrada, abierta— para
que la ficha muestre más de una.

**Cómo tienen que ser:** foto de estudio, el producto solo sobre fondo BLANCO
—blanco de verdad, no gris ni negro—, nítida, mínimo 1000 px. La sala de
prensa del fabricante suele tener el mismo equipo desde varios ángulos: esa es
la fuente. Después la página oficial del producto, después un distribuidor
oficial.

**Para los productos marcados como seminuevo** se admite además una foto real
del equipo fuera de la caja, pero CUIDADA: sobre un fondo liso, con luz pareja,
encuadre pensado. No sirve el equipo tirado en un escritorio, con cables, ni
una foto tomada así nomás.

**No sirve, en ningún caso:** fondo negro, gris o de color; renders con cintas
o adornos alrededor; manos, mesas, oficinas o depósitos de fondo; la caja en
vez del equipo; el equipo cortado por el borde; capturas de pantalla; marcas de
agua; equipos usados o rayados; y **la misma foto que ya tiene la ficha** desde
otro tamaño: cada archivo tiene que ser una toma distinta.

**Nombres:** exactos, sin prefijos ni sufijos. El número ya viene asignado
para que no pise las fotos que existen. Si de alguna toma no encontrás nada que
cumpla, dejala sin archivo y avisá. Guardá solo estos archivos: nada de
\`test-*\`, ni nombres de hash, ni imágenes de prueba.

**Antes de guardar, abrí la imagen:** que sea el equipo entero, con margen, más
de 1000 px, del modelo exacto que se pide —un iPhone 16 Pro no sirve para el
17 Pro, se distingue por el módulo de cámara—, y que el blanco alrededor no
tenga puntos ni motas.

`;

for (const [categoria, lineas] of porCategoria) {
  md += `**${categoria}**\n\n${lineas.join("\n")}\n\n`;
}
md += "---\n";

await writeFile(path.join(process.cwd(), "docs", "pedido-galeria.md"), md, "utf8");
console.log(
  `docs/pedido-galeria.md — ${filas.length} productos con menos de ${OBJETIVO} fotos.`
);
