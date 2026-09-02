import { BATTERY_TIERS, CATEGORIES, GRADES } from "@/types";
import type {
  CatalogFilters,
  Post,
  Product,
  RepairService,
  StoreSettings,
  TradeInPrice,
} from "@/types";
import * as seed from "./seed";
import * as db from "./supabase";
import { matchesVariant, priceFrom, totalStock } from "@/lib/catalog";

// Los helpers puros viven en lib/catalog para que el cliente los use sin
// arrastrar este módulo (y con él, el acceso a Supabase) al bundle.
export {
  leadVariant,
  matchesVariant,
  priceFrom,
  totalStock,
  hasReplica,
  savingsVsNew,
  GRADE_MULTIPLIER,
  quoteTradeIn,
} from "@/lib/catalog";

/**
 * Puerta única a los datos del sitio.
 *
 * Si Supabase está configurado, lee de ahí; si no, sirve la semilla de `seed.ts`.
 * Las páginas nunca saben cuál de los dos está activo — por eso conectar la base
 * más adelante no obliga a tocar ninguna vista.
 */

/**
 * Las claves de ejemplo son cortas; una anon key real de Supabase es un JWT largo.
 * Ese contraste alcanza para distinguir "configurado" de "placeholder".
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return url.startsWith("https://") && url.includes(".supabase.co") && key.length > 40;
}

async function allProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return seed.PRODUCTS;
  try {
    return await db.fetchProducts();
  } catch (err) {
    console.error("[data] Supabase falló, uso la semilla:", err);
    return seed.PRODUCTS;
  }
}

/** Texto plano sobre el que corre la búsqueda libre. */
function haystack(product: Product): string {
  const variantText = product.variants
    .map((v) => `${v.storage} ${v.color} ${v.grade} ${v.authenticity}`)
    .join(" ");
  return `${product.name} ${product.brand} ${product.model} ${product.category} ${variantText}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

// ---------------------------------------------------------------- catálogo

export async function getProducts(filters: CatalogFilters = {}): Promise<Product[]> {
  let items = await allProducts();

  if (filters.q) {
    // Cada palabra tiene que aparecer: "15 pro" no debe traer todos los "pro".
    const terms = normalize(filters.q).split(/\s+/).filter(Boolean);
    items = items.filter((p) => {
      const text = haystack(p);
      return terms.every((term) => text.includes(term));
    });
  }

  if (filters.category) {
    items = items.filter((p) => p.category === filters.category);
  }

  if (filters.model) {
    items = items.filter((p) => normalize(p.model) === normalize(filters.model!));
  }

  /**
   * Autenticidad: si no se pide explícitamente, se muestran SOLO originales.
   * Las réplicas existen y son buscables, pero nunca aparecen mezcladas con los
   * originales sin que la persona las haya pedido.
   */
  const authenticity = filters.authenticity ?? "original";

  // El resto de los criterios se evalúan sobre las variantes: alcanza con que
  // UNA cumpla para que el producto entre al listado.
  items = items.filter((p) =>
    p.variants.some((v) =>
      matchesVariant(v, {
        authenticity,
        grade: filters.grade,
        storage: filters.storage,
        minBattery: filters.minBattery,
      })
    )
  );

  if (filters.inStockOnly) {
    items = items.filter((p) => totalStock(p) > 0);
  }

  switch (filters.sort) {
    case "precio-asc":
      items = [...items].sort((a, b) => priceFrom(a) - priceFrom(b));
      break;
    case "precio-desc":
      items = [...items].sort((a, b) => priceFrom(b) - priceFrom(a));
      break;
    case "nuevo":
      items = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    default:
      // Relevancia: primero lo que se puede comprar hoy, después lo destacado.
      items = [...items].sort((a, b) => {
        const stockDiff = Number(totalStock(b) > 0) - Number(totalStock(a) > 0);
        if (stockDiff !== 0) return stockDiff;
        return Number(b.isFeatured) - Number(a.isFeatured);
      });
  }

  return items;
}

export async function getProduct(slug: string): Promise<Product | null> {
  const items = await allProducts();
  return items.find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const items = await allProducts();
  return items.filter((p) => p.isFeatured && totalStock(p) > 0).slice(0, limit);
}

export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const items = await allProducts();
  return items
    .filter((p) => p.id !== product.id && p.category === product.category)
    .sort(
      (a, b) =>
        Math.abs(priceFrom(a) - priceFrom(product)) -
        Math.abs(priceFrom(b) - priceFrom(product))
    )
    .slice(0, limit);
}

/** Una opción de filtro con cuántos equipos la cumplen. */
export type Facet = { value: string; count: number };

export type CatalogFacets = {
  categories: Facet[];
  models: Facet[];
  storages: Facet[];
  grades: Facet[];
  batteryTiers: Facet[];
  replicaCount: number;
  priceRange: { min: number; max: number };
};

/**
 * Opciones de filtro con su cantidad de resultados.
 *
 * Los contadores se calculan sobre el catálogo YA filtrado por el resto de los
 * criterios, menos el propio: así "128GB (4)" significa "si además tildás esto,
 * te quedan 4", que es lo único que le sirve a quien filtra. Contarlos sobre el
 * catálogo entero mostraría números que no se cumplen al hacer clic.
 */
export async function getCatalogFacets(
  filters: CatalogFilters = {}
): Promise<CatalogFacets> {
  const all = await allProducts();
  const authenticity = filters.authenticity ?? "original";

  const countWith = async (extra: Partial<CatalogFilters>) =>
    (await getProducts({ ...filters, ...extra })).length;

  // El universo de opciones sale de lo que existe con esta autenticidad.
  const visible = all.filter((p) =>
    p.variants.some((v) => v.authenticity === authenticity)
  );

  const categories = CATEGORIES.filter((c) => visible.some((p) => p.category === c));
  const models = [...new Set(visible.map((p) => p.model))].sort();
  const storages = [
    ...new Set(visible.flatMap((p) => p.variants.map((v) => v.storage))),
  ].sort((a, b) => {
    const na = parseInt(a, 10);
    const nb = parseInt(b, 10);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });
  const grades = GRADES.filter((g) =>
    visible.some((p) => p.variants.some((v) => v.grade === g))
  );

  const prices = visible
    .flatMap((p) => p.variants.map((v) => v.priceArs))
    .filter((n) => n > 0);

  const [categoryCounts, modelCounts, storageCounts, gradeCounts, batteryCounts] =
    await Promise.all([
      Promise.all(
        categories.map(async (c) => ({
          value: c,
          count: await countWith({ category: c }),
        }))
      ),
      Promise.all(
        models.map(async (m) => ({ value: m, count: await countWith({ model: m }) }))
      ),
      Promise.all(
        storages.map(async (s) => ({ value: s, count: await countWith({ storage: s }) }))
      ),
      Promise.all(
        grades.map(async (g) => ({ value: g, count: await countWith({ grade: g }) }))
      ),
      Promise.all(
        BATTERY_TIERS.map(async (t) => ({
          value: String(t),
          count: await countWith({ minBattery: t }),
        }))
      ),
    ]);

  // Cuántas réplicas hay, para ofrecer el acceso sin mezclarlas.
  const replicaCount = (await getProducts({ ...filters, authenticity: "replica" }))
    .length;

  return {
    // Una opción con cero resultados solo estorba.
    categories: categoryCounts.filter((f) => f.count > 0),
    models: modelCounts.filter((f) => f.count > 0),
    storages: storageCounts.filter((f) => f.count > 0),
    grades: gradeCounts.filter((f) => f.count > 0),
    batteryTiers: batteryCounts.filter((f) => f.count > 0),
    replicaCount,
    priceRange: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    },
  };
}

// ---------------------------------------------------------------- contenido

export async function getRepairServices(): Promise<RepairService[]> {
  if (!isSupabaseConfigured()) return seed.REPAIR_SERVICES.filter((s) => s.isActive);
  try {
    return await db.fetchRepairServices();
  } catch (err) {
    console.error("[data] Supabase falló, uso la semilla:", err);
    return seed.REPAIR_SERVICES.filter((s) => s.isActive);
  }
}

export async function getPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured()) return seed.POSTS;
  try {
    return await db.fetchPosts();
  } catch (err) {
    console.error("[data] Supabase falló, uso la semilla:", err);
    return seed.POSTS;
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

// ---------------------------------------------------------------- canje

export async function getTradeInPrices(): Promise<TradeInPrice[]> {
  if (!isSupabaseConfigured()) return seed.TRADE_IN_PRICES;
  try {
    return await db.fetchTradeInPrices();
  } catch (err) {
    console.error("[data] Supabase falló, uso la semilla:", err);
    return seed.TRADE_IN_PRICES;
  }
}

// ---------------------------------------------------------------- ajustes

export async function getSettings(): Promise<StoreSettings> {
  if (!isSupabaseConfigured()) return seed.SETTINGS;
  try {
    return await db.fetchSettings();
  } catch (err) {
    console.error("[data] Supabase falló, uso la semilla:", err);
    return seed.SETTINGS;
  }
}
