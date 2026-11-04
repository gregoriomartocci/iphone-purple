/**
 * La cotización del dólar, que es de lo que cuelga todo precio en pesos. Es el
 * USDT de Binance P2P: lo que cuesta reponer los dólares con que se paga al proveedor.
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

/** Lo que hace falta de un aviso de compra de Binance P2P. */
export interface AvisoP2P {
  adv: { price: string; surplusAmount: string };
  advertiser: { monthOrderCount: number; monthFinishRate: number };
}

/** Por debajo de esto, un vendedor no tiene historial suficiente para confiar. */
const ORDENES_MINIMAS = 50;
const CUMPLIMIENTO_MINIMO = 0.95;
/** Tiene que alcanzar para pagar al menos un equipo caro. */
const USDT_DISPONIBLES_MINIMOS = 1_000;

/**
 * El precio más bajo al que de verdad se puede comprar USDT.
 *
 * Son avisos de compra porque ese es el costo de reponer dólares para pagarle
 * al proveedor. El más barato a secas suele tener poco saldo o poco historial,
 * y usarlo publicaría un precio que después no se consigue.
 */
export function mejorOfertaP2P(avisos: AvisoP2P[]): number | null {
  const precios = avisos
    .filter(
      (a) =>
        a.advertiser.monthOrderCount >= ORDENES_MINIMAS &&
        a.advertiser.monthFinishRate >= CUMPLIMIENTO_MINIMO &&
        Number(a.adv.surplusAmount) >= USDT_DISPONIBLES_MINIMOS
    )
    .map((a) => Number(a.adv.price))
    .filter((precio) => Number.isFinite(precio) && precio > 0);
  return precios.length > 0 ? Math.min(...precios) : null;
}

/** Por debajo de este cambio no vale la pena reescribir los precios del catálogo. */
export const CAMBIO_MINIMO = 0.005;

export function cambioMenor(nueva: number, actual: number | null): boolean {
  return Boolean(
    actual && actual > 0 && Math.abs(nueva - actual) / actual < CAMBIO_MINIMO
  );
}

/**
 * Trae el USDT de Binance P2P, con dos respaldos.
 *
 * El endpoint de Binance es público pero no está documentado, y puede rechazar
 * pedidos según la región. Los respaldos son referencias del mismo mercado.
 */
export async function traerCotizacion(): Promise<Cotizacion> {
  const ahora = new Date().toISOString();
  const fuentes: {
    nombre: string;
    url: string;
    init?: RequestInit;
    leer: (d: Record<string, unknown>) => Cotizacion | null;
  }[] = [
    {
      nombre: "binance-p2p",
      url: "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
      init: {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          asset: "USDT",
          fiat: "ARS",
          tradeType: "BUY",
          page: 1,
          rows: 20,
          payTypes: [],
          publisherType: null,
          transAmount: 1_000_000,
        }),
      },
      leer: (d) => {
        const venta = mejorOfertaP2P((d.data ?? []) as AvisoP2P[]);
        return venta ? { venta, fecha: ahora, fuente: "binance-p2p" } : null;
      },
    },
    {
      nombre: "criptoya",
      url: "https://criptoya.com/api/binancep2p/usdt/ars/1000",
      leer: (d) =>
        typeof d.ask === "number"
          ? { venta: d.ask, fecha: ahora, fuente: "criptoya" }
          : null,
    },
    {
      nombre: "dolarapi-cripto",
      url: "https://dolarapi.com/v1/dolares/cripto",
      leer: (d) =>
        typeof d.venta === "number"
          ? {
              venta: d.venta,
              fecha: String(d.fechaActualizacion ?? ahora),
              fuente: "dolarapi-cripto",
            }
          : null,
    },
  ];

  const fallas: string[] = [];

  for (const fuente of fuentes) {
    try {
      const res = await fetch(fuente.url, {
        ...fuente.init,
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });
      if (!res.ok) {
        fallas.push(`${fuente.nombre}: HTTP ${res.status}`);
        continue;
      }
      const leida = fuente.leer(await res.json());
      if (leida) return leida;
      fallas.push(`${fuente.nombre}: la respuesta no traía un precio utilizable`);
    } catch (err) {
      fallas.push(
        `${fuente.nombre}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  throw new Error(`No se pudo traer la cotización. ${fallas.join(" · ")}`);
}
