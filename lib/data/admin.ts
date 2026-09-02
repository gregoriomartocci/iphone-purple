import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, getProducts } from "./index";
import { totalStock } from "@/lib/catalog";
import { SUPPLIERS as SEED_SUPPLIERS } from "./seed";
import type { Sale, Supplier, TradeInLead, Condition } from "@/types";

/**
 * Lecturas del panel.
 *
 * Usan la service role key, así que nunca deben importarse desde componentes de
 * cliente — de ahí el `server-only`, que convierte ese error en un fallo de build
 * en vez de en una filtración.
 *
 * Sin Supabase configurado devuelven lo que se puede: el catálogo de la semilla y
 * listas vacías para todo lo que sí necesita persistencia.
 */

export async function getSuppliers(): Promise<Supplier[]> {
  if (!isSupabaseConfigured()) return SEED_SUPPLIERS;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("suppliers")
      .select("id, name, phone, default_margin_pct, is_active")
      .eq("is_active", true)
      .order("name");

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      defaultMarginPct: Number(row.default_margin_pct ?? 18),
      isActive: row.is_active ?? true,
    }));
  } catch (err) {
    console.error("[admin] proveedores:", err);
    return SEED_SUPPLIERS;
  }
}

export async function getSales(limit = 50): Promise<Sale[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("sales")
      .select(
        "id, sale_number, variant_id, product_name, variant_label, sale_price, cost_price, quantity, customer_name, customer_phone, payment_method, notes, sold_at"
      )
      .order("sold_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row.id,
      saleNumber: row.sale_number,
      variantId: row.variant_id,
      productName: row.product_name,
      variantLabel: row.variant_label,
      salePrice: Number(row.sale_price),
      costPrice: row.cost_price === null ? null : Number(row.cost_price),
      quantity: row.quantity ?? 1,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      paymentMethod: row.payment_method,
      notes: row.notes,
      soldAt: row.sold_at,
    }));
  } catch (err) {
    console.error("[admin] ventas:", err);
    return [];
  }
}

export async function getTradeInLeads(): Promise<TradeInLead[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("trade_ins")
      .select(
        "id, brand, model, storage, condition, estimated_value, wanted_product_id, contact_name, contact_phone, notes, status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row.id,
      brand: row.brand,
      model: row.model,
      storage: row.storage ?? "",
      condition: row.condition as Condition,
      estimatedValue: Number(row.estimated_value ?? 0),
      wantedProductId: row.wanted_product_id,
      contactName: row.contact_name,
      contactPhone: row.contact_phone,
      notes: row.notes,
      status: row.status,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error("[admin] leads de canje:", err);
    return [];
  }
}

export type DashboardStats = {
  unitsInStock: number;
  stockValueArs: number;
  /** Margen bruto potencial de todo lo que hay en stock, en pesos. */
  potentialMarginArs: number;
  productCount: number;
  outOfStockCount: number;
  lowStock: { name: string; variant: string; stock: number }[];
  salesThisMonth: number;
  revenueThisMonth: number;
  marginThisMonth: number;
  pendingLeads: number;
};

export async function getDashboardStats(dollarRate: number): Promise<DashboardStats> {
  const [products, sales, leads] = await Promise.all([
    getProducts(),
    getSales(200),
    getTradeInLeads(),
  ]);

  let unitsInStock = 0;
  let stockValueArs = 0;
  let potentialMarginArs = 0;
  const lowStock: DashboardStats["lowStock"] = [];

  for (const product of products) {
    for (const variant of product.variants) {
      if (variant.stock > 0) {
        unitsInStock += variant.stock;
        stockValueArs += variant.priceArs * variant.stock;
        if (variant.costUsd !== null) {
          const costArs = variant.costUsd * dollarRate;
          potentialMarginArs += (variant.priceArs - costArs) * variant.stock;
        }
      }
      if (variant.stock > 0 && variant.stock <= 2) {
        lowStock.push({
          name: product.name,
          variant: `${variant.storage} · ${variant.color}`,
          stock: variant.stock,
        });
      }
    }
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthSales = sales.filter((s) => new Date(s.soldAt) >= monthStart);
  const revenueThisMonth = monthSales.reduce(
    (sum, s) => sum + s.salePrice * s.quantity,
    0
  );
  const marginThisMonth = monthSales.reduce(
    (sum, s) => sum + (s.salePrice - (s.costPrice ?? 0)) * s.quantity,
    0
  );

  return {
    unitsInStock,
    stockValueArs,
    potentialMarginArs,
    productCount: products.length,
    outOfStockCount: products.filter((p) => totalStock(p) === 0).length,
    lowStock: lowStock.sort((a, b) => a.stock - b.stock).slice(0, 8),
    salesThisMonth: monthSales.length,
    revenueThisMonth,
    marginThisMonth,
    pendingLeads: leads.filter((l) => l.status === "pending").length,
  };
}
