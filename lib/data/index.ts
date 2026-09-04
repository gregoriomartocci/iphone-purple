import { CATEGORIES, GRADES, LINES, STATES, stateOf } from "@/types";
import type {
  CatalogFilters,
  Post,
  Product,
  RepairService,
  StoreSettings,
  TradeInPrice,
} from "@/types";
import * as seed from "./seed";
import { MAS_VENDIDOS } from "./destacados";
import * as db from "./supabase";
import {
  capacityInGb,
  isCapacity,
  matchesVariant,
  priceFrom,
  totalStock,
} from "@/lib/catalog";

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

/**
 * Un producto sin foto no se publica.
 *
 * Decisión del negocio: una ficha sin imagen no vende y deja el catálogo con
 * cara de inacabado. Preferimos mostrar menos y que todo lo que se muestre se
 * vea bien.
 *
 * No se borra nada: el producto sigue en los datos y en el panel, y vuelve al
 * catálogo solo con dejar sus fotos en public/productos/<slug>/. Poner esto en
 * `false` publica todo de nuevo.
 */
const OCULTAR_SIN_FOTO = true;

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

  // Antes que cualquier filtro: lo que no tiene foto no llega al catálogo.
  if (OCULTAR_SIN_FOTO && !filters.incluirSinFoto) {
    items = items.filter((p) => p.images.length > 0);
  }

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
  if (filters.generation !== undefined) {
    items = items.filter((p) => p.generation === filters.generation);
  }

  if (filters.line) {
    items = items.filter((p) => p.line === filters.line);
  }

  /**
   * El resto se evalúa a nivel variante y tiene que cumplirse en LA MISMA: si
   * se pidiera por separado, un producto con un sellado agotado y una usada con
   * stock entraría al filtro "sellado", y la tarjeta anunciaría algo que no se
   * puede vender.
   */
  items = items.filter((p) =>
    p.variants.some((v) =>
      matchesVariant(v, {
        authenticity,
        state: filters.state,
        grade: filters.grade,
        storage: filters.storage,
        color: filters.color,
        minBattery: filters.minBattery,
        includeOutOfStock: filters.includeOutOfStock,
      })
    )
  );

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

/**
 * Resuelve una lista curada de slugs a productos, respetando ese orden.
 *
 * Los que no existen o quedaron sin stock se descartan: la portada no puede
 * ofrecer algo que no se puede vender, y una lista desactualizada tiene que
 * degradar mostrando menos, nunca rompiendo.
 */
async function porSlugs(slugs: readonly string[], limit: number): Promise<Product[]> {
  const items = await allProducts();
  const porSlug = new Map(items.map((p) => [p.slug, p]));
  return slugs
    .map((slug) => porSlug.get(slug))
    .filter((p): p is Product => p !== undefined && totalStock(p) > 0)
    .slice(0, limit);
}

/** Los que más salen, en el orden en que los ordenó el local. */
export async function getBestsellers(limit = 6): Promise<Product[]> {
  return porSlugs(MAS_VENDIDOS, limit);
}

/** Lo último que entró y se puede llevar hoy. */
export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const items = await allProducts();
  return items
    .filter((p) => totalStock(p) > 0)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
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
export type Facet = {
  value: string;
  count: number;
  /** Color de muestra, solo en la faceta de color. */
  hex?: string;
};

export type CatalogFacets = {
  brands: Facet[];
  categories: Facet[];
  generations: Facet[];
  lines: Facet[];
  models: Facet[];
  storages: Facet[];
  colors: Facet[];
  states: Facet[];
  /** Solo tiene sentido con estado "seminuevo" ya elegido. */
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

  /**
   * Cuenta cuántos productos quedarían aplicando los filtros actuales más uno.
   *
   * `drop` saca los filtros que están POR DEBAJO del eje que se cuenta. Si no,
   * al elegir "iPhone" el contador de la marca Sony daría cero —no hay iPhones
   * Sony—, la opción se descartaría y la persona se quedaría sin poder cambiar
   * de marca. Un eje nunca puede quedar bloqueado por lo que se eligió después.
   */
  const countWith = async (
    extra: Partial<CatalogFilters>,
    drop: (keyof CatalogFilters)[] = []
  ) => {
    const base = { ...filters };
    for (const key of drop) delete base[key];
    return (await getProducts({ ...base, ...extra })).length;
  };

  // El universo de opciones sale de lo que existe con esta autenticidad.
  const visible = all.filter((p) =>
    p.variants.some((v) => v.authenticity === authenticity)
  );
  const visibleVariants = visible.flatMap((p) => p.variants);

  const brands = [...new Set(visible.map((p) => p.brand))].sort((a, b) =>
    // Apple primero: es la especialidad del negocio.
    a === "Apple" ? -1 : b === "Apple" ? 1 : a.localeCompare(b)
  );
  const categories = CATEGORIES.filter((c) => visible.some((p) => p.category === c));
  // De la generación más nueva a la más vieja, que es como se busca.
  const generations = [
    ...new Set(visible.map((p) => p.generation).filter((g): g is number => g !== null)),
  ].sort((a, b) => b - a);
  const lines = LINES.filter((l) => visible.some((p) => p.line === l));
  /**
   * Modelos de la generación más nueva a la más vieja, y dentro de cada una
   * de la línea base a la Pro Max. Alfabético pondría "iPhone 11" antes que
   * "iPhone 9", que no es como nadie busca un teléfono.
   */
  const models = [...new Set(visible.map((p) => p.model))].sort((a, b) => {
    const pa = visible.find((p) => p.model === a)!;
    const pb = visible.find((p) => p.model === b)!;
    if (pa.generation !== pb.generation) {
      return (pb.generation ?? -1) - (pa.generation ?? -1);
    }
    return LINES.indexOf(pa.line ?? "base") - LINES.indexOf(pb.line ?? "base");
  });
  // Solo capacidades reales: el campo también guarda tamaños de caja de Watch
  // y conectores de AirPods, que no son almacenamiento.
  const storages = [...new Set(visibleVariants.map((v) => v.storage))]
    .filter(isCapacity)
    .sort((a, b) => capacityInGb(a) - capacityInGb(b));
  /**
   * Tramos de batería que existen de verdad.
   *
   * Antes eran cuatro fijos —95, 90, 85 y 80— y eso tenía dos problemas: si
   * había un equipo al 100 % no se podía pedir, porque el tramo más alto era
   * "95 % o más"; y si no había nada por debajo de 90, el sitio igual ofrecía
   * tramos que no correspondían a nada.
   *
   * Ahora salen de los valores reales en stock, redondeados hacia abajo al
   * múltiplo de 5. Con equipos al 100, 97, 91 y 84 quedan los tramos 100, 95,
   * 90 y 80, y cada uno se lee como "de ahí para arriba".
   */
  const tramosBateria = [
    ...new Set(
      visibleVariants
        .map((v) => v.batteryHealth)
        .filter((b): b is number => b !== null && b > 0)
        .map((b) => Math.floor(b / 5) * 5)
    ),
  ].sort((a, b) => b - a);

  const colors = [...new Set(visibleVariants.map((v) => v.color))].filter(Boolean).sort();
  // El hex de cada color, para poder mostrarlo como muestra en el filtro.
  const colorHex = new Map(visibleVariants.map((v) => [v.color, v.colorHex]));
  const states = STATES.filter((st) =>
    visibleVariants.some((v) => stateOf(v.grade) === st)
  );
  // El grado afina dentro de seminuevo; el sellado no tiene grados.
  const grades = GRADES.filter(
    (g) => g !== "sellado" && visibleVariants.some((v) => v.grade === g)
  );

  const prices = visibleVariants.map((v) => v.priceArs).filter((n) => n > 0);

  const count = async <T extends string | number>(
    values: T[],
    toFilter: (v: T) => Partial<CatalogFilters>,
    drop: (keyof CatalogFilters)[] = []
  ): Promise<Facet[]> =>
    Promise.all(
      values.map(async (v) => ({
        value: String(v),
        count: await countWith(toFilter(v), drop),
      }))
    );

  // Los ejes van de lo general a lo específico; cada uno ignora los de abajo.
  const bajoMarca: (keyof CatalogFilters)[] = ["category", "model"];
  const bajoCategoria: (keyof CatalogFilters)[] = ["model"];

  const [
    brandCounts,
    categoryCounts,
    generationCounts,
    lineCounts,
    modelCounts,
    storageCounts,
    colorCounts,
    stateCounts,
    gradeCounts,
    batteryCounts,
    replicas,
  ] = await Promise.all([
    count(brands, (b) => ({ brand: b }), bajoMarca),
    count(categories, (c) => ({ category: c }), bajoCategoria),
    count(generations, (g) => ({ generation: g })),
    count(lines, (l) => ({ line: l })),
    count(models, (m) => ({ model: m })),
    count(storages, (s) => ({ storage: s })),
    count(colors, (c) => ({ color: c })),
    count(states, (st) => ({ state: st })),
    count(grades, (g) => ({ grade: g })),
    count(tramosBateria, (t) => ({ minBattery: t })),
    getProducts({ ...filters, authenticity: "replica" }),
  ]);

  // Una opción con cero resultados solo estorba.
  const used = (list: Facet[]) => list.filter((f) => f.count > 0);

  return {
    brands: used(brandCounts),
    categories: used(categoryCounts),
    generations: used(generationCounts),
    lines: used(lineCounts),
    models: used(modelCounts),
    storages: used(storageCounts),
    colors: used(colorCounts).map((f) => ({ ...f, hex: colorHex.get(f.value) })),
    states: used(stateCounts),
    grades: used(gradeCounts),
    batteryTiers: used(batteryCounts),
    replicaCount: replicas.length,
    priceRange: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    },
  };
}

/**
 * El mismo modelo en la generación anterior y en la siguiente.
 *
 * Sirve para responder la pregunta que todo el mundo se hace antes de
 * comprar un usado: "¿cuánto mejor es el que sigue, y cuánto me ahorro con
 * el anterior?". Se compara dentro de la misma línea —un 15 Pro contra un
 * 14 Pro y un 16 Pro— porque comparar un Pro Max contra un base no dice nada.
 */
export async function getGenerationComparison(product: Product): Promise<Product[]> {
  if (product.generation === null) return [];
  const items = await allProducts();

  const enLinea = (generation: number) =>
    items.find(
      (p) =>
        p.category === product.category &&
        p.line === product.line &&
        p.generation === generation
    );

  return [
    enLinea(product.generation - 1),
    product,
    enLinea(product.generation + 1),
  ].filter((p): p is Product => p !== undefined);
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
