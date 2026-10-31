import "server-only";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { sellPrice } from "@/lib/whatsapp/parser";
import { CATEGORIES, GRADES, type ParsedRow } from "@/types";
import { skuDe } from "@/lib/whatsapp/sincronizar";
import { slugify } from "@/utils/format";

export { skuDe, skuDesdeClave } from "@/lib/whatsapp/sincronizar";

/**
 * Lo que comparten los dos caminos que publican precios: el manual, donde
 * alguien pega una lista en `/admin/importar`, y el de WhatsApp, donde las
 * listas llegan solas.
 *
 * Vive acá y no en `actions.ts` porque un módulo `"use server"` solo puede
 * exportar funciones asíncronas: un esquema de Zod o una constante no pueden
 * salir de ahí. Y vive en un solo lugar porque dos implementaciones de "qué
 * precio se guarda" es exactamente la clase de duplicación que termina con el
 * catálogo y el panel mostrando números distintos.
 */

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

export const NO_DB =
  "Necesitás conectar Supabase para guardar cambios. Cargá las claves en .env.local y aplicá lib/supabase/schema.sql.";

/**
 * Las Server Actions se pueden invocar con un POST directo, sin pasar por la UI ni
 * por `proxy.ts`. Por eso cada una vuelve a verificar sesión y rol acá adentro:
 * el redirect del proxy es comodidad, esto es la barrera.
 */
export async function requireAdmin(): Promise<{ id: string } | null> {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return null;
  if (user.role !== "admin" && user.role !== "super_admin") return null;
  return { id: user.id };
}

export const ParsedRowSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  category: z.enum(CATEGORIES as [string, ...string[]]),
  authenticity: z.enum(["original", "replica"]),
  storage: z.string(),
  color: z.string().nullable(),
  grade: z.enum(GRADES as [string, ...string[]]),
  batteryHealth: z.number().int().min(0).max(100).nullable(),
  currency: z.enum(["USD", "ARS"]),
  cost: z.number().positive(),
  quantity: z.number().int().min(0),
  notes: z.string().nullable(),
});

/**
 * Escribe un lote de filas de un mismo proveedor, con un mismo margen.
 *
 * Reutiliza el producto si el slug ya existe y actualiza la variante si el SKU
 * ya existe: importar dos veces la misma lista corrige precios, no duplica el
 * catálogo.
 *
 * Deja el texto original en `supplier_imports` junto al resultado. Esa fila es
 * lo único que permite auditar después por qué un equipo quedó a un precio: sin
 * ella, un parseo dudoso es indistinguible de un precio bien leído.
 */
export async function publicarFilas({
  supabase,
  supplierId,
  marginPct,
  dollarRate,
  rows,
  rawText,
}: {
  supabase: SupabaseClient;
  supplierId: string | null;
  marginPct: number;
  dollarRate: number;
  rows: ParsedRow[];
  rawText: string;
}): Promise<number> {
  let published = 0;

  for (const row of rows) {
    const name = `${row.model}`.trim();
    const slug = slugify(name);

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
          category: row.category,
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
    const sku = skuDe(row);

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
      grade: row.grade,
      authenticity: row.authenticity,
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

  await supabase.from("supplier_imports").insert({
    supplier_id: supplierId,
    raw_text: rawText,
    parsed_json: rows,
    margin_pct: marginPct,
    dollar_rate: dollarRate,
    rows_published: published,
    /* El CHECK de la tabla solo admite draft | approved | discarded. Y
       'approved' es correcto para los dos caminos: el de WhatsApp también lo
       aprueba una persona antes de que esto se ejecute. */
    status: "approved",
  });

  return published;
}
