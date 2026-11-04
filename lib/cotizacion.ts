/**
 * La cotización del dólar, que es de lo que cuelga todo precio en pesos.
 *
 * Los proveedores cotizan en dólares y el catálogo publica en pesos, así que
 * este número multiplica a todo. Equivocarlo no rompe nada visiblemente: deja
 * el catálogo entero mal y parece normal.
 */

/** Cuánto puede moverse en un día antes de que convenga que lo mire alguien. */
const SALTO_SOSPECHOSO = 0.15;

/** Fuera de esto no es una cotización: es un cero, un null o un dato de otra cosa. */
const MINIMO = 100;
const MAXIMO = 100_000;

/** Más vieja que esto, no sirve para publicar precios de hoy. */
const DIAS_MAXIMOS = 7;

export interface Cotizacion {
  venta: number;
  fecha: string;
  fuente: string;
}

/**
 * El precio en pesos a partir del precio en dólares.
 *
 * Vive acá y no dentro de `sellPrice` porque hay dos caminos que lo necesitan:
 * publicar una lista nueva y recalcular el catálogo cuando cambia la
 * cotización. Con dos copias, un cambio de redondeo en una deja la otra
 * publicando números distintos para el mismo equipo.
 *
 * Se redondea hacia arriba a la decena de miles para que queden cifras
 * presentables: $1.250.000 y no $1.247.318.
 */
export function precioArsDesdeUsd(precioUsd: number, cotizacion: number): number {
  return Math.ceil((precioUsd * cotizacion) / 10_000) * 10_000;
}

export type RevisionCotizacion =
  | { ok: true }
  | { ok: false; motivo: "fuera-de-rango" | "vieja" | "salto-grande"; detalle: string };

/**
 * Si una cotización recién traída se puede aplicar sin que la mire nadie.
 *
 * El salto grande es el control que importa. Una API que devuelve 15.650 en
 * vez de 1.565 —un cero de más, el error más común de todos— pasa cualquier
 * chequeo de "¿es un número positivo?" y multiplica por diez el catálogo
 * entero. Un movimiento real del blue de más del 15% en un día existe, pero es
 * raro; que lo confirme una persona cuesta un minuto y la alternativa cuesta
 * el catálogo.
 */
export function revisarCotizacion(
  nueva: Cotizacion,
  actual: number | null
): RevisionCotizacion {
  if (!Number.isFinite(nueva.venta) || nueva.venta < MINIMO || nueva.venta > MAXIMO) {
    return {
      ok: false,
      motivo: "fuera-de-rango",
      detalle: `${nueva.venta} no parece una cotización: se esperaba entre ${MINIMO} y ${MAXIMO}.`,
    };
  }

  const dias = (Date.now() - Date.parse(nueva.fecha)) / 86_400_000;
  if (!Number.isFinite(dias) || dias > DIAS_MAXIMOS) {
    return {
      ok: false,
      motivo: "vieja",
      detalle: `La cotización es del ${nueva.fecha}, demasiado vieja para publicar precios de hoy.`,
    };
  }

  if (actual && actual > 0) {
    const salto = Math.abs(nueva.venta - actual) / actual;
    if (salto > SALTO_SOSPECHOSO) {
      return {
        ok: false,
        motivo: "salto-grande",
        detalle: `Salta de ${actual} a ${nueva.venta}, un ${Math.round(salto * 100)}%. Confirmalo a mano antes de aplicarlo.`,
      };
    }
  }

  return { ok: true };
}

/**
 * Trae el blue vendedor, con una fuente de respaldo.
 *
 * Dos fuentes y no una porque esto va a correr solo todos los días: si la
 * única se cae un martes, el catálogo se queda con la cotización del lunes sin
 * que nadie se entere.
 */
export async function traerCotizacion(): Promise<Cotizacion> {
  const fuentes = [
    {
      nombre: "dolarapi",
      url: "https://dolarapi.com/v1/dolares/blue",
      leer: (d: Record<string, unknown>): Cotizacion | null =>
        typeof d.venta === "number"
          ? {
              venta: d.venta,
              fecha: String(d.fechaActualizacion ?? new Date().toISOString()),
              fuente: "dolarapi",
            }
          : null,
    },
    {
      nombre: "bluelytics",
      url: "https://api.bluelytics.com.ar/v2/latest",
      leer: (d: Record<string, unknown>): Cotizacion | null => {
        const blue = d.blue as { value_sell?: unknown } | undefined;
        return typeof blue?.value_sell === "number"
          ? {
              venta: blue.value_sell,
              fecha: String(d.last_update ?? new Date().toISOString()),
              fuente: "bluelytics",
            }
          : null;
      },
    },
  ];

  const fallas: string[] = [];

  for (const fuente of fuentes) {
    try {
      const res = await fetch(fuente.url, {
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });
      if (!res.ok) {
        fallas.push(`${fuente.nombre}: HTTP ${res.status}`);
        continue;
      }
      const leida = fuente.leer(await res.json());
      if (leida) return leida;
      fallas.push(`${fuente.nombre}: la respuesta no traía el valor de venta`);
    } catch (err) {
      fallas.push(
        `${fuente.nombre}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  throw new Error(`No se pudo traer la cotización. ${fallas.join(" · ")}`);
}
