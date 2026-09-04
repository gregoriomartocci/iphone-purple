/**
 * Baja las fotos de catálogo a public/productos/<slug>/ y genera el índice
 * lib/data/fotos.generado.ts con los créditos de cada una.
 *
 * Por qué se descargan en vez de enlazarlas: las fotos quedan servidas desde
 * el propio dominio, así no dependen de que un tercero no las mueva, no hay
 * que abrir hosts en la CSP ni en next.config, y next/image puede
 * optimizarlas.
 *
 * Uso: npm run fotos
 *
 * Las que están acá son de Wikimedia Commons y son del producto exacto: se
 * revisaron una por una, porque la búsqueda mezcla imitaciones, cajas y
 * modelos parecidos de otra generación. Una foto que no es del producto es
 * peor que no tener foto.
 *
 * Para sumar fotos propias no hace falta tocar este archivo: alcanza con
 * dejarlas en public/productos/<slug>/ y tienen prioridad sobre estas.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const API = "https://commons.wikimedia.org/w/api.php";
const RAIZ = path.join(process.cwd(), "public", "productos");

/** slug del producto → archivos de Commons, en el orden en que se muestran. */
/**
 * slug del producto → archivos de Commons, en el orden en que se muestran.
 *
 * REGLA: solo renders del producto, ninguna foto de un equipo real.
 *
 * Un render es una ilustración del equipo como sale de fábrica: fondo
 * transparente, sin etiquetas de precio pegadas al dorso, sin funda, sin
 * manos, sin la pantalla amarilleada de un usado, sin el cable con imán del
 * mostrador. Eso se puede garantizar; la calidad de una foto no, porque para
 * saber si tiene una etiqueta tapando la manzana hay que mirarla.
 *
 * Se probó lo contrario y no funcionó: aceptar fotos leyendo su nombre y su
 * descripción dejó pasar una PlayStation sobre una mesa de casa, un Redmi con
 * la pantalla sucia, una Switch tirada, un iPhone con una etiqueta en el
 * dorso y un iPad amarillento. El texto de un archivo no dice nada de eso.
 *
 * Consecuencia asumida: muchos productos quedan sin imagen y lo dicen. Es
 * preferible a una foto que descuida el producto. Se levanta sola en cuanto
 * haya fotos propias o del proveedor en public/productos/<slug>/.
 */
const FOTOS = {
  // Dorso primero donde hay render de dorso. De frente todos los iPhone son
  // la misma silueta con la pantalla apagada.
  "iphone-17": ["IPhone 17 (Lavender).png", "IPhone 17 Vector.svg"],
  "iphone-17-pro": [
    "IPhone 17 Pro.png",
    "IPhone 17 Pro back.svg",
    "IPhone 17 Pro Vector.svg",
  ],
  "iphone-17-pro-max": [
    "IPhone 17 Pro Max (Deep Blue).png",
    "IPhone 17 Pro Max Vector.svg",
  ],
  "iphone-16": ["IPhone 16 Vector.svg"],
  "iphone-16-pro": ["IPhone 16 Pro Vector.svg"],
  "iphone-16-pro-max": ["IPhone 16 Pro Max Vector.svg"],
  "iphone-15": ["IPhone 15 Vector.svg"],
  "iphone-15-pro": ["IPhone 15 Pro Vector.svg"],
  "iphone-15-pro-max": ["IPhone 15 Pro Max Vector.svg"],
  "iphone-14": ["IPhone 14 vector.svg"],
  "iphone-14-pro": ["IPhone 14 Pro vector.svg"],
  "iphone-13": ["IPhone 13 vector.svg"],
  "iphone-13-pro": ["IPhone 13 Pro vector.svg"],
  "iphone-12": ["IPhone 12 Blue.svg"],
  "iphone-12-pro": ["IPhone 12 Pro Gold.svg"],
  "iphone-11": ["IPhone 11 White.svg"],
  "iphone-11-pro": ["IPhone 11 Pro Midnight Green.svg"],
  "iphone-11-pro-max": ["IPhone 11 Pro Max Midnight Green.svg"],
};

/** Señales, en varios idiomas, de que la foto es de un equipo en exhibición. */
const EXHIBICION =
  /店頭|展示|量販店|ヨドバシ|ビックカメラ|apple store|store display|on display|at the store|in a store|in the store|retail|launching event|showroom|display unit/i;

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Pide a Commons con reintentos. La API corta con 429 si se le pega seguido,
 * así que ante un rechazo se espera cada vez más antes de volver a probar.
 */
async function pedir(url) {
  // Ritmo fijo entre pedidos: Commons tolera mal las ráfagas y con esto no
  // llega a cortar. Son pocas decenas de archivos, la espera no molesta.
  await esperar(1200);
  for (let intento = 0; intento < 6; intento++) {
    try {
      const r = await fetch(url, {
        headers: { "User-Agent": "iphonepurple-fotos/1.0" },
      });
      if (r.ok) return r;
      if (r.status !== 429 && r.status < 500)
        throw new Error(`Commons respondió ${r.status}`);
    } catch (err) {
      // También se reintenta ante un corte de red: una corrida de varios
      // minutos contra un servidor ajeno se topa con alguno, y perder todo
      // por el último archivo obliga a bajar los cincuenta de nuevo.
      if (intento === 5) throw err;
    }
    await esperar(4000 * (intento + 1));
  }
  throw new Error("Commons sigue rechazando pedidos; probá de nuevo más tarde");
}

/** Pide a Commons la URL de descarga y la ficha de autoría de un archivo. */
async function ficha(archivo) {
  const url =
    `${API}?action=query&titles=${encodeURIComponent(`File:${archivo}`)}` +
    `&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1600&format=json`;
  const r = await pedir(url);
  const d = await r.json();
  const pagina = Object.values(d?.query?.pages ?? {})[0];
  const info = pagina?.imageinfo?.[0];
  if (!info) throw new Error(`Commons no conoce el archivo ${archivo}`);
  const meta = info.extmetadata ?? {};
  const limpiar = (v) =>
    (v ?? "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  return {
    // thumburl viene redimensionada a 1600 px: alcanza y de sobra, y evita
    // bajar originales de 20 MB.
    descarga: info.thumburl ?? info.url,
    autor: limpiar(meta.Artist?.value) || "Wikimedia Commons",
    licencia: limpiar(meta.LicenseShortName?.value) || "ver Commons",
    origen: info.descriptionurl,
    descripcion: limpiar(meta.ImageDescription?.value),
  };
}

/**
 * Ancho, alto y transparencia de un PNG, leídos del encabezado IHDR.
 *
 * Son 8 bytes de firma, 8 de largo y tipo de bloque, ahí vienen los dos
 * enteros de 32 bits, y después la profundidad y el tipo de color. Los tipos
 * 4 y 6 son los que llevan canal alfa. No hace falta una librería.
 */
function medirPng(buf) {
  if (buf.length < 26 || buf.toString("ascii", 12, 16) !== "IHDR") return null;
  const tipoColor = buf[25];
  return {
    ancho: buf.readUInt32BE(16),
    alto: buf.readUInt32BE(20),
    conAlfa: tipoColor === 4 || tipoColor === 6,
  };
}

const indice = {};
/** Lo que se descartó, para revisarlo al final. */
const descartadas = [];

for (const [slug, archivos] of Object.entries(FOTOS)) {
  // Se vacía la carpeta antes de escribir: si en una corrida anterior este
  // producto tenía cuatro fotos y ahora tiene una, las tres viejas quedaban
  // en el repo sin que nada las referenciara. Ya había 109 archivos para 70
  // entradas de índice.
  await rm(path.join(RAIZ, slug), { recursive: true, force: true });
  await mkdir(path.join(RAIZ, slug), { recursive: true });
  indice[slug] = [];

  let guardadas = 0;
  for (const archivo of archivos) {
    const { descarga, autor, licencia, origen, descripcion } = await ficha(archivo);
    const r = await pedir(descarga);
    const ext = descarga.split("?")[0].toLowerCase().endsWith(".png") ? "png" : "jpg";
    const nombre = `${guardadas + 1}.${ext}`;
    const datos = Buffer.from(await r.arrayBuffer());

    // Equipo en exhibición: en el mostrador de una tienda el teléfono va
    // enganchado a un cable con imán antirrobo, y ese cable sale en la foto.
    // La descripción de Commons dice dónde fue tomada, así que se frena acá
    // en vez de descubrirlo mirando el catálogo. Ya se colaron tres así.
    // Se saltea y se sigue, en vez de cortar la corrida entera: un archivo
    // descartado no puede dejar sin fotos a los otros veinte productos.
    if (EXHIBICION.test(descripcion)) {
      descartadas.push(`${slug}: ${archivo} — "${descripcion.slice(0, 50)}"`);
      continue;
    }

    // Una pieza mucho más ancha que alta no es un equipo sino el logotipo del
    // modelo: en Commons conviven con el mismo nombre y ya se coló uno al
    // catálogo. Frenarlo acá es más barato que descubrirlo mirando la grilla.
    const medidas = medirPng(datos);

    /**
     * Que sea un render de verdad y no una foto guardada como PNG.
     *
     * El recorte del producto sobre transparente es lo único que garantiza
     * que no haya etiquetas pegadas, fundas, manos ni pantallas amarillentas.
     * Deducirlo de la extensión no alcanzaba: una foto en PNG pasaba como
     * render.
     */
    if (medidas && !medidas.conAlfa) {
      descartadas.push(`${slug}: ${archivo} — es una foto, no un render`);
      continue;
    }

    if (medidas && medidas.ancho / medidas.alto > 2.5) {
      throw new Error(
        `${archivo} mide ${medidas.ancho}x${medidas.alto}: con esa proporción no ` +
          `es una foto del equipo sino el logotipo del modelo. Elegí otro archivo.`
      );
    }

    await writeFile(path.join(RAIZ, slug, nombre), datos);
    indice[slug].push({
      url: `/productos/${slug}/${nombre}`,
      autor,
      licencia,
      origen,
      // Un render sin fondo se muestra sobre blanco; una foto ambiental no.
      // Con transparencia comprobada, no supuesta por la extensión.
      recorte: medidas?.conAlfa ? "render" : "foto",
    });
    guardadas++;
    console.log(`✓ ${slug}/${nombre}  ${licencia} — ${autor}`);
  }
}

const cabecera = `// GENERADO por scripts/descargar-fotos.mjs — no editar a mano.
// Fotos de catálogo servidas desde public/productos/, con su autoría.
// Las licencias Creative Commons exigen crédito visible: lo muestra la ficha
// de producto.

export type CreditoFoto = {
  url: string;
  autor: string;
  licencia: string;
  origen: string;
  /** "render" es el equipo recortado sobre transparente; "foto", una toma real. */
  recorte: "render" | "foto";
};

export const FOTOS_PRODUCTO: Record<string, CreditoFoto[]> = `;

await writeFile(
  path.join(process.cwd(), "lib", "data", "fotos.generado.ts"),
  `${cabecera}${JSON.stringify(indice, null, 2)};\n`
);

const total = Object.values(indice).reduce((n, l) => n + l.length, 0);
const conFotos = Object.values(indice).filter((f) => f.length > 0).length;
console.log(`\n${total} fotos en ${conFotos} productos.`);
if (descartadas.length) {
  console.log(`\n${descartadas.length} descartadas por ser de equipos en exhibición:`);
  for (const d of descartadas) console.log(`  · ${d}`);
}
