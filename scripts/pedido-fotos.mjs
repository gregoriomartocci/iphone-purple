/**
 * Escribe docs/pedido-fotos.md: el pedido completo para la extensión de Chrome.
 *
 * Se genera y no se escribe a mano porque cambia solo. Cada foto que entra al
 * catálogo saca una línea del pedido, y un pedido desactualizado hace que se
 * busquen fotos que ya tenemos.
 *
 * La regla que ordena todo esto: la primera foto de cada producto es la que
 * sale en la grilla del catálogo, y tiene que ser el equipo nuevo sobre fondo
 * limpio. Las fotos del stock real —las que se ven agarradas con la mano—
 * valen, pero van después. Por eso el pedido incluye también a los productos
 * que ya tienen fotos: les falta la primera.
 *
 * Uso: npm run fotos:pedido
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { PRODUCTS } from "../lib/data/seed.ts";
import { FOTOS_PRODUCTO } from "../lib/data/fotos.generado.ts";
import { CATEGORY_LABELS } from "../types/index.ts";

/**
 * Cómo pedir el encuadre según el tipo de producto.
 *
 * Las claves son las de `Category`, no las etiquetas que se muestran: usarlas
 * mal hacía que todo cayera en el encuadre genérico, y los celulares perdían
 * justamente la indicación de mostrar el dorso, que es la que más veces hubo
 * que repetir.
 */
const ENCUADRE = {
  celular: "de tres cuartos, mostrando el DORSO, pantalla apagada",
  tablet: "de tres cuartos, apoyada de canto, mostrando el dorso",
  notebook: "abierta unos 110 grados, de tres cuartos desde arriba a la izquierda",
  reloj: "de tres cuartos, con la malla abierta en semicírculo",
  audio: "el estuche cerrado y los auriculares al lado",
  consola: "la consola de tres cuartos, con el joystick al lado",
  hogar: "de pie, de frente, apenas girado a un costado",
  accesorio: "de tres cuartos sobre fondo blanco",
};

// Solo los que no tienen ninguna imagen. Los que ya tienen fotos del stock
// real se resuelven con la foto de estudio cuando aparezca; meterlos en el
// pedido lo volvía una lista de setenta y tres que nadie iba a leer.
const filas = [];
for (const p of PRODUCTS) {
  const tiene = FOTOS_PRODUCTO[p.slug]?.length ?? 0;
  if (tiene > 0) continue;
  const colores = [...new Set(p.variants.map((v) => v.color))].filter(Boolean);
  filas.push({
    categoria: CATEGORY_LABELS[p.category] ?? p.category,
    marca: p.brand,
    nombre: p.name,
    slug: p.slug,
    colores,
    tiene,
    encuadre: ENCUADRE[p.category] ?? ENCUADRE.accesorio,
  });
}

const porCategoria = new Map();
for (const f of filas) {
  if (!porCategoria.has(f.categoria)) porCategoria.set(f.categoria, []);
  porCategoria.get(f.categoria).push(f);
}

let md = `# Pedido de fotos

GENERADO por \`npm run fotos:pedido\`. Se regenera solo cada vez que entran
fotos nuevas, así no se piden las que ya tenemos.

Son **${filas.length} productos sin ninguna imagen**: hoy su ficha sale vacía.

Copiá todo lo que está entre las líneas y pegalo en la extensión de Claude en
Chrome. Cuando termine:

    npm run fotos:importar ~/Downloads

---

Buscá fotos de producto para una tienda de electrónica y descargalas a la
carpeta de descargas, cada una con el nombre exacto que se pide más abajo. No
hace falta crear una subcarpeta: si se intenta, el navegador termina metiendo
el nombre de la carpeta adentro del nombre del archivo y da lo mismo.

**Todo tiene que ser el producto NUEVO**, como sale de fábrica: sin rayas, sin
uso, sin desgaste. Y "nuevo" significa foto de estudio, no una foto de alguien
mostrando el equipo que le llegó: **nada de manos sosteniéndolo, nada de mesas,
nada de fondos de living o de depósito.** Si la única opción disponible es un
producto real fotografiado en un ambiente así, no sirve igual: hay que seguir
buscando la foto de fábrica.

**Cómo tiene que ser:** el producto solo sobre fondo BLANCO —blanco de
verdad, no gris ni negro—, foto de estudio, nítida, mínimo 1000 px de ancho.
Muchas marcas también publican la misma foto de prensa sobre fondo negro: esa
versión no sirve, aunque sea oficial y esté perfecta en todo lo demás. Preferí
siempre la variante en blanco del mismo producto. Celulares y tablets de
**dorso** (de frente son todos una pantalla negra igual). Notebooks abiertas en
tres cuartos. Relojes con la malla abierta.

**Dónde buscar,** en este orden: la sala de prensa del fabricante
(\`<marca> press room\` o \`newsroom\`), su página oficial del producto, un
distribuidor oficial.

**No sirve:**

- Fondo negro, gris o de color, aunque sea foto oficial de la marca.
- Dibujos, vectores o ilustraciones.
- Marcas de agua de otros sitios.
- Manos, personas, mesas, pisos, livings o depósitos de fondo.
- La caja en vez del producto, o el producto sin terminar de salir de la caja
  —tiene que verse el equipo entero, no el packaging—.
- Una foto donde el equipo queda cortado por el borde del cuadro: tiene que
  entrar completo, con margen alrededor.
- Una pantalla mostrando un menú de Ajustes o "Acerca de": eso es una captura
  de software, no una foto del producto.
- Equipos usados, rayados, o en exhibición con el cable antirrobo.

**Nombres:** hasta 3 por producto, con el nombre exacto de la lista y nada más
—sin prefijos ni sufijos—. La \`-1\` es la mejor y la que va al catálogo. Si de
alguno no encontrás nada que cumpla, dejalo sin archivo y avisá; prefiero eso a
una foto que no corresponde al modelo exacto.

**Antes de guardar cada archivo, abrí la imagen y miralo:** que sea el equipo
entero, no un recorte donde queda cortado por la mitad ni un primer plano de
una esquina; que no sea el logo de la tienda ni un ícono de la página; y que
mida más de 1000 px. La vez pasada volvieron el logo de Amazon Prime, una
miniatura de 78 px y un archivo de prueba de 1 píxel.

**Y miralo una vez más para el fondo, que es lo que más vuelve mal:** el fondo
tiene que ser blanco. Si alrededor del producto ves negro, gris oscuro o
cualquier color, esa foto no entra, por buena que sea el resto — se mide el
borde de la imagen al recibirla y se rechaza sola. Si del modelo sólo existe
la versión sobre negro, dejalo sin archivo y avisá.

**Hacé la lista entera.** Son muchos productos: no pares en los primeros dos.
Si uno se resiste, anotalo y seguí con el siguiente.

`;

for (const [categoria, items] of porCategoria) {
  md += `\n**${categoria}**\n\n`;
  for (const f of items) {
    const col = f.colores.length ? ` — ${f.colores.slice(0, 3).join(", ")}` : "";
    // Varios nombres ya empiezan con la marca ("Asus Vivobook Go"), y anteponerla
    // otra vez daba "Asus Asus Vivobook Go".
    const titulo = f.nombre.toLowerCase().startsWith(f.marca.toLowerCase())
      ? f.nombre
      : `${f.marca} ${f.nombre}`;
    md += `- \`${f.slug}-1.jpg\` \`-2\` \`-3\` · ${titulo}${col}\n`;
  }
}

md += `\n---\n`;

await writeFile(path.join(process.cwd(), "docs", "pedido-fotos.md"), md, "utf8");
console.log(`docs/pedido-fotos.md — ${filas.length} productos sin ninguna foto.`);
