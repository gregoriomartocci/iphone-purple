/**
 * Recorre public/productos/ y reescribe lib/data/fotos.generado.ts con lo que
 * encuentra en el disco.
 *
 * Existe porque faltaba el eslabón del medio. `npm run fotos` bajaba de
 * Commons y escribía el índice de una sola pasada, así que una foto puesta a
 * mano en la carpeta no aparecía en ningún lado: el catálogo lee el índice, no
 * el disco. Se podían dejar cincuenta archivos y el producto seguía saliendo
 * sin imagen.
 *
 * Uso: npm run fotos:indexar
 *
 * Los créditos que ya estaban se conservan: se leen del índice anterior y se
 * vuelven a escribir para los archivos que siguen existiendo. Una foto propia
 * o comprada no tiene a quién acreditar y va con autor en null, y entonces la
 * ficha no muestra la línea de crédito.
 *
 * Orden dentro de cada carpeta: por nombre de archivo, con los videos siempre
 * al final. Por eso conviene nombrarlas 1, 2, 3 — la 1 es la que sale en la
 * grilla del catálogo.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { FOTOS_PRODUCTO } from "../lib/data/fotos.generado.ts";

const RAIZ = path.join(process.cwd(), "public", "productos");
const SALIDA = path.join(process.cwd(), "lib", "data", "fotos.generado.ts");

const IMAGENES = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const VIDEOS = new Set([".mp4", ".webm"]);

/**
 * Créditos del índice anterior, por ruta pública, para no perderlos.
 *
 * Es el respaldo. La fuente buena es el .commons.json que deja el descargador
 * en cada carpeta, porque va atado al archivo y no al nombre: si una foto de
 * Commons se reemplaza por una propia y la nueva se llama igual, arrastrar el
 * crédito por la ruta le atribuiría a un fotógrafo una foto que no sacó.
 */
const CREDITOS = new Map();
for (const fotos of Object.values(FOTOS_PRODUCTO)) {
  for (const f of fotos) CREDITOS.set(f.url, f);
}

const MARCA = ".commons.json";

/**
 * Créditos de una carpeta.
 *
 * Si hay marca, manda ella y nada más: lo que no figure ahí no es de Commons
 * y no se acredita. Sin marca se cae al índice anterior, que es lo que hay
 * hasta que el descargador vuelva a correr.
 */
async function creditosDe(slug) {
  const marca = await readFile(path.join(RAIZ, slug, MARCA), "utf8")
    .then(JSON.parse)
    .catch(() => null);
  if (!marca) return null;
  return marca;
}

/**
 * Si la imagen es un render recortado o una toma real.
 *
 * La galería las muestra distinto: el render entra entero sobre blanco y la
 * foto se recorta para llenar el cuadro. Meter un render en un recorte le come
 * los bordes al equipo, y estirar una foto de ambiente sobre blanco deja dos
 * franjas vacías.
 *
 * No alcanza con mirar la extensión. Un render exportado a JPG deja de tener
 * canal alfa pero sigue siendo un recorte sobre blanco, y así se colaron como
 * "foto" varios que había que mostrar enteros. Se mide: si el borde de la
 * imagen es un tono claro y parejo, es un fondo de estudio y va como render.
 */
async function clasificar(archivo) {
  const img = sharp(archivo);
  const { hasAlpha } = await img.metadata();
  if (hasAlpha) return "render";

  // 32×32 en gris: suficiente para saber de qué color es el marco.
  const lado = 32;
  const { data } = await img
    .resize(lado, lado, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const borde = [];
  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      if (y === 0 || y === lado - 1 || x === 0 || x === lado - 1) {
        borde.push(data[y * lado + x]);
      }
    }
  }

  const media = borde.reduce((a, b) => a + b, 0) / borde.length;
  const desvio = Math.sqrt(
    borde.reduce((a, b) => a + (b - media) ** 2, 0) / borde.length
  );

  // Claro y parejo: fondo de estudio. Los umbrales son holgados a propósito,
  // porque un blanco fotografiado nunca da 255 clavado.
  return media > 235 && desvio < 12 ? "render" : "foto";
}

const carpetas = (await readdir(RAIZ, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const indice = {};
let totalFotos = 0;
let sinCredito = 0;

for (const slug of carpetas) {
  const archivos = (await readdir(path.join(RAIZ, slug)))
    .filter((n) => {
      const ext = path.extname(n).toLowerCase();
      return IMAGENES.has(ext) || VIDEOS.has(ext);
    })
    .sort((a, b) => a.localeCompare(b, "es", { numeric: true }));

  // Los videos al final: primero se quiere ver el equipo quieto.
  archivos.sort((a, b) => {
    const va = VIDEOS.has(path.extname(a).toLowerCase()) ? 1 : 0;
    const vb = VIDEOS.has(path.extname(b).toLowerCase()) ? 1 : 0;
    return va - vb;
  });

  const marca = await creditosDe(slug);

  const piezas = [];
  for (const nombre of archivos) {
    const url = `/productos/${slug}/${nombre}`;
    const previo = marca ? marca[nombre] : CREDITOS.get(url);
    const esVideo = VIDEOS.has(path.extname(nombre).toLowerCase());

    piezas.push({
      url,
      autor: previo?.autor ?? null,
      licencia: previo?.licencia ?? null,
      origen: previo?.origen ?? null,
      recorte: esVideo
        ? "foto"
        : (previo?.recorte ?? (await clasificar(path.join(RAIZ, slug, nombre)))),
      video: esVideo,
    });

    totalFotos++;
    if (!previo?.autor) sinCredito++;
  }

  /*
   * El orden lo decide el tipo, no el nombre del archivo.
   *
   * Primero el equipo nuevo sobre fondo limpio, que es lo que sale en la
   * grilla del catálogo y lo que tiene que aguantar estar al lado de la foto
   * oficial de Apple. Después las fotos del stock real, que muestran el equipo
   * que se entrega. Y al final el video.
   *
   * Va acá y no en el nombre del archivo a propósito: así alcanza con dejar
   * una foto de estudio en la carpeta para que pase a encabezar, sin renumerar
   * lo que ya estaba.
   */
  const peso = (p) => (p.video ? 2 : p.recorte === "render" ? 0 : 1);
  piezas.sort((a, b) => peso(a) - peso(b));

  indice[slug] = piezas;
}

const cuerpo = Object.entries(indice)
  .map(([slug, piezas]) => {
    const items = piezas
      .map(
        (p) => `    {
      url: ${JSON.stringify(p.url)},
      autor: ${JSON.stringify(p.autor)},
      licencia: ${JSON.stringify(p.licencia)},
      origen: ${JSON.stringify(p.origen)},
      recorte: ${JSON.stringify(p.recorte)},
      video: ${p.video},
    },`
      )
      .join("\n");
    return `  ${JSON.stringify(slug)}: [\n${items}\n  ],`;
  })
  .join("\n");

await writeFile(
  SALIDA,
  `// GENERADO por scripts/indexar-fotos.mjs — no editar a mano.
// Es el espejo de public/productos/: cada archivo que hay ahí, en el orden en
// que la ficha lo muestra. Para sumar una foto, dejala en la carpeta del
// producto y corré \`npm run fotos:indexar\`.
//
// Las licencias Creative Commons exigen crédito visible, así que las fotos que
// vinieron de Commons se guardan con su autor y la ficha lo muestra. Una foto
// propia o comprada va con autor en null y entonces no se acredita a nadie.

export type CreditoFoto = {
  url: string;
  /** null cuando no hay a quién acreditar: foto propia, comprada o de prensa. */
  autor: string | null;
  licencia: string | null;
  origen: string | null;
  /** "render" es el equipo recortado sobre blanco o transparente; "foto", una toma real. */
  recorte: "render" | "foto";
  /** Los videos van al final de la galería. */
  video: boolean;
};

export const FOTOS_PRODUCTO: Record<string, CreditoFoto[]> = {
${cuerpo}
};
`,
  "utf8"
);

const conFotos = Object.values(indice).filter((p) => p.length > 0).length;
console.log(
  `${totalFotos} archivos en ${conFotos} productos · ${sinCredito} sin crédito (propias)`
);
