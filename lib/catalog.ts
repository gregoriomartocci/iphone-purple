import {
  GRADES,
  stateOf,
  type CatalogFilters,
  type Grade,
  type Line,
  type Product,
  type TradeInPrice,
  type Variant,
} from "@/types";

/**
 * Helpers puros sobre el catálogo.
 *
 * Viven separados de `lib/data/` a propósito: acá no se importa nada del servidor,
 * así los componentes de cliente pueden usarlos sin arrastrar el cliente de
 * Supabase (y la service role key) al bundle del navegador.
 */

/**
 * Variante que representa al producto en la grilla.
 *
 * Es la más barata con stock, pero **respetando los filtros activos**: si
 * alguien filtró por "Sellado", la tarjeta tiene que mostrar el precio y el
 * grado del sellado, no los de una seminueva más barata. Mostrar algo distinto
 * de lo que se pidió es la forma más rápida de perder la confianza.
 */
export function leadVariant(
  product: Product,
  filters: VariantFilters = {}
): Variant | undefined {
  const matching = product.variants.filter((v) => matchesVariant(v, filters));
  // Si el filtro no deja ninguna, volvemos al catálogo completo del producto.
  const candidates = matching.length > 0 ? matching : product.variants;

  const withStock = candidates.filter((v) => v.stock > 0);
  const pool = withStock.length > 0 ? withStock : candidates;
  return [...pool].sort((a, b) => a.priceArs - b.priceArs)[0];
}

/**
 * Deduce generación y línea del nombre del modelo.
 *
 * Se calcula una vez al cargar el catálogo en vez de guardarse a mano: los
 * modelos entran por el importador de listas, donde nadie va a completar dos
 * campos más. Si el nombre no tiene número —una consola, un Mac— no hay
 * generación y el filtro simplemente no aplica.
 */
export function parseModel(model: string): {
  generation: number | null;
  line: Line | null;
} {
  const normalized = model.toLowerCase();

  const generationMatch = normalized.match(/\b(\d{1,2})\b/);
  const generation = generationMatch ? Number(generationMatch[1]) : null;

  // El orden importa: "pro max" tiene que evaluarse antes que "pro".
  const line: Line | null = normalized.includes("pro max")
    ? "pro-max"
    : normalized.includes("ultra")
      ? "ultra"
      : normalized.includes("pro")
        ? "pro"
        : normalized.includes("plus")
          ? "plus"
          : normalized.includes("mini")
            ? "mini"
            : normalized.includes("air")
              ? "air"
              : generation !== null
                ? "base"
                : null;

  return { generation, line };
}

/**
 * Si una variante cumple los criterios que se aplican a nivel variante.
 *
 * Está acá y no en la capa de datos porque lo usan las dos: el filtrado del
 * listado y la elección de qué variante mostrar en la tarjeta. Si divergieran,
 * el catálogo mostraría un equipo y la tarjeta anunciaría otro.
 */
export type VariantFilters = Pick<
  CatalogFilters,
  | "state"
  | "grade"
  | "storage"
  | "color"
  | "authenticity"
  | "minBattery"
  | "includeOutOfStock"
>;

export function matchesVariant(variant: Variant, filters: VariantFilters): boolean {
  if (filters.state && stateOf(variant.grade) !== filters.state) return false;
  if (filters.grade && variant.grade !== filters.grade) return false;
  if (filters.storage && variant.storage !== filters.storage) return false;
  if (filters.color && variant.color !== filters.color) return false;
  if (filters.authenticity && variant.authenticity !== filters.authenticity) return false;
  // Lo agotado no se muestra en el sitio: si no está, no se ofrece.
  if (!filters.includeOutOfStock && variant.stock <= 0) return false;
  if (filters.minBattery !== undefined) {
    // Un sellado no informa batería pero siempre cumple cualquier mínimo.
    const health = variant.grade === "sellado" ? 100 : variant.batteryHealth;
    if (health === null || health < filters.minBattery) return false;
  }
  return true;
}

export function totalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function priceFrom(product: Product): number {
  return leadVariant(product)?.priceArs ?? 0;
}

/** Si el producto tiene alguna variante que no sea original. */
export function hasReplica(product: Product): boolean {
  return product.variants.some((v) => v.authenticity === "replica");
}

/**
 * Ajuste sobre el valor base de canje según el grado declarado.
 * Son los mismos porcentajes que publicamos, para que el número que ve el
 * cliente sea auditable contra lo que decimos.
 */
export const GRADE_MULTIPLIER: Record<Grade, number> = {
  sellado: 1.25,
  "a-plus": 1.15,
  a: 1,
  "a-minus": 0.85,
};

export function quoteTradeIn(base: TradeInPrice, grade: Grade): number {
  return Math.round((base.baseValue * GRADE_MULTIPLIER[grade]) / 5) * 5;
}

/** Grados ordenados de mejor a peor. Útil para armar selectores. */
export const GRADES_BEST_FIRST = GRADES;

/**
 * Cuánto se ahorra llevando esta variante en lugar del mismo equipo sellado.
 *
 * Es el dato que más mira quien compra un seminuevo, y solo tiene sentido si
 * tenemos el sellado en el mismo producto: comparar contra un precio de lista
 * que no vendemos sería inventarle un descuento al cliente.
 */
export function savingsVsNew(product: Product, variant: Variant): number | null {
  if (variant.grade === "sellado") return null;

  const sealed = product.variants.filter(
    (v) =>
      v.grade === "sellado" &&
      v.storage === variant.storage &&
      v.authenticity === variant.authenticity
  );
  if (sealed.length === 0) return null;

  const cheapestSealed = Math.min(...sealed.map((v) => v.priceArs));
  const diff = cheapestSealed - variant.priceArs;

  // Un ahorro menor al 5 % no vale la pena destacarlo.
  return diff > 0 && diff / cheapestSealed >= 0.05 ? diff : null;
}
