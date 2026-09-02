export type UserRole = "customer" | "admin" | "super_admin";

/** Estado del equipo. Ordenado de mejor a peor: el orden importa para cotizar canje. */
export type Condition = "nuevo" | "como-nuevo" | "muy-bueno" | "bueno";

export const CONDITIONS: Condition[] = ["nuevo", "como-nuevo", "muy-bueno", "bueno"];

export const CONDITION_LABELS: Record<Condition, string> = {
  nuevo: "Nuevo sellado",
  "como-nuevo": "Como nuevo",
  "muy-bueno": "Muy bueno",
  bueno: "Bueno",
};

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
  condition: Condition;
  /** Salud de batería en %, null en equipos sellados. */
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
  category: string;
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
  condition: Condition;
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
  condition: Condition;
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
  brand?: string;
  model?: string;
  storage?: string;
  condition?: Condition;
  sort?: "relevancia" | "precio-asc" | "precio-desc" | "nuevo";
  inStockOnly?: boolean;
}
