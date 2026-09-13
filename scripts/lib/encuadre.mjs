/**
 * Encuadre parejo para los renders de catálogo.
 *
 * Las fotos de estudio llegan con el aire que cada fabricante quiso: una de
 * prensa de Apple trae la MacBook chiquita en el medio de 5120 px de blanco,
 * un render de Xiaomi viene al ras. La tarjeta muestra el archivo entero, así
 * que un equipo se veía enorme y el de al lado diminuto, y el catálogo parecía
 * desparejo aunque cada foto estuviera bien.
 *
 * Acá se recorta el aire hasta el equipo y se le vuelve a poner un margen
 * fijo sobre un lienzo cuadrado. Cuadrado porque la tarjeta lo es: un teléfono
 * vertical llena el alto y una notebook horizontal llena el ancho, y los dos
 * se ven del mismo tamaño.
 *
 * Solo para renders sobre fondo parejo. Una foto de ambiente no tiene aire que
 * recortar y la tarjeta ya la muestra a corte.
 */
import sharp from "sharp";

/** Aire alrededor del equipo, como fracción del lado del lienzo. */
export const MARGEN = 0.08;

/**
 * Color del fondo: el píxel de la esquina. Es el mismo criterio que usa
 * `trim()` de sharp para decidir qué es aire, así que recortar y rellenar
 * quedan de acuerdo y no se nota la costura.
 */
async function colorDeFondo(entrada) {
  const { data } = await sharp(entrada)
    .flatten({ background: "#ffffff" })
    .extract({ left: 1, top: 1, width: 1, height: 1 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { r: data[0], g: data[1], b: data[2] };
}

/**
 * Dónde está el equipo dentro de la imagen.
 *
 * `trim` con umbral bajo: los renders de Apple traen una sombra muy suave
 * debajo del equipo que forma parte de cómo se presenta, y un umbral alto la
 * dejaría afuera y el equipo quedaría "flotando" cortado por abajo.
 */
export async function caja(entrada) {
  const meta = await sharp(entrada).metadata();
  const { info } = await sharp(entrada)
    .flatten({ background: "#ffffff" })
    .trim({ threshold: 12 })
    .toBuffer({ resolveWithObject: true });
  return {
    ancho: meta.width,
    alto: meta.height,
    // sharp informa el desplazamiento del recorte como negativo.
    izq: -(info.trimOffsetLeft ?? 0),
    arriba: -(info.trimOffsetTop ?? 0),
    anchoEquipo: info.width,
    altoEquipo: info.height,
  };
}

/**
 * Si la imagen ya está encuadrada: lienzo cuadrado y el equipo con el margen
 * esperado en su lado largo, con una tolerancia de un punto y medio. Sirve
 * para que correr el script dos veces no vuelva a recodificar todo.
 */
export function yaEncuadrada(c) {
  if (c.ancho !== c.alto) return false;
  const lado = c.ancho;
  const largo = Math.max(c.anchoEquipo, c.altoEquipo);
  const margen = (lado - largo) / 2 / lado;
  return Math.abs(margen - MARGEN) < 0.015;
}

/**
 * Devuelve el pipeline de sharp con la imagen encuadrada, o null si ya lo
 * estaba. Quien llama decide formato y destino.
 */
export async function encuadrar(entrada) {
  const c = await caja(entrada);
  if (yaEncuadrada(c)) return null;

  const fondo = await colorDeFondo(entrada);
  const largo = Math.max(c.anchoEquipo, c.altoEquipo);
  // El lienzo es el equipo más el margen a cada lado, redondeado.
  const lado = Math.round(largo / (1 - 2 * MARGEN));
  const izq = Math.round((lado - c.anchoEquipo) / 2);
  const arriba = Math.round((lado - c.altoEquipo) / 2);

  return sharp(entrada)
    .flatten({ background: "#ffffff" })
    .trim({ threshold: 12 })
    .extend({
      top: arriba,
      bottom: lado - c.altoEquipo - arriba,
      left: izq,
      right: lado - c.anchoEquipo - izq,
      background: fondo,
    });
}

/**
 * Si el borde de la imagen es un fondo de estudio: claro y parejo.
 *
 * La misma cuenta que usa el indexador para clasificar un render —se achica
 * a 32×32 y se mira el anillo exterior—, así lo que acá se decide encuadrar
 * es lo mismo que después la tarjeta va a mostrar entero sobre su fondo.
 */
export async function fondoLimpio(entrada) {
  const { data } = await sharp(entrada)
    .flatten({ background: "#ffffff" })
    .resize(32, 32, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const borde = [];
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      if (x === 0 || y === 0 || x === 31 || y === 31) {
        const i = (y * 32 + x) * 3;
        borde.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
  }
  const medio = [0, 1, 2].map((c) => borde.reduce((s, p) => s + p[c], 0) / borde.length);
  const dispersion = Math.max(
    ...borde.map((p) => Math.sqrt(p.reduce((s, v, c) => s + (v - medio[c]) ** 2, 0)))
  );
  return dispersion < 42 && medio.every((c) => c > 232);
}
