import { createClient } from "@/lib/supabase/server";
import { parseModel } from "@/lib/catalog";
import type {
  Category,
  Grade,
  Post,
  Product,
  RepairService,
  StoreSettings,
  TradeInPrice,
  Variant,
} from "@/types";
import { SETTINGS as DEFAULT_SETTINGS } from "./seed";

/**
 * Lectura desde Supabase.
 *
 * Devuelve objetos de dominio ya mapeados: el filtrado y el orden viven en
 * `lib/data/index.ts` y corren igual contra la base o contra la semilla, así el
 * catálogo se comporta idéntico en los dos modos.
 */

// Las filas llegan de PostgREST sin tipar; estas formas describen lo que pedimos.
type VariantRow = {
  id: string;
  product_id: string;
  storage: string | null;
  color: string | null;
  color_hex: string | null;
  grade: string | null;
  authenticity: string | null;
  battery_health: number | null;
  price_ars: number | string | null;
  price_usd: number | string | null;
  cost_usd: number | string | null;
  stock: number | null;
  sku: string | null;
};

type ImageRow = { url: string; alt: string | null; sort_order: number | null };

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  description: string | null;
  specs: Record<string, string> | null;
  is_featured: boolean | null;
  created_at: string;
  variants: VariantRow[] | null;
  images: ImageRow[] | null;
};

const num = (value: number | string | null | undefined): number => {
  const parsed = typeof value === "string" ? parseFloat(value) : value;
  return typeof parsed === "number" && !isNaN(parsed) ? parsed : 0;
};

const VALID_GRADES: Grade[] = ["sellado", "a-plus", "a", "a-minus"];

const toGrade = (value: string | null): Grade =>
  VALID_GRADES.includes(value as Grade) ? (value as Grade) : "a";

const VALID_CATEGORIES: Category[] = [
  "celular",
  "tablet",
  "notebook",
  "reloj",
  "audio",
  "consola",
  "hogar",
  "accesorio",
];

const toCategory = (value: string | null): Category =>
  VALID_CATEGORIES.includes(value as Category) ? (value as Category) : "celular";

function mapVariant(row: VariantRow): Variant {
  return {
    id: row.id,
    productId: row.product_id,
    storage: row.storage ?? "",
    color: row.color ?? "",
    colorHex: row.color_hex ?? "#cccccc",
    grade: toGrade(row.grade),
    authenticity: row.authenticity === "replica" ? "replica" : "original",
    batteryHealth: row.battery_health,
    priceArs: num(row.price_ars),
    priceUsd: num(row.price_usd),
    costUsd: row.cost_usd === null ? null : num(row.cost_usd),
    stock: row.stock ?? 0,
    sku: row.sku,
  };
}

function mapProduct(row: ProductRow): Product {
  const images = [...(row.images ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand ?? "Apple",
    model: row.model ?? row.name,
    ...parseModel(row.model ?? row.name),
    category: toCategory(row.category),
    description: row.description ?? "",
    specs: row.specs ?? {},
    images: images.map((i) => ({ url: i.url, alt: i.alt ?? row.name })),
    variants: (row.variants ?? []).map(mapVariant),
    isFeatured: row.is_featured ?? false,
    createdAt: row.created_at,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, slug, brand, model, category, description, specs, is_featured, created_at,
       variants:product_variants(id, product_id, storage, color, color_hex, grade,
         battery_health, price_ars, price_usd, cost_usd, stock, sku, authenticity, is_active),
       images:product_images(url, alt, sort_order)`
    )
    .eq("status", "active");

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as ProductRow[]).map(mapProduct);
}

export async function fetchRepairServices(): Promise<RepairService[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("repair_services")
    .select("id, name, device, description, price_from, duration, is_active")
    .eq("is_active", true)
    .order("price_from", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    device: row.device ?? "",
    description: row.description ?? "",
    priceFrom: num(row.price_from),
    duration: row.duration ?? "",
    isActive: true,
  }));
}

export async function fetchPosts(): Promise<Post[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, body, cover_url, author, published_at, is_published"
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    body: row.body ?? "",
    coverUrl: row.cover_url,
    author: row.author ?? "Equipo iPhone Purple",
    publishedAt: row.published_at,
  }));
}

export async function fetchTradeInPrices(): Promise<TradeInPrice[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trade_in_prices")
    .select("id, brand, model, storage, base_value")
    .order("base_value", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    brand: row.brand,
    model: row.model,
    storage: row.storage ?? "",
    baseValue: num(row.base_value),
  }));
}

export async function fetchSettings(): Promise<StoreSettings> {
  const supabase = createClient();
  const { data, error } = await supabase.from("store_settings").select("key, value");

  if (error) throw new Error(error.message);

  // store_settings es clave/valor: lo aplanamos sobre los valores por defecto,
  // así una fila faltante nunca deja el sitio sin WhatsApp ni cotización.
  const stored = Object.fromEntries(
    (data ?? []).map((row) => [
      row.key,
      (row.value as { value?: unknown })?.value ?? row.value,
    ])
  );

  return { ...DEFAULT_SETTINGS, ...stored } as StoreSettings;
}
