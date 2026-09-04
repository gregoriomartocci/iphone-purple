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
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const API = "https://commons.wikimedia.org/w/api.php";
const RAIZ = path.join(process.cwd(), "public", "productos");

/** slug del producto → archivos de Commons, en el orden en que se muestran. */
/**
 * slug del producto → archivos de Commons, en el orden en que se muestran.
 *
 * REGLA: primero el render del producto; foto real solo si no hay render.
 *
 * El render —el equipo recortado sobre transparente, como sale de fábrica— es
 * lo único que se puede garantizar sin mirarlo: no hay etiqueta pegada, ni
 * funda, ni mano, ni pantalla gastada, ni el cable con imán del mostrador. Por
 * eso va primero donde existe.
 *
 * Pero no existe para casi nada que no sea un iPhone, y un producto sin
 * ninguna imagen no se vende. Así que donde no hay render se usa la mejor foto
 * real que se consiga del modelo exacto, filtrando las de exhibición.
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
  // ── Productos que no tienen render y llevan foto del modelo exacto.
  //
  // Salieron de Openverse, que agrega imágenes de licencia libre de Commons,
  // Flickr y decenas de catálogos más. Su búsqueda encuentra lo que la de
  // Commons no: "Back of the iPhone 13 Pro Max" existía y yo venía diciendo
  // que no, porque buscaba con otras palabras.
  "iphone-13-pro-max": ["Back view of iPhone 13 Pro Max Gold.jpg"],
  "iphone-12-pro-max": ["IPhone 12 Pro Max - 3.jpg", "IPhone 12 Pro Max - 2.jpg"],
  "iphone-14-pro-max": [
    "IPhone 14 Pro Max Deep purple A2896 China, Hong Kong and Macao version rear.jpg",
    "Back of the iPhone 14 Pro Max.jpg",
  ],
  "moto-g35": ["Motorola Moto G35 5G.jpg"],
  "xiaomi-17": ["Xiaomi 17 backside Ice Melting Blue.jpg"],
  "xiaomi-17-ultra": ["Xiaomi 17 Ultra by Leica rear.jpg", "Xiaomi 17 Ultra.jpg"],
  "macbook-pro-m5-max-16": [
    'Apple MacBook Pro 16" M2 Max.jpg',
    'Apple MacBook Pro 16" M2 Max closeup.jpg',
    'Apple MacBook Pro 16" M2 Max with Headset and Mouse.jpg',
  ],
  "macbook-pro-m5-pro-16": [
    "MacBook Pro 16 (M1 Pro, 2021) - Wikipedia.jpg",
    'Apple MacBook Pro 16" M2 Max.jpg',
  ],
  "macbook-pro-m5-14": [
    "MacBook Pro 3rd Generation.jpg",
    "Apple Macbook Pro (Unsplash).jpg",
  ],
  "macbook-pro-m5-pro-14": [
    "MacBook Pro 3rd Generation (blue).jpg",
    "MacBook Pro 3rd Generation.jpg",
  ],
  "macbook-pro-m5-max-14": [
    "Apple Macbook Pro (Unsplash).jpg",
    "MacBook Pro 3rd Generation.jpg",
  ],
  "macbook-pro-m4-pro-14": [
    "MacBook Pro 3rd Generation.jpg",
    "MacBook Pro 3rd Generation (blue).jpg",
  ],
  "macbook-air-m5-13": ["MacBook Air (13-inch, M4, Silver).jpg"],
  "macbook-air-m5-15": ["MacBook Air (15-inch, M4, Silver).jpg"],
  "macbook-air-m3": ["MacBook Air (13-inch, M4, Silver).jpg"],
  "airpods-pro-2": ["AirPods Pro (2nd generation).jpg"],
  "apple-watch-series-10": ["Apple Watch Series 10.jpg"],
  "ipad-air-m2": ["About iPad Air 11-inch (M2).jpg", "About iPad Air 13-inch (M2).jpg"],
  "ipad-air-13-m3": ["IPad Air 11-inch (M3) backside.jpg", "IPad Air 11-inch (M3).jpg"],
  "ipad-air-11-m4": ["IPad Air 11-inch (M3) backside.jpg", "IPad Air 11-inch (M3).jpg"],
  "ipad-air-13-m4": ["About iPad Air 13-inch (M2).jpg"],
  "playstation-5-slim": ["PlayStation 5 and DualSense.jpg", "Playstation 5.jpg"],
  "nintendo-switch-2-mario-kart": [
    "Nintendo Switch 2 in Docking Console.jpg",
    "Nintendo Switch 2 in Handheld Mode.jpg",
  ],
  "nintendo-switch-oled": ["Switch oled console.jpg"],
  "logitech-g29-driving-force": ["Logitech G29 steering wheel.jpg"],
  "redmi-15c": ["Redmi 15C back.jpg", "Redmi 15C front.jpg"],
  "garmin-instinct-2s-solar": ["Garmin Instinct 2s.jpg"],

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
  // Devuelve null en vez de tirar: un nombre mal escrito no puede dejar sin
  // fotos a los otros cuarenta productos. Se reporta al final.
  if (!info) return null;
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

/** Productos que quedaron con sus fotos propias y este script no tocó. */
const conservados = [];

/**
 * Marca que este script deja en cada carpeta que administra, con la lista de
 * archivos que bajó.
 *
 * Hace falta porque los nombres no alcanzan para distinguir: este script
 * escribe 1.jpg, 2.jpg… y una foto puesta a mano se llama igual. Sin la marca,
 * la única forma de saber de quién es cada archivo era adivinar, y adivinar
 * mal acá significa borrar una foto que alguien consiguió y no vuelve.
 */
const MARCA = ".commons.json";

for (const [slug, archivos] of Object.entries(FOTOS)) {
  // Se vacía la carpeta antes de escribir: si en una corrida anterior este
  // producto tenía cuatro fotos y ahora tiene una, las tres viejas quedaban
  // en el repo sin que nada las referenciara. Ya había 109 archivos para 70
  // entradas de índice.
  //
  // Pero solo si la carpeta es de este script. Desde que se pueden dejar
  // fotos a mano, vaciar a ciegas borraba trabajo ajeno: alcanzaba con correr
  // `npm run fotos` después de haber puesto una foto propia para perderla sin
  // aviso. Si hay algo que este script no bajó, no toca nada.
  const carpeta = path.join(RAIZ, slug);
  await mkdir(carpeta, { recursive: true });

  const presentes = (await readdir(carpeta).catch(() => [])).filter((n) => n !== MARCA);
  const mias = new Set(
    Object.keys(
      await readFile(path.join(carpeta, MARCA), "utf8")
        .then(JSON.parse)
        .catch(() => ({}))
    )
  );
  const ajenas = presentes.filter((n) => !mias.has(n));

  if (ajenas.length > 0) {
    console.log(
      `· ${slug}: hay fotos que no bajé yo, no toco la carpeta (${ajenas.join(", ")})`
    );
    conservados.push(slug);
    continue;
  }

  // Todo lo que hay lo bajé yo en una corrida anterior: se puede rehacer.
  for (const n of presentes) await rm(path.join(carpeta, n), { force: true });
  indice[slug] = [];

  let guardadas = 0;
  for (const archivo of archivos) {
    const datos0 = await ficha(archivo);
    if (!datos0) {
      descartadas.push(`${slug}: ${archivo} — Commons no conoce ese archivo`);
      continue;
    }
    const { descarga, autor, licencia, origen, descripcion } = datos0;
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

  // Queda anotado qué archivos son míos y de quién es cada foto. El crédito
  // vive al lado del archivo y no en un índice aparte: así sobrevive a que se
  // regenere el índice, y no se puede perder de vista cuál foto acredita a
  // quién, que es justamente lo que exige la licencia.
  await writeFile(
    path.join(RAIZ, slug, MARCA),
    JSON.stringify(
      Object.fromEntries(
        indice[slug].map((f) => [
          path.basename(f.url),
          { autor: f.autor, licencia: f.licencia, origen: f.origen, recorte: f.recorte },
        ])
      ),
      null,
      2
    ),
    "utf8"
  );
}

const total = Object.values(indice).reduce((n, l) => n + l.length, 0);
const conFotos = Object.values(indice).filter((f) => f.length > 0).length;
console.log(`\n${total} fotos en ${conFotos} productos.`);
if (conservados.length) {
  console.log(`\n${conservados.length} productos conservaron sus fotos propias:`);
  for (const c of conservados) console.log(`  · ${c}`);
}
console.log("\nFalta armar el índice: npm run fotos:indexar");
if (descartadas.length) {
  console.log(`\n${descartadas.length} descartadas por ser de equipos en exhibición:`);
  for (const d of descartadas) console.log(`  · ${d}`);
}
