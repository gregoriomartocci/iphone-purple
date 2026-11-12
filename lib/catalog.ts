import { coloresDe } from "@/lib/colores";
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
 * Si el descriptor de una variante es una capacidad de almacenamiento real.
 *
 * El campo `storage` guarda lo que distingue a la variante, y eso no siempre
 * es capacidad: en un Apple Watch es el tamaño de caja ("46mm GPS") y en unos
 * AirPods el conector ("USB-C"). Ofrecerlos dentro del filtro de
 * almacenamiento no tiene sentido, así que el filtro solo lista capacidades.
 */
export function isCapacity(storage: string): boolean {
  return /^\d+\s*(GB|TB)$/i.test(storage.trim());
}

/** Capacidad en GB, para poder ordenar 64 · 128 · 256 · 512 · 1TB. */
export function capacityInGb(storage: string): number {
  const match = storage.trim().match(/^(\d+)\s*(GB|TB)$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const value = Number(match[1]);
  return match[2].toUpperCase() === "TB" ? value * 1024 : value;
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
  | "minPrice"
  | "maxPrice"
  | "includeOutOfStock"
>;

export function matchesVariant(variant: Variant, filters: VariantFilters): boolean {
  if (filters.state && stateOf(variant.grade) !== filters.state) return false;
  if (filters.grade && variant.grade !== filters.grade) return false;
  if (filters.storage && variant.storage !== filters.storage) return false;
  if (filters.color && !coloresDe(variant).some((c) => c.nombre === filters.color))
    return false;
  if (filters.authenticity && variant.authenticity !== filters.authenticity) return false;
  if (filters.minPrice !== undefined && variant.priceArs < filters.minPrice) return false;
  if (filters.maxPrice !== undefined && variant.priceArs > filters.maxPrice) return false;
  // Lo agotado no se muestra en el sitio: si no está, no se ofrece.
  if (!filters.includeOutOfStock && variant.stock <= 0) return false;
  if (filters.minBattery !== undefined) {
    // Un sellado no informa batería pero siempre cumple cualquier mínimo.
    const health = variant.grade === "sellado" ? 100 : variant.batteryHealth;
    if (health === null || health < filters.minBattery) return false;
  }
  return true;
}

/**
 * La galería del color elegido.
 *
 * Elegir un color es querer ver el equipo en ese color, y lo que se ve es lo
 * que la persona espera recibir: si el color tiene fotos, las de otros colores
 * se van. Quedan las suyas, después las que no se etiquetaron y al final los
 * videos: primero se quiere ver el equipo quieto.
 *
 * Si el color no tiene ninguna foto no se esconde nada, porque una ficha vacía
 * no ayuda, pero `delColor` en false permite avisar que lo que se ve es otro.
 *
 * Es estable: dentro de cada grupo se respeta el orden que ya traía la
 * galería, que es el que pone los renders de estudio adelante.
 */
export function galeriaDelColor<T extends { colores?: string[]; video?: boolean }>(
  piezas: T[],
  color: string | undefined
): { piezas: T[]; delColor: boolean } {
  if (!color) return { piezas, delColor: false };
  const delColor = piezas.some((p) => p.colores?.includes(color));
  const grupo = (p: T) => {
    if (p.video) return 3;
    if (!p.colores?.length) return 1;
    return p.colores.includes(color) ? 0 : 2;
  };
  return {
    delColor,
    piezas: piezas
      .filter((p) => !delColor || !p.colores?.length || p.colores.includes(color))
      .map((p, i) => ({ p, i, g: grupo(p) }))
      .sort((a, b) => a.g - b.g || a.i - b.i)
      .map(({ p }) => p),
  };
}

/**
 * El orden de las fotos de un producto.
 *
 * La primera es la portada del catálogo, la de la comparación y la que abre la
 * ficha, así que manda lo que la persona espera ver primero:
 *
 * 1. Las de estudio, del equipo solo sobre fondo parejo. Es lo que se ve
 *    profesional, y una foto con mano y ventana no puede tapar a una así.
 * 2. Las demás tomas reales del equipo.
 * 3. Las de colores que no se venden. Si la portada fuera una MacBook Silver
 *    cuando solo hay Starlight y Sky Blue, la tarjeta prometería algo que no
 *    se puede comprar. No se esconden: en la ficha, elegir un color ya las
 *    deja afuera cuando ese color tiene fotos propias.
 *
 * Una foto sin color etiquetado no se castiga: no se sabe de qué color es. Es
 * estable: dentro de cada grupo se respeta el orden que ya traía.
 */
export function ordenarFotosDelProducto<
  T extends { colores?: string[]; render?: boolean },
>(fotos: T[], vendidos: Iterable<string>): T[] {
  const enVenta = new Set(vendidos);
  const ajena = (f: T) =>
    enVenta.size > 0 &&
    Boolean(f.colores?.length) &&
    !f.colores!.some((c) => enVenta.has(c));
  const grupo = (f: T) => (ajena(f) ? 2 : f.render ? 0 : 1);
  return fotos
    .map((f, i) => ({ f, i, g: grupo(f) }))
    .sort((x, y) => x.g - y.g || x.i - y.i)
    .map(({ f }) => f);
}

/**
 * Las fotos que se pueden deslizar en la tarjeta del catálogo.
 *
 * Primero una por cada color que se vende, en el orden de las variantes, así
 * deslizar es recorrer los colores sin entrar a la ficha. Si el catálogo está
 * filtrado por un color, ese va primero. Después se completa con otras tomas
 * del equipo, sin videos ni fotos de colores que no se venden, hasta `maximo`.
 */
export function fotosDeTarjeta<
  T extends { url: string; colores?: string[]; video?: boolean; render?: boolean },
>(
  fotos: T[],
  coloresEnVenta: string[],
  { maximo = 5, primero }: { maximo?: number; primero?: string } = {}
): (T & { color?: string })[] {
  const vendidos = [...new Set(coloresEnVenta)];
  const orden =
    primero && vendidos.includes(primero)
      ? [primero, ...vendidos.filter((c) => c !== primero)]
      : vendidos;
  const usables = fotos.filter(
    (f) => !f.video && (!f.colores?.length || f.colores.some((c) => vendidos.includes(c)))
  );

  const elegidas: (T & { color?: string })[] = [];
  const usadas = new Set<string>();
  for (const color of orden) {
    // De cada color, la de estudio si la hay.
    const delColor = usables.filter(
      (f) => f.colores?.includes(color) && !usadas.has(f.url)
    );
    const foto = delColor.find((f) => f.render) ?? delColor[0];
    if (!foto) continue;
    elegidas.push({ ...foto, color });
    usadas.add(foto.url);
  }
  for (const f of usables) {
    if (!usadas.has(f.url)) elegidas.push(f);
    usadas.add(f.url);
  }
  return elegidas.slice(0, maximo);
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
