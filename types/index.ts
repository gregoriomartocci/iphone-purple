export type UserRole = "customer" | "admin" | "super_admin";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  address: Address | null;
  preferences: Record<string, unknown> | null;
  role: UserRole;
  created_at: string;
}

export interface Address {
  street: string;
  number: string;
  floor?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
}

export type ProductStatus = "active" | "draft" | "archived";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  brand_id: string | null;
  category_id: string | null;
  sku: string | null;
  status: ProductStatus;
  is_featured: boolean;
  is_bestseller: boolean;
  tags: string[];
  specs: ProductSpecs | null;
  created_at: string;
  updated_at: string;
  brand?: Brand;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  reviews_aggregate?: { avg_rating: number; count: number };
}

export interface ProductSpecs {
  display?: string;
  chip?: string;
  camera?: string;
  battery?: string;
  os?: string;
  connectivity?: string;
  dimensions?: string;
  weight?: string;
  [key: string]: string | undefined;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  price_ars: number;
  price_usd: number | null;
  compare_price_ars: number | null;
  cost_price: number | null;
  stock: number;
  low_stock_threshold: number;
  attributes: VariantAttributes;
  is_active: boolean;
  created_at: string;
}

export interface VariantAttributes {
  storage?: string;
  color?: string;
  color_hex?: string;
  [key: string]: string | undefined;
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  url: string;
  alt: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  profile?: Pick<Profile, "full_name" | "avatar_url">;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: "percentage" | "fixed_amount" | "free_shipping";
  value: number;
  min_purchase: number;
  max_uses: number | null;
  used_count: number;
  user_id: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type PaymentMethod = "mercadopago" | "stripe" | "cash";

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  payment_id: string | null;
  currency: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon_id: string | null;
  shipping_address: Address & { full_name: string; phone: string; email: string };
  billing_address: Address | null;
  notes: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  events?: OrderEvent[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  product_name: string;
  variant_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  total: number;
  variant?: ProductVariant & { product?: Product };
}

export interface OrderEvent {
  id: string;
  order_id: string;
  status: string;
  message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type TradeInCondition = "excelente" | "bueno" | "regular" | "roto";
export type TradeInStatus =
  | "pending"
  | "evaluating"
  | "offered"
  | "accepted"
  | "rejected";

export interface TradeIn {
  id: string;
  user_id: string | null;
  device_brand: string;
  device_model: string;
  device_storage: string | null;
  device_condition: TradeInCondition;
  has_accessories: boolean;
  photos: string[];
  estimated_value_min: number | null;
  estimated_value_max: number | null;
  final_value: number | null;
  status: TradeInStatus;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
}

export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  mobile_image_url: string | null;
  link: string | null;
  position: "hero" | "strip" | "section" | "popup";
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  productImage: string | null;
  price: number;
  quantity: number;
  stock: number;
  slug: string;
}

export interface StoreSettings {
  store_name: string;
  store_description: string;
  logo_url: string;
  favicon_url: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  instagram_url: string;
  tiktok_url: string;
  address: string;
  business_hours: string;
  usd_rate: number;
  usd_rate_updated_at: string;
  shipping_free_threshold: number;
  shipping_base_price: number;
  maintenance_mode: boolean;
}
