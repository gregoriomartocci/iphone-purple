import type {
  CatalogFilters,
  Condition,
  Post,
  Product,
  RepairService,
  StoreSettings,
  TradeInPrice,
} from "@/types";
import * as seed from "./seed";
import * as db from "./supabase";
import { priceFrom, totalStock } from "@/lib/catalog";

// Los helpers puros viven en lib/catalog para que el cliente los use sin
// arrastrar este módulo (y con él, el acceso a Supabase) al bundle.
export {
  leadVariant,
  priceFrom,
  totalStock,
  CONDITION_MULTIPLIER,
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
    .map((v) => `${v.storage} ${v.color} ${v.condition}`)
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

  if (filters.brand) {
    items = items.filter((p) => normalize(p.brand) === normalize(filters.brand!));
  }

  if (filters.model) {
    items = items.filter((p) => normalize(p.model) === normalize(filters.model!));
  }

  if (filters.storage) {
    items = items.filter((p) =>
      p.variants.some((v) => normalize(v.storage) === normalize(filters.storage!))
    );
  }

  if (filters.condition) {
    items = items.filter((p) =>
      p.variants.some((v) => v.condition === filters.condition)
    );
  }

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

/** Opciones disponibles para los filtros, derivadas del catálogo real. */
export async function getCatalogFacets(): Promise<{
  brands: string[];
  models: string[];
  storages: string[];
  conditions: Condition[];
}> {
  const items = await allProducts();
  const storages = [...new Set(items.flatMap((p) => p.variants.map((v) => v.storage)))];
  const conditions = [
    ...new Set(items.flatMap((p) => p.variants.map((v) => v.condition))),
  ];

  return {
    brands: [...new Set(items.map((p) => p.brand))].sort(),
    models: [...new Set(items.map((p) => p.model))].sort(),
    // "128GB" antes que "512GB" antes que "46mm GPS": numérico primero, resto alfabético.
    storages: storages.sort((a, b) => {
      const na = parseInt(a, 10);
      const nb = parseInt(b, 10);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    }),
    conditions,
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
