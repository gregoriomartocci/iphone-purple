import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "./index";
import { fetchProducts } from "./supabase";
import { PRODUCTS as PRODUCTOS_SEMILLA } from "./seed";
import { totalStock } from "@/lib/catalog";
import { SUPPLIERS as SEED_SUPPLIERS } from "./seed";
import type { Grade, ParsedRow, Product, Sale, Supplier, TradeInLead } from "@/types";
import { armarMercado, type ListaDeProveedor } from "@/lib/whatsapp/mercado";
import { armarRanking, type FilaRanking } from "@/lib/whatsapp/ranking";
import {
  chatsDesdeHistorico,
  pareceLista,
  proveedorDelMensaje,
  skuDe,
  ultimaPorEquipo,
} from "@/lib/whatsapp/sincronizar";
import { sellPrice } from "@/lib/whatsapp/parser";
import { canonizarFila } from "@/lib/whatsapp/nombres";
import { pedirGrupos, pedirHistorico, pedirSalud } from "@/lib/whatsapp/servidor";
import {
  armarSincronizacion,
  type FilaSincronizacion,
  type ImportacionResumen,
} from "@/lib/whatsapp/estado-sincronizacion";

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
        "id, brand, model, storage, grade, estimated_value, wanted_product_id, contact_name, contact_phone, notes, status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row.id,
      brand: row.brand,
      model: row.model,
      storage: row.storage ?? "",
      grade: row.grade as Grade,
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
    getProductsConCosto(),
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

/** El catálogo con costos. Solo para pantallas del panel, nunca para la tienda. */
export async function getProductsConCosto(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return PRODUCTOS_SEMILLA;
  return fetchProducts({ conCosto: true });
}

/** La última lista importada de cada proveedor activo. */
export async function getUltimasListas(): Promise<ListaDeProveedor[]> {
  if (!isSupabaseConfigured()) return [];
  const [proveedores, { data, error }] = await Promise.all([
    getSuppliers(),
    createAdminClient()
      .from("supplier_imports")
      .select("supplier_id, created_at, parsed_json")
      .order("created_at", { ascending: false }),
  ]);
  if (error) throw new Error(error.message);

  const vistos = new Set<string>();
  const listas: ListaDeProveedor[] = [];
  for (const fila of data ?? []) {
    const proveedor = proveedores.find((p) => p.id === fila.supplier_id && p.isActive);
    if (!proveedor || vistos.has(proveedor.id)) continue;
    vistos.add(proveedor.id);
    listas.push({
      proveedor,
      fecha: fila.created_at as string,
      filas: ultimaPorEquipo(
        ((fila.parsed_json ?? []) as ParsedRow[]).map(canonizarFila)
      ),
    });
  }
  return listas;
}

/**
 * El ranking de proveedores. Las fechas salen de las importaciones y, si el
 * lector responde, de su histórico: sin él el ranking sigue andando, con menos
 * historia.
 */
export async function getRankingProveedores(dolar: number): Promise<FilaRanking[]> {
  if (!isSupabaseConfigured()) return [];
  const desde = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const [proveedores, listas, importaciones, historico, grupos] = await Promise.all([
    getSuppliers(),
    getUltimasListas(),
    createAdminClient().from("supplier_imports").select("supplier_id, created_at"),
    pedirHistorico(desde).catch(() => null),
    pedirGrupos().catch(() => null),
  ]);
  if (importaciones.error) throw new Error(importaciones.error.message);

  const fechas = new Map<string, string[]>();
  const anotar = (id: string, fecha: string) =>
    fechas.set(id, [...(fechas.get(id) ?? []), fecha]);

  for (const i of importaciones.data ?? []) {
    if (i.supplier_id) anotar(i.supplier_id as string, i.created_at as string);
  }
  if (historico?.ok) {
    const chats = chatsDesdeHistorico(
      historico.datos.mensajes,
      grupos?.ok ? grupos.datos.grupos : []
    );
    for (const chat of chats) {
      for (const m of chat.mensajes) {
        if (!pareceLista(m.texto)) continue;
        const proveedor = proveedorDelMensaje(chat, m, proveedores);
        if (proveedor) anotar(proveedor.id, m.fecha);
      }
    }
  }

  return armarRanking(proveedores, armarMercado(listas, dolar), fechas, new Date());
}

/** Una oferta de la última lista de un proveedor, con el precio que quedaría. */
export interface OfertaProducto {
  proveedorId: string;
  proveedor: string;
  costo: number;
  moneda: "USD" | "ARS";
  costoUsd: number;
  precioUsd: number;
  precioArs: number;
  fecha: string;
  ingresando: boolean;
}

export interface ExtraVariante {
  proveedorId: string | null;
  proveedor: string | null;
  /** De más barata a más cara, incluida la que está publicada. */
  ofertas: OfertaProducto[];
}

/** Proveedor de cada variante y todas las ofertas del mercado para ese equipo. */
export async function getOfertasPorVariante(
  dolar: number
): Promise<Record<string, ExtraVariante>> {
  if (!isSupabaseConfigured()) return {};
  const [proveedores, listas, { data, error }] = await Promise.all([
    getSuppliers(),
    getUltimasListas(),
    createAdminClient()
      .from("product_variants")
      .select("id, sku, supplier_id")
      .eq("is_active", true),
  ]);
  if (error) throw new Error(error.message);

  const margen = new Map(proveedores.map((p) => [p.id, p.defaultMarginPct]));
  const porSku = new Map<string, OfertaProducto[]>();
  for (const equipo of armarMercado(listas, dolar)) {
    const sku = skuDe({
      model: equipo.modelo,
      storage: equipo.capacidad,
      grade: equipo.grado,
      authenticity: equipo.autenticidad,
    } as ParsedRow);
    porSku.set(
      sku,
      equipo.ofertas.map((o) => {
        const precio = sellPrice(
          o.costo,
          o.moneda,
          margen.get(o.proveedorId) ?? 0,
          dolar
        );
        return {
          proveedorId: o.proveedorId,
          proveedor: o.proveedor,
          costo: o.costo,
          moneda: o.moneda,
          costoUsd: o.costoUsd,
          precioUsd: precio.priceUsd,
          precioArs: precio.priceArs,
          fecha: o.fecha,
          ingresando: o.ingresando,
        };
      })
    );
  }

  const extras: Record<string, ExtraVariante> = {};
  for (const v of data ?? []) {
    const proveedorId = (v.supplier_id as string | null) ?? null;
    extras[v.id as string] = {
      proveedorId,
      proveedor: proveedores.find((p) => p.id === proveedorId)?.name ?? null,
      ofertas: porSku.get(v.sku as string) ?? [],
    };
  }
  return extras;
}

/** Lo que muestra la pantalla de sincronización. Sin lector, igual responde. */
export async function getEstadoSincronizacion() {
  const vacio = {
    lector: { conectado: false, ultimoMensaje: null as string | null },
    ultimaImportacion: null as string | null,
    filas: [] as FilaSincronizacion[],
    historial: [] as {
      proveedor: string;
      fecha: string;
      estado: string;
      publicados: number;
    }[],
  };
  if (!isSupabaseConfigured()) return vacio;

  const supabase = createAdminClient();
  const desde = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const [proveedores, imports, variantes, salud, historico, grupos] = await Promise.all([
    getSuppliers(),
    supabase
      .from("supplier_imports")
      .select("supplier_id, created_at, status, rows_published")
      .order("created_at", { ascending: false }),
    supabase
      .from("product_variants")
      .select("supplier_id")
      .eq("is_active", true)
      .gt("stock", 0),
    pedirSalud().catch(() => null),
    pedirHistorico(desde).catch(() => null),
    pedirGrupos().catch(() => null),
  ]);
  if (imports.error) throw new Error(imports.error.message);
  if (variantes.error) throw new Error(variantes.error.message);

  const importaciones: ImportacionResumen[] = (imports.data ?? []).map((i) => ({
    proveedorId: i.supplier_id as string | null,
    fecha: i.created_at as string,
    estado: i.status as string,
    publicados: Number(i.rows_published ?? 0),
  }));

  const lecturas = new Map<string, string>();
  let ultimoMensaje: string | null = null;
  if (historico?.ok) {
    const chats = chatsDesdeHistorico(
      historico.datos.mensajes,
      grupos?.ok ? grupos.datos.grupos : []
    );
    for (const chat of chats) {
      for (const m of chat.mensajes) {
        if (!ultimoMensaje || m.fecha > ultimoMensaje) ultimoMensaje = m.fecha;
        if (!pareceLista(m.texto)) continue;
        const proveedor = proveedorDelMensaje(chat, m, proveedores);
        if (!proveedor) continue;
        const actual = lecturas.get(proveedor.id);
        if (!actual || m.fecha > actual) lecturas.set(proveedor.id, m.fecha);
      }
    }
  }

  const publicados = new Map<string, number>();
  for (const v of variantes.data ?? []) {
    const id = v.supplier_id as string | null;
    if (id) publicados.set(id, (publicados.get(id) ?? 0) + 1);
  }

  const nombre = new Map(proveedores.map((p) => [p.id, p.name]));
  const aprobadas = importaciones.filter((i) => i.estado === "approved");

  return {
    lector: {
      conectado: Boolean(
        salud?.ok && salud.datos.conexion === "open" && salud.datos.vinculado
      ),
      ultimoMensaje,
    },
    ultimaImportacion: aprobadas[0]?.fecha ?? null,
    filas: armarSincronizacion(
      proveedores,
      importaciones,
      lecturas,
      publicados,
      new Date()
    ),
    historial: importaciones.slice(0, 15).map((i) => ({
      proveedor: nombre.get(i.proveedorId ?? "") ?? "Sin proveedor",
      fecha: i.fecha,
      estado: i.estado,
      publicados: i.publicados,
    })),
  };
}
