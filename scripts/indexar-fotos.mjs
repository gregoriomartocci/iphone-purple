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
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { FOTOS_PRODUCTO } from "../lib/data/fotos.generado.ts";
import { PRODUCTS } from "../lib/data/seed.ts";

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
  // Sin el ?v= de caché: la clave es el archivo, no la versión.
  for (const f of fotos) CREDITOS.set(f.url.split("?")[0], f);
}

const MARCA = ".commons.json";
const COLORES = ".colores.json";

/** Colores que vende cada producto, para validar lo que dice el sidecar. */
const COLORES_DEL_PRODUCTO = new Map(
  PRODUCTS.map((p) => [p.slug, new Set(p.variants.map((v) => v.color))])
);

/**
 * De qué color es el equipo en cada foto.
 *
 * Se escribe a mano mirando las fotos, con los mismos nombres que usan las
 * variantes: la ficha ofrece los colores de las variantes y ordena la galería
 * con esto, así que un nombre distinto no matchea nada. Por eso se valida
 * acá y se avisa, en vez de dejar pasar "Azul" donde la variante dice
 * "Titanio Azul". Un archivo que no figura queda sin color: sale después de
 * las del color elegido y antes que las de los otros.
 */
async function coloresDe(slug) {
  const sidecar = await readFile(path.join(RAIZ, slug, COLORES), "utf8")
    .then(JSON.parse)
    .catch(() => null);
  if (!sidecar) return {};
  const validos = COLORES_DEL_PRODUCTO.get(slug) ?? new Set();
  for (const [archivo, colores] of Object.entries(sidecar)) {
    for (const c of colores) {
      if (!validos.has(c)) {
        console.warn(
          `  ⚠ ${slug}/${archivo}: "${c}" no es un color de las variantes (${[...validos].join(", ") || "ninguno"})`
        );
      }
    }
  }
  return sidecar;
}

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
  if (hasAlpha) return { recorte: "render", fondo: null };

  // 32×32: suficiente para saber de qué color es el marco.
  const lado = 32;
  const { data } = await img
    .resize(lado, lado, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const borde = [];
  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      if (y === 0 || y === lado - 1 || x === 0 || x === lado - 1) {
        const i = (y * lado + x) * 3;
        borde.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
  }

  const medio = [0, 1, 2].map(
    (c) => borde.reduce((a, px) => a + px[c], 0) / borde.length
  );
  // Qué tan lejos del color medio está el píxel más raro del marco. Con la
  // distancia máxima —y no el desvío promedio— una esquina con algo pegado
  // rompe la uniformidad, que es justo lo que hay que detectar.
  const dispersion = Math.max(
    ...borde.map((px) => Math.sqrt(px.reduce((a, v, c) => a + (v - medio[c]) ** 2, 0)))
  );

  /*
   * Un marco parejo es un fondo de estudio, sea blanco o negro.
   *
   * Antes solo contaba el blanco, y las fotos de prensa sobre negro —la mitad
   * de las que manda un fabricante de celulares— entraban como toma ambiental:
   * la galería las recortaba para llenar el cuadro y al equipo le comía los
   * bordes. Se guarda también el color, porque mostrar un recorte sobre negro
   * encima de un fondo blanco le dibuja un marco alrededor.
   */
  const uniforme = dispersion < 42;
  const claro = medio.every((c) => c > 232);
  const oscuro = medio.every((c) => c < 34);
  if (!uniforme || (!claro && !oscuro)) return { recorte: "foto", fondo: null };

  const hex =
    "#" + medio.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
  return { recorte: "render", fondo: hex };
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
  const colores = await coloresDe(slug);

  const piezas = [];
  for (const nombre of archivos) {
    const ruta = `/productos/${slug}/${nombre}`;
    const previo = marca ? marca[nombre] : CREDITOS.get(ruta);
    const esVideo = VIDEOS.has(path.extname(nombre).toLowerCase());

    /*
     * ?v= con el hash del contenido.
     *
     * Las portadas se reemplazan bajo el mismo nombre —una foto de estudio
     * entra como 1.jpg y la que estaba pasa a 2.jpg—, y el navegador, el CDN
     * de Vercel y el optimizador de imágenes de Next cachean por URL. Sin
     * esto, después de reemplazar el Switch y los AirPods el catálogo siguió
     * mostrando la foto vieja hasta un refresco forzado. Con el hash, cambia
     * el contenido y cambia la dirección: nadie puede servir la anterior.
     */
    const version = createHash("md5")
      .update(await readFile(path.join(RAIZ, slug, nombre)))
      .digest("hex")
      .slice(0, 8);
    const url = `${ruta}?v=${version}`;

    const medido = esVideo
      ? { recorte: "foto", fondo: null }
      : await clasificar(path.join(RAIZ, slug, nombre));

    piezas.push({
      url,
      autor: previo?.autor ?? null,
      licencia: previo?.licencia ?? null,
      origen: previo?.origen ?? null,
      recorte: previo?.recorte ?? medido.recorte,
      fondo: medido.fondo,
      video: esVideo,
      colores: colores[nombre] ?? [],
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
      fondo: ${JSON.stringify(p.fondo)},
      video: ${p.video},
      colores: ${JSON.stringify(p.colores)},
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
  /** "render" es el equipo recortado sobre un fondo parejo; "foto", una toma real. */
  recorte: "render" | "foto";
  /**
   * Color del fondo cuando el recorte lo tiene parejo, para pintarlo detrás.
   *
   * Un recorte sobre negro puesto encima de blanco queda con un marco oscuro
   * alrededor; con el color medido no se nota dónde termina la foto.
   */
  fondo: string | null;
  /** Los videos van al final de la galería. */
  video: boolean;
  /**
   * Colores del equipo en la foto, con los nombres de las variantes. Sale de
   * public/productos/<slug>/.colores.json; vacío si no se etiquetó.
   */
  colores: string[];
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
