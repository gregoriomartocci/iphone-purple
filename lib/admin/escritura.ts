import "server-only";
import { colorOficial } from "@/lib/colores";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sellPrice } from "@/lib/whatsapp/parser";
import { skuDe } from "@/lib/whatsapp/sincronizar";
import type { ParsedRow } from "@/types";
import { slugify } from "@/utils/format";

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
  listaCompleta = rows,
}: {
  supabase: SupabaseClient;
  supplierId: string | null;
  marginPct: number;
  dollarRate: number;
  rows: ParsedRow[];
  rawText: string;
  /** Toda la lista del proveedor, también lo que no ganó: la usa la comparación. */
  listaCompleta?: ParsedRow[];
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
      color: colorOficial(row.model, row.color)?.nombre ?? "Sin especificar",
      color_hex: colorOficial(row.model, row.color)?.hex ?? "#cccccc",
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
    parsed_json: listaCompleta,
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
