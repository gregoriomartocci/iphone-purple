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
const OBJETIVO = 4;

/**
 * En qué orden se piden. Es el orden de lo que más se vende, que es donde
 * una galería completa más pesa: iPhone 17 primero, después el resto de los
 * iPhone de la generación más nueva a la más vieja, después las MacBook, las
 * consolas, y al final todo lo demás. La extensión hace la lista de arriba
 * hacia abajo y a veces no llega al final; que lo que quede afuera sea lo
 * que menos importa.
 */
const GRUPOS = {
  0: "iPhone 17 — lo más vendido, primero",
  1: "iPhone",
  2: "MacBook",
  3: "Consolas",
};

function prioridad(p) {
  const esIphone = p.brand === "Apple" && p.category === "celular";
  if (esIphone && p.generation === 17) return 0;
  if (esIphone) return 1;
  if (p.brand === "Apple" && p.category === "notebook") return 2;
  if (p.category === "consola") return 3;
  return 4;
}

/**
 * Qué tomas pedir además de la portada, por categoría. La portada ya es el
 * dorso (celulares) o los tres cuartos (notebooks), así que acá van las que
 * la complementan. Se piden en este orden y se corta en las que falten.
 */
const TOMAS = {
  celular: [
    "de frente con la pantalla apagada",
    "de perfil, mostrando el borde y los botones",
    "detalle del módulo de cámara, de cerca",
  ],
  tablet: [
    "de frente con la pantalla apagada",
    "de canto, mostrando el grosor",
    "de tres cuartos, apoyada",
  ],
  notebook: [
    "cerrada, vista desde arriba",
    "de perfil, abierta, mostrando el grosor",
    "de frente, abierta, con el teclado a la vista",
  ],
  reloj: [
    "de frente con la esfera encendida",
    "de perfil, mostrando la corona",
    "de tres cuartos, con la malla cerrada",
  ],
  audio: [
    "el estuche abierto con los auriculares adentro",
    "un auricular solo, de cerca",
    "el estuche cerrado, de frente",
  ],
  consola: [
    "la consola sola, de frente",
    "el joystick solo, de tres cuartos",
    "la consola de perfil o de tres cuartos",
  ],
  hogar: ["de tres cuartos", "un detalle del cabezal o los accesorios", "de perfil"],
  accesorio: ["de frente", "de perfil", "de tres cuartos"],
};

const filas = [];
const ordenados = [...PRODUCTS].sort(
  (a, b) => prioridad(a) - prioridad(b) || (b.generation ?? 0) - (a.generation ?? 0)
);
for (const p of ordenados) {
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
    // El grupo sigue a la prioridad, no a la categoría: si agrupara por
    // categoría, un Motorola quedaría dentro de "Celulares" antes que las
    // MacBook, y la lista dejaría de estar en orden de lo que más se vende.
    categoria: GRUPOS[prioridad(p)] ?? CATEGORY_LABELS[p.category] ?? p.category,
    linea: `- ${nombres.join(" ")} · ${p.name.startsWith(p.brand) ? p.name : `${p.brand} ${p.name}`} — ${tomas.join("; ")}${
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

**Si el producto es sellado, la vara es la más alta.** Tiene que ser foto de
estudio o, si es el equipo fuera de la caja, una foto BIEN profesional: de
producción, con luz de estudio, fondo liso, encuadre pensado. Nada que parezca
sacado con el teléfono: ni el equipo sobre un escritorio, ni con un cable, ni
en un local. Si dudás, es que no.

**Para los productos marcados como seminuevo** se admite además una foto real
del equipo fuera de la caja, pero CUIDADA: sobre un fondo liso, con luz pareja,
encuadre pensado. No sirve el equipo tirado en un escritorio, con cables, ni
una foto tomada así nomás.

**El orden de la lista es el orden de prioridad.** Arrancá por arriba —iPhone
17, después el resto de los iPhone, MacBook, consolas— y completá cada
producto antes de pasar al siguiente. Si no llegás al final, que lo que quede
afuera sea lo de abajo.

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
