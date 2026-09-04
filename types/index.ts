export type UserRole = "customer" | "admin" | "super_admin";

// ─────────────────────────────────────────────────────────────
// Taxonomía del catálogo
//
// Los ejes se combinan y se revelan de a poco, de lo general a lo específico:
//   marca          Apple, Sony, Nintendo     → primer corte
//   categoría      qué es el producto        → aparece dentro de la marca
//   modelo         iPhone 15 Pro Max         → aparece dentro de la categoría
//   autenticidad   original o réplica        → filtro, y separación por defecto
//   grado          sellado / A+ / A / B      → filtro
//   batería        tramos de salud           → filtro
//   capacidad      128GB, 256GB…             → filtro
// ─────────────────────────────────────────────────────────────

/**
 * Qué es el producto.
 *
 * Va por tipo y no por marca: "Celulares" y no "iPhone". La marca es un eje
 * aparte, así que un iPhone se encuentra con Apple + Celulares, y un Redmi
 * con Xiaomi + Celulares. Con categorías por marca, sumar Motorola o Dyson
 * obligaría a inventar una categoría nueva cada vez.
 */
export type Category =
  | "celular"
  | "tablet"
  | "notebook"
  | "reloj"
  | "audio"
  | "consola"
  | "hogar"
  | "accesorio";

export const CATEGORIES: Category[] = [
  "celular",
  "tablet",
  "notebook",
  "reloj",
  "audio",
  "consola",
  "hogar",
  "accesorio",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  celular: "Celulares",
  tablet: "Tablets",
  notebook: "Notebooks",
  reloj: "Relojes",
  audio: "Audio",
  consola: "Consolas y gaming",
  hogar: "Hogar y belleza",
  accesorio: "Accesorios",
};

/**
 * Original o réplica.
 *
 * Nunca puede quedar ambiguo: una réplica vendida sin que se entienda que lo
 * es expone legalmente al negocio y quema la reputación. Por eso las réplicas
 * quedan fuera del listado por defecto y llevan etiqueta propia en la tarjeta
 * y en la ficha.
 */
export type Authenticity = "original" | "replica";

export const AUTHENTICITY_LABELS: Record<Authenticity, string> = {
  original: "Original",
  replica: "Réplica",
};

/**
 * Grado del equipo, de mejor a peor. El orden importa: se usa para cotizar
 * el Plan Canje y para ordenar los filtros.
 */
export type Grade = "sellado" | "a-plus" | "a" | "a-minus";

export const GRADES: Grade[] = ["sellado", "a-plus", "a", "a-minus"];

export const GRADE_LABELS: Record<Grade, string> = {
  sellado: "Sellado",
  "a-plus": "Seminuevo A+",
  a: "Seminuevo A",
  "a-minus": "Seminuevo A−",
};

/**
 * Qué significa cada grado, en criterios verificables.
 *
 * Se publica en el sitio a propósito: "A+" no le dice nada a nadie si no está
 * escrito qué batería mínima y qué marcas de uso admite. Tenerlo publicado
 * evita discusiones después de la venta.
 */
export const GRADE_SPECS: Record<Grade, { cosmetic: string; battery: string }> = {
  sellado: {
    cosmetic: "Caja cerrada, sin abrir.",
    battery: "Batería 100 %, ciclo cero.",
  },
  "a-plus": {
    cosmetic: "Sin marcas de uso visibles.",
    battery: "Batería 95 % o más.",
  },
  a: {
    cosmetic: "Micromarcas que no se ven de frente.",
    battery: "Batería 88 % o más.",
  },
  "a-minus": {
    cosmetic: "Marcas de uso visibles en marco o tapa.",
    battery: "Batería 80 % o más.",
  },
};

/** Batería mínima que garantiza cada grado. Se usa para validar al importar. */
export const GRADE_MIN_BATTERY: Record<Grade, number> = {
  sellado: 100,
  "a-plus": 95,
  a: 88,
  "a-minus": 80,
};

/** Tramos del filtro de batería: "90 % o más". */
export const BATTERY_TIERS = [95, 90, 85, 80] as const;
export type BatteryTier = (typeof BATTERY_TIERS)[number];

/**
 * Estado: la primera decisión, y la única que importa a la mayoría.
 *
 * "Sellado o usado" es lo que todo el mundo pregunta primero. El grado
 * (A+/A/A−) recién tiene sentido una vez elegido seminuevo, así que se muestra
 * como un segundo paso en vez de mezclar cuatro opciones de entrada.
 */
export type State = "sellado" | "seminuevo";

export const STATE_LABELS: Record<State, string> = {
  sellado: "Sellado",
  seminuevo: "Seminuevo",
};

export const STATES: State[] = ["sellado", "seminuevo"];

/** El grado de un equipo determina su estado. */
export function stateOf(grade: Grade): State {
  return grade === "sellado" ? "sellado" : "seminuevo";
}

/**
 * Línea dentro de una generación.
 *
 * Separar generación ("15") de línea ("Pro Max") permite dos filtros útiles
 * en vez de una lista larga de nombres completos: se puede pedir "todo lo del
 * 15" o "todos los Pro Max", que es como la gente busca.
 */
export type Line = "base" | "mini" | "plus" | "pro" | "pro-max" | "ultra" | "air";

export const LINE_LABELS: Record<Line, string> = {
  base: "Base",
  mini: "mini",
  plus: "Plus",
  pro: "Pro",
  "pro-max": "Pro Max",
  ultra: "Ultra",
  air: "Air",
};

/** Orden de presentación: de la más simple a la más equipada. */
export const LINES: Line[] = ["base", "mini", "plus", "pro", "pro-max", "air", "ultra"];

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Variant {
  id: string;
  productId: string;
  storage: string;
  color: string;
  colorHex: string;
  grade: Grade;
  authenticity: Authenticity;
  /** Salud de batería en %, null cuando no aplica (sellados, accesorios). */
  batteryHealth: number | null;
  priceArs: number;
  priceUsd: number;
  /** Lo que nos costó. Solo se muestra en el panel, nunca en el sitio público. */
  costUsd: number | null;
  stock: number;
  sku: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  /** Familia del equipo: "iPhone 15 Pro". Sirve para agrupar y filtrar. */
  model: string;
  /** Generación: 15 en "iPhone 15 Pro". null cuando no aplica (consolas, Mac). */
  generation: number | null;
  /** Línea dentro de la generación. null cuando no aplica. */
  line: Line | null;
  category: Category;
  description: string;
  specs: Record<string, string>;
  images: ProductImage[];
  variants: Variant[];
  isFeatured: boolean;
  createdAt: string;
}

export interface RepairService {
  id: string;
  name: string;
  device: string;
  description: string;
  priceFrom: number;
  duration: string;
  isActive: boolean;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverUrl: string | null;
  author: string;
  publishedAt: string;
}

/** Fila de la tabla de valores de toma para el Plan Canje. */
export interface TradeInPrice {
  id: string;
  brand: string;
  model: string;
  storage: string;
  /** Valor de toma en USD para un equipo en estado "muy-bueno". */
  baseValue: number;
}

export interface TradeInLead {
  id: string;
  brand: string;
  model: string;
  storage: string;
  grade: Grade;
  estimatedValue: number;
  wantedProductId: string | null;
  contactName: string;
  contactPhone: string;
  notes: string | null;
  status: "pending" | "contacted" | "closed";
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  /** Margen por defecto en porcentaje: 18 significa +18%. */
  defaultMarginPct: number;
  isActive: boolean;
}

export type ImportStatus = "draft" | "approved" | "discarded";

export interface SupplierImport {
  id: string;
  supplierId: string;
  supplierName: string;
  rawText: string;
  rows: ParsedRow[];
  status: ImportStatus;
  createdAt: string;
}

/** Una línea de la lista del proveedor, tal como la interpretó el parser. */
export interface ParsedRow {
  brand: string;
  model: string;
  storage: string;
  color: string | null;
  category: Category;
  grade: Grade;
  authenticity: Authenticity;
  batteryHealth: number | null;
  currency: "USD" | "ARS";
  cost: number;
  quantity: number;
  notes: string | null;
}

export interface Sale {
  id: string;
  saleNumber: string;
  variantId: string | null;
  productName: string;
  variantLabel: string;
  salePrice: number;
  costPrice: number | null;
  quantity: number;
  customerName: string;
  customerPhone: string | null;
  paymentMethod: "efectivo" | "transferencia" | "tarjeta" | "canje";
  notes: string | null;
  soldAt: string;
}

export interface StoreSettings {
  /** Cotización del dólar usada para pasar precios USD a ARS. */
  dollarRate: number;
  /**
   * Cuándo se tocó esa cotización, en ISO.
   *
   * La ficha lo muestra en palabras al lado del precio. Un dólar de hace tres
   * semanas es peor que no mostrar ninguno: el número parece firme y no lo es.
   */
  dollarRateUpdatedAt: string;
  defaultMarginPct: number;
  whatsappNumber: string;
  whatsappDisplay: string;
  instagram: string;
  tiktok: string;
  email: string;
  address: string;
  hours: string;
  mapsUrl: string;
}

/** Filtros del catálogo. Todos llegan desde la URL. */
export interface CatalogFilters {
  q?: string;
  /** Marca: Apple, Sony, Nintendo… Es el primer eje del filtrado. */
  brand?: string;
  category?: Category;
  model?: string;
  generation?: number;
  line?: Line;
  /** Sellado o seminuevo. El grado afina dentro de seminuevo. */
  state?: State;
  storage?: string;
  color?: string;
  grade?: Grade;
  /**
   * Autenticidad. Sin especificar, el catálogo muestra SOLO originales: las
   * réplicas se ven cuando se piden explícitamente, nunca mezcladas.
   */
  authenticity?: Authenticity;
  /** Batería mínima: 90 significa "90 % o más". */
  minBattery?: number;
  sort?: "relevancia" | "precio-asc" | "precio-desc" | "nuevo";
  /**
   * Incluir lo agotado. El sitio público no lo usa —si no está, no se
   * muestra—, pero el panel necesita ver el stock en cero para reponer.
   */
  includeOutOfStock?: boolean;
  /**
   * Incluir lo que todavía no tiene foto.
   *
   * El catálogo no los publica —una ficha sin imagen no vende—, pero el panel
   * y los tests necesitan ver el conjunto completo.
   */
  incluirSinFoto?: boolean;
}
