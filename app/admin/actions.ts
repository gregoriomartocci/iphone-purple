"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/data";
import { parseSupplierList, sellPrice } from "@/lib/whatsapp/parser";
import { CONDITIONS, type ParsedRow } from "@/types";
import { slugify } from "@/utils/format";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

const NO_DB =
  "Necesitás conectar Supabase para guardar cambios. Cargá las claves en .env.local y aplicá lib/supabase/schema.sql.";

/**
 * Las Server Actions se pueden invocar con un POST directo, sin pasar por la UI ni
 * por `proxy.ts`. Por eso cada una vuelve a verificar sesión y rol acá adentro:
 * el redirect del proxy es comodidad, esto es la barrera.
 */
async function requireAdmin(): Promise<{ id: string } | null> {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return null;
  if (user.role !== "admin" && user.role !== "super_admin") return null;
  return { id: user.id };
}

// ------------------------------------------------------- importar listas

const ParsedRowSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  storage: z.string(),
  color: z.string().nullable(),
  condition: z.enum(CONDITIONS as [string, ...string[]]),
  batteryHealth: z.number().int().min(0).max(100).nullable(),
  currency: z.enum(["USD", "ARS"]),
  cost: z.number().positive(),
  quantity: z.number().int().min(0),
  notes: z.string().nullable(),
});

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
    const supabase = createAdminClient();
    let published = 0;

    for (const row of rows) {
      const name = `${row.model}`.trim();
      const slug = slugify(name);

      // Reutilizamos el producto si ya está; si no, lo creamos.
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      let productId = existing?.id as string | undefined;

      if (!productId) {
        const { data: created, error: createError } = await supabase
          .from("products")
          .insert({
            name,
            slug,
            brand: row.brand,
            model: row.model,
            category: row.model.toLowerCase().includes("ipad")
              ? "ipad"
              : row.model.toLowerCase().includes("watch")
                ? "watch"
                : row.model.toLowerCase().includes("macbook")
                  ? "mac"
                  : "iphone",
            description: "",
            specs: {},
            status: "active",
          })
          .select("id")
          .single();

        if (createError) throw new Error(createError.message);
        productId = created.id;
      }

      const price = sellPrice(row.cost, row.currency, marginPct, dollarRate);
      const sku = `${slug.toUpperCase()}-${row.storage || "NA"}-${row.condition}`;

      const { data: variant } = await supabase
        .from("product_variants")
        .select("id, stock")
        .eq("sku", sku)
        .maybeSingle();

      const payload = {
        product_id: productId,
        storage: row.storage || "—",
        color: row.color ?? "Sin especificar",
        color_hex: "#cccccc",
        condition: row.condition,
        battery_health: row.batteryHealth,
        price_ars: price.priceArs,
        price_usd: price.priceUsd,
        cost_usd: price.costUsd,
        stock: row.quantity,
        sku,
        supplier_id: supplierId,
        is_active: true,
      };

      const { error: variantError } = variant
        ? await supabase.from("product_variants").update(payload).eq("id", variant.id)
        : await supabase.from("product_variants").insert(payload);

      if (variantError) throw new Error(variantError.message);
      published += 1;
    }

    // Queda el texto original junto al resultado, para poder auditar un parseo dudoso.
    await supabase.from("supplier_imports").insert({
      supplier_id: supplierId,
      raw_text: rawText,
      parsed_json: rows,
      margin_pct: marginPct,
      dollar_rate: dollarRate,
      rows_published: published,
      status: "approved",
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
    return { ok: true };
  } catch (err) {
    console.error("[admin] guardar proveedor:", err);
    return { ok: false, error: "No se pudo guardar el proveedor." };
  }
}

// ------------------------------------------------------- ajustes

const SettingsSchema = z.object({
  dollarRate: z.number().positive("La cotización tiene que ser mayor a cero"),
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
