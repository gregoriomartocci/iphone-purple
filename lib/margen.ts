import type { Category } from "@/types";

/**
 * Cómo se marca el precio sobre el costo.
 *
 * Dos formas, porque el negocio usa las dos. El porcentaje sirve donde el
 * costo manda —un iPhone de US$ 900 no se vende con US$ 80 encima— y el monto
 * fijo sirve en lo barato, donde un 18 % sobre un cable de US$ 4 no paga ni el
 * tiempo de atender la venta.
 */
export type TipoMargen = "porcentaje" | "fijo";

export interface Margen {
  tipo: TipoMargen;
  /** Porcentaje sobre el costo, o monto fijo en dólares. */
  valor: number;
}

/**
 * Las reglas de margen, de la más general a la más específica.
 *
 * Gana siempre la más específica que aplique. El orden es producto →
 * proveedor → categoría → general, y no al revés: si alguien fijó un margen
 * para un equipo puntual fue porque ese equipo tiene algo distinto, y una
 * regla amplia no debería pisarlo.
 *
 * Se guarda el porqué junto al número, para que la tabla del panel pueda
 * decir de dónde salió cada precio. Un margen que no se puede explicar es un
 * margen que nadie se anima a tocar.
 */
export interface ReglasMargen {
  general: Margen;
  porCategoria?: Partial<Record<Category, Margen>>;
  porProveedor?: Record<string, Margen>;
  porProducto?: Record<string, Margen>;
}

export interface MargenAplicado extends Margen {
  /** De qué regla salió, para mostrarlo en el panel. */
  origen: "producto" | "proveedor" | "categoria" | "general";
}

/** Qué margen le toca a un equipo, y por qué. */
export function resolverMargen(
  reglas: ReglasMargen,
  contexto: { slug?: string; supplierId?: string | null; category?: Category }
): MargenAplicado {
  const porProducto = contexto.slug ? reglas.porProducto?.[contexto.slug] : undefined;
  if (porProducto) return { ...porProducto, origen: "producto" };

  const porProveedor = contexto.supplierId
    ? reglas.porProveedor?.[contexto.supplierId]
    : undefined;
  if (porProveedor) return { ...porProveedor, origen: "proveedor" };

  const porCategoria = contexto.category
    ? reglas.porCategoria?.[contexto.category]
    : undefined;
  if (porCategoria) return { ...porCategoria, origen: "categoria" };

  return { ...reglas.general, origen: "general" };
}

/**
 * Precio de venta en dólares a partir del costo.
 *
 * Se redondea a dólar entero: los proveedores cotizan así y un precio con
 * centavos se lee como un cálculo automático, no como un precio decidido.
 */
export function precioUsd(costoUsd: number, margen: Margen): number {
  const bruto =
    margen.tipo === "fijo"
      ? costoUsd + margen.valor
      : costoUsd * (1 + margen.valor / 100);
  return Math.max(0, Math.round(bruto));
}

/**
 * Precio en pesos, redondeado hacia arriba a los diez mil.
 *
 * Hacia arriba y no al más cercano: redondear para abajo se come margen, y
 * sobre setenta equipos eso deja de ser un detalle. A los diez mil porque un
 * precio como $1.218.437 se lee como el resultado de una fórmula.
 */
export function precioArs(precioEnUsd: number, cotizacion: number): number {
  return Math.ceil((precioEnUsd * cotizacion) / 10_000) * 10_000;
}

/**
 * El margen que un precio tiene de verdad, en porcentaje sobre el costo.
 *
 * Es lo que permite contestar "¿estoy aplicando el margen correcto?": el
 * precio publicado puede venir de una lista vieja, de una corrección a mano o
 * de un redondeo, y este número lo compara contra el costo real de hoy.
 *
 * Con costo cero devuelve null en vez de infinito: pasa con los equipos que se
 * cargaron sin costo, y un "∞ %" en la tabla no dice nada.
 */
export function margenReal(costoUsd: number, precioEnUsd: number): number | null {
  if (costoUsd <= 0) return null;
  return ((precioEnUsd - costoUsd) / costoUsd) * 100;
}

/** Ganancia en dólares de una venta a ese precio. */
export function gananciaUsd(costoUsd: number, precioEnUsd: number): number {
  return Math.round((precioEnUsd - costoUsd) * 100) / 100;
}

/**
 * Si el precio publicado se aleja del que debería tener.
 *
 * La tolerancia existe porque el precio en pesos se redondea a los diez mil y
 * eso mueve el margen efectivo uno o dos puntos sin que nadie haya hecho nada
 * mal. Marcar eso como desvío llenaría la tabla de alertas que hay que
 * ignorar, y una alerta que se ignora deja de ser una alerta.
 */
export function desviado(
  costoUsd: number,
  precioEnUsd: number,
  margen: Margen,
  toleranciaPct = 3
): boolean {
  const esperado = precioUsd(costoUsd, margen);
  if (esperado <= 0) return false;
  return Math.abs((precioEnUsd - esperado) / esperado) * 100 > toleranciaPct;
}

/** Cómo se escribe un margen en la interfaz. */
export function describirMargen(margen: Margen): string {
  return margen.tipo === "fijo" ? `US$ ${margen.valor} fijos` : `${margen.valor} %`;
}
