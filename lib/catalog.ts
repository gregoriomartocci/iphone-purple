import type { Condition, Product, TradeInPrice, Variant } from "@/types";

/**
 * Helpers puros sobre el catálogo.
 *
 * Viven separados de `lib/data/` a propósito: acá no se importa nada del servidor,
 * así los componentes de cliente pueden usarlos sin arrastrar el cliente de
 * Supabase (y la service role key) al bundle del navegador.
 */

/** Variante más barata con stock; si no hay stock, la más barata a secas. */
export function leadVariant(product: Product): Variant | undefined {
  const withStock = product.variants.filter((v) => v.stock > 0);
  const pool = withStock.length > 0 ? withStock : product.variants;
  return [...pool].sort((a, b) => a.priceArs - b.priceArs)[0];
}

export function totalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function priceFrom(product: Product): number {
  return leadVariant(product)?.priceArs ?? 0;
}

/**
 * Ajuste sobre el valor base de canje según el estado declarado.
 * Son los mismos porcentajes que publicamos en el blog, para que el número
 * que ve el cliente sea auditable contra lo que decimos.
 */
export const CONDITION_MULTIPLIER: Record<Condition, number> = {
  nuevo: 1.25,
  "como-nuevo": 1.15,
  "muy-bueno": 1,
  bueno: 0.85,
};

export function quoteTradeIn(base: TradeInPrice, condition: Condition): number {
  return Math.round((base.baseValue * CONDITION_MULTIPLIER[condition]) / 5) * 5;
}
