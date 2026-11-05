"use server";

import { colorParaGuardar } from "@/lib/colores";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { getSettings, isSupabaseConfigured } from "@/lib/data";
import { getOfertasPorVariante } from "@/lib/data/admin";
import { parseSupplierList } from "@/lib/whatsapp/parser";
import type { ParsedRow } from "@/types";
import {
  NO_DB,
  ParsedRowSchema,
  publicarFilas,
  requireAdmin,
  type ActionResult,
} from "@/lib/admin/publicar";

export type { ActionResult };

// ------------------------------------------------------- importar listas

export async function parseListAction(
  rawText: string
): Promise<ActionResult<{ rows: ParsedRow[]; warnings: string[] }>> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado" };

  if (!rawText.trim())
    return { ok: false, error: "Pegá la lista del proveedor primero." };
  if (rawText.length > 20_000) {
    return { ok: false, error: "La lista es muy larga. Probá dividirla en dos partes." };
  }

  try {
    const result = await parseSupplierList(rawText);
    if (result.rows.length === 0) {
      return {
        ok: false,
        error:
          "No encontramos equipos en ese texto. Revisá que sea una lista de precios.",
      };
    }
    return { ok: true, data: result };
  } catch (err) {
    console.error("[admin] parseo de lista:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo interpretar la lista.",
    };
  }
}

const PublishSchema = z.object({
  supplierId: z.string().nullable(),
  marginPct: z.number().min(0).max(300),
  dollarRate: z.number().positive(),
  rawText: z.string(),
  rows: z.array(ParsedRowSchema).min(1, "No hay filas para publicar."),
});

/**
 * Publica las filas aprobadas.
 *
 * Agrupa por modelo: cada modelo es un producto y cada combinación de
 * capacidad/color/estado es una variante. Si el producto ya existe se reutiliza,
 * así reimportar la lista de la semana que viene actualiza en lugar de duplicar.
 */
export async function publishImportAction(
  input: z.input<typeof PublishSchema>
): Promise<ActionResult<{ published: number }>> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado" };
  if (!isSupabaseConfigured()) return { ok: false, error: NO_DB };

  const parsed = PublishSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { supplierId, marginPct, dollarRate, rawText, rows } = parsed.data;

  try {
    const published = await publicarFilas({
      supabase: createAdminClient(),
      supplierId,
      marginPct,
      dollarRate,
      rows: rows as ParsedRow[],
      rawText,
    });

    revalidatePath("/catalogo");
    revalidatePath("/admin/productos");
    revalidatePath("/admin");

    return { ok: true, data: { published } };
  } catch (err) {
    console.error("[admin] publicar importación:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo publicar la importación.",
    };
  }
}

// ------------------------------------------------------- productos

const VariantUpdateSchema = z.object({
  variantId: z.string().min(1),
  priceArs: z.number().nonnegative(),
  stock: z.number().int().min(0),
});

export async function updateVariantAction(
  input: z.input<typeof VariantUpdateSchema>
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado" };
  if (!isSupabaseConfigured()) return { ok: false, error: NO_DB };

  const parsed = VariantUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("product_variants")
      .update({ price_ars: parsed.data.priceArs, stock: parsed.data.stock })
      .eq("id", parsed.data.variantId);

    if (error) throw new Error(error.message);

    revalidatePath("/catalogo");
    revalidatePath("/admin/productos");
    return { ok: true };
  } catch (err) {
    console.error("[admin] actualizar variante:", err);
    return { ok: false, error: "No se pudo guardar el cambio." };
  }
}

const ElegirOfertaSchema = z.object({
  variantId: z.string().min(1),
  proveedorId: z.string().min(1),
});

/**
 * Publica una variante con la oferta de otro proveedor. El costo sale de su
 * última lista guardada, no de lo que manda la pantalla.
 *
 * La próxima importación vuelve a elegir la más barata.
 */
export async function elegirOfertaAction(
  input: z.input<typeof ElegirOfertaSchema>
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado" };
  if (!isSupabaseConfigured()) return { ok: false, error: NO_DB };

  const parsed = ElegirOfertaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  try {
    const { dollarRate } = await getSettings();
    const ofertas = await getOfertasPorVariante(dollarRate);
    const oferta = ofertas[parsed.data.variantId]?.ofertas.find(
      (o) => o.proveedorId === parsed.data.proveedorId
    );
    if (!oferta) return { ok: false, error: "Esa oferta ya no está en su última lista." };

    const { error } = await createAdminClient()
      .from("product_variants")
      .update({
        supplier_id: oferta.proveedorId,
        cost_usd: Math.round(oferta.costoUsd * 100) / 100,
        price_usd: oferta.precioUsd,
        price_ars: oferta.precioArs,
        // Otro proveedor puede tener otros colores: se ofrecen los de quien vende.
        ...colorParaGuardar(oferta.colores),
      })
      .eq("id", parsed.data.variantId);
    if (error) throw new Error(error.message);

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    console.error("[admin] elegir oferta:", err);
    return { ok: false, error: "No se pudo cambiar el proveedor." };
  }
}

// ------------------------------------------------------- ventas

const SaleSchema = z.object({
  variantId: z.string().nullable(),
  productName: z.string().min(1, "Falta el producto"),
  variantLabel: z.string(),
  salePrice: z.number().positive("El precio tiene que ser mayor a cero"),
  costPrice: z.number().nonnegative().nullable(),
  quantity: z.number().int().min(1).max(99),
  customerName: z.string().min(2, "Falta el nombre del cliente"),
  customerPhone: z.string().nullable(),
  paymentMethod: z.enum(["efectivo", "transferencia", "tarjeta", "canje"]),
  notes: z.string().nullable(),
});

/** Registra una venta. El trigger `on_sale_created` descuenta el stock. */
export async function registerSaleAction(
  input: z.input<typeof SaleSchema>
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado" };
  if (!isSupabaseConfigured()) return { ok: false, error: NO_DB };

  const parsed = SaleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const supabase = createAdminClient();
    const { data: saleNumber, error: numberError } =
      await supabase.rpc("next_sale_number");
    if (numberError) throw new Error(numberError.message);

    const d = parsed.data;
    const { error } = await supabase.from("sales").insert({
      sale_number: saleNumber,
      variant_id: d.variantId,
      product_name: d.productName,
      variant_label: d.variantLabel,
      sale_price: d.salePrice,
      cost_price: d.costPrice,
      quantity: d.quantity,
      customer_name: d.customerName,
      customer_phone: d.customerPhone,
      payment_method: d.paymentMethod,
      notes: d.notes,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/admin/ventas");
    revalidatePath("/admin");
    revalidatePath("/catalogo");
    return { ok: true };
  } catch (err) {
    console.error("[admin] registrar venta:", err);
    return { ok: false, error: "No se pudo registrar la venta." };
  }
}

// ------------------------------------------------------- leads de canje

export async function updateLeadStatusAction(
  leadId: string,
  status: "pending" | "contacted" | "closed"
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado" };
  if (!isSupabaseConfigured()) return { ok: false, error: NO_DB };

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("trade_ins")
      .update({ status })
      .eq("id", leadId);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/plan-canje");
    return { ok: true };
  } catch (err) {
    console.error("[admin] estado de lead:", err);
    return { ok: false, error: "No se pudo actualizar el estado." };
  }
}

// ------------------------------------------------------- proveedores

const SupplierSchema = z.object({
  id: z.string().nullable(),
  name: z.string().min(2, "Falta el nombre del proveedor"),
  phone: z.string().nullable(),
  defaultMarginPct: z.number().min(0).max(300),
});

export async function saveSupplierAction(
  input: z.input<typeof SupplierSchema>
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado" };
  if (!isSupabaseConfigured()) return { ok: false, error: NO_DB };

  const parsed = SupplierSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, name, phone, defaultMarginPct } = parsed.data;

  try {
    const supabase = createAdminClient();
    const payload = { name, phone, default_margin_pct: defaultMarginPct };

    const { error } = id
      ? await supabase.from("suppliers").update(payload).eq("id", id)
      : await supabase.from("suppliers").insert({ ...payload, is_active: true });

    if (error) throw new Error(error.message);

    revalidatePath("/admin/proveedores");
    // La pantalla de WhatsApp muestra qué autores ya están cargados: sin esto,
    // el proveedor recién creado sigue apareciendo como pendiente.
    revalidatePath("/admin/whatsapp");
    return { ok: true };
  } catch (err) {
    console.error("[admin] guardar proveedor:", err);
    return { ok: false, error: "No se pudo guardar el proveedor." };
  }
}

// ------------------------------------------------------- ajustes

const SettingsSchema = z.object({
  dollarRate: z.number().positive("La cotización tiene que ser mayor a cero"),
  /**
   * Cuándo se tocó la cotización. Lo sella el formulario al detectar que el
   * número cambió, no se escribe a mano: una fecha que hay que acordarse de
   * poner es una fecha que en dos semanas miente, y la ficha de producto la
   * muestra al cliente.
   */
  dollarRateUpdatedAt: z.iso.datetime("La fecha de la cotización no es válida"),
  defaultMarginPct: z.number().min(0).max(300),
  whatsappNumber: z.string().min(8, "El número de WhatsApp parece incompleto"),
  whatsappDisplay: z.string().min(4),
  instagram: z.string(),
  tiktok: z.string(),
  email: z.email("Ese email no parece válido"),
  address: z.string().min(3),
  hours: z.string().min(3),
  mapsUrl: z.string(),
});

export async function saveSettingsAction(
  input: z.input<typeof SettingsSchema>
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado" };
  if (!isSupabaseConfigured()) return { ok: false, error: NO_DB };

  const parsed = SettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const supabase = createAdminClient();
    const rows = Object.entries(parsed.data).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("store_settings")
      .upsert(rows, { onConflict: "key" });
    if (error) throw new Error(error.message);

    // Los ajustes se leen en todo el sitio, así que se revalida entero.
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    console.error("[admin] guardar ajustes:", err);
    return { ok: false, error: "No se pudieron guardar los ajustes." };
  }
}
