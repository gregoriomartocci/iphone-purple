"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { getSettings, isSupabaseConfigured } from "@/lib/data";
import { getSuppliers } from "@/lib/data/admin";
import { pedirMensajes, servidorConfigurado } from "@/lib/whatsapp/servidor";
import { parseSupplierList } from "@/lib/whatsapp/parser";
import {
  listasParaImportar,
  planificarPublicacion,
  type ListaInterpretada,
} from "@/lib/whatsapp/plan";
import {
  NO_DB,
  ParsedRowSchema,
  publicarFilas,
  requireAdmin,
  skuDesdeClave,
  type ActionResult,
} from "@/lib/admin/publicar";
import type { ParsedRow } from "@/types";

/**
 * El camino completo de WhatsApp al catálogo, partido en dos pasos.
 *
 * `planificarDesdeWhatsappAction` lee, interpreta y decide, pero **no escribe
 * nada**. `publicarPlanAction` escribe lo que una persona aprobó.
 *
 * Están separados a propósito y no es ceremonia: interpretar cuesta plata y
 * publicar cambia precios de cara al cliente. Que el paso caro sea reversible
 * —mirás el plan, no te convence, no publicás— es lo que permite correr esto
 * sin miedo. Juntarlos en un botón sería una operación que gasta y publica a
 * la vez, sin ningún punto donde frenar.
 */

/** Un proveedor con sus filas listas para publicar, ya con su margen. */
export interface LoteProveedor {
  proveedorId: string;
  proveedorNombre: string;
  marginPct: number;
  /** El mensaje original. Va a `supplier_imports` para poder auditar después. */
  rawText: string;
  filas: ParsedRow[];
}

export interface PlanParaRevisar {
  lotes: LoteProveedor[];
  /** Listas que no se publican solas: alguien tiene que mirarlas. */
  frenadas: { proveedor: string; revisiones: { motivo: string; detalle: string }[] }[];
  /** Lo que un proveedor dejó de ofrecer. Se pone en cero, nunca se borra. */
  sinStock: string[];
  dollarRate: number;
  /** Líneas que el intérprete no pudo leer, por proveedor. */
  avisos: { proveedor: string; textos: string[] }[];
  /** Cuántos mensajes se mandaron a interpretar. Es lo que se gastó. */
  listasInterpretadas: number;
}

export async function planificarDesdeWhatsappAction(
  dias = 3
): Promise<ActionResult<PlanParaRevisar>> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado" };
  if (!isSupabaseConfigured()) return { ok: false, error: NO_DB };
  if (!servidorConfigurado()) {
    return {
      ok: false,
      error:
        "Falta configurar el lector de WhatsApp. Cargá WHATSAPP_SERVIDOR_URL y WHATSAPP_SERVIDOR_TOKEN.",
    };
  }

  const mensajes = await pedirMensajes(dias);
  if (!mensajes.ok) return { ok: false, error: mensajes.detalle };

  try {
    const supabase = createAdminClient();
    const [proveedores, settings] = await Promise.all([getSuppliers(), getSettings()]);

    /*
     * La última importación de cada proveedor sirve para dos cosas distintas:
     * saltear mensajes ya procesados, y comparar la lista nueva contra la
     * anterior para detectar que se encogió de golpe. Se trae una sola vez,
     * ordenada, y se queda con la primera de cada proveedor.
     */
    const { data: importaciones } = await supabase
      .from("supplier_imports")
      .select("supplier_id, created_at, parsed_json")
      .order("created_at", { ascending: false });

    const ultima = new Map<string, { fecha: string; filas: ParsedRow[] }>();
    for (const fila of importaciones ?? []) {
      const id = fila.supplier_id as string | null;
      if (!id || ultima.has(id)) continue;
      ultima.set(id, {
        fecha: fila.created_at as string,
        filas: (fila.parsed_json ?? []) as ParsedRow[],
      });
    }

    const listas = listasParaImportar(
      mensajes.datos.chats,
      proveedores,
      (id) => ultima.get(id)?.fecha ?? null
    );

    if (listas.length === 0) {
      return {
        ok: false,
        error:
          "No hay listas nuevas para interpretar. O ningún proveedor mandó nada, o ya se importó todo lo que mandaron.",
      };
    }

    const interpretadas: ListaInterpretada[] = [];
    const avisos: PlanParaRevisar["avisos"] = [];
    const textoDe = new Map<string, string>();

    for (const lista of listas) {
      const { rows, warnings } = await parseSupplierList(lista.mensaje.texto);
      if (rows.length === 0) {
        avisos.push({
          proveedor: lista.proveedor.name,
          textos: ["No se encontró ningún equipo en el mensaje."],
        });
        continue;
      }

      interpretadas.push({
        proveedor: lista.proveedor,
        filas: rows,
        filasAnteriores: ultima.get(lista.proveedor.id)?.filas ?? [],
      });
      textoDe.set(lista.proveedor.id, lista.mensaje.texto);
      if (warnings.length > 0) {
        avisos.push({ proveedor: lista.proveedor.name, textos: warnings });
      }
    }

    const plan = planificarPublicacion(interpretadas, settings.dollarRate);

    /*
     * El plan viene por equipo y la escritura va por proveedor —cada uno con su
     * margen y su texto original—, así que se agrupa acá y no en la pantalla:
     * que el cliente arme los lotes sería darle a la UI la decisión de qué
     * margen se aplica a qué fila.
     */
    const porProveedor = new Map<string, LoteProveedor>();
    for (const { fila, proveedor } of plan.publicar) {
      let lote = porProveedor.get(proveedor.id);
      if (!lote) {
        lote = {
          proveedorId: proveedor.id,
          proveedorNombre: proveedor.name,
          marginPct: proveedor.defaultMarginPct,
          rawText: textoDe.get(proveedor.id) ?? "",
          filas: [],
        };
        porProveedor.set(proveedor.id, lote);
      }
      lote.filas.push(fila);
    }

    return {
      ok: true,
      data: {
        lotes: [...porProveedor.values()],
        frenadas: plan.frenadas.map((f) => ({
          proveedor: f.proveedor.name,
          revisiones: f.revisiones.map((r) => ({ motivo: r.motivo, detalle: r.detalle })),
        })),
        sinStock: plan.sinStock,
        dollarRate: settings.dollarRate,
        avisos,
        listasInterpretadas: interpretadas.length,
      },
    };
  } catch (err) {
    console.error("[whatsapp] planificar:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo armar el plan.",
    };
  }
}

const PublicarSchema = z.object({
  lotes: z
    .array(
      z.object({
        proveedorId: z.string().min(1),
        marginPct: z.number().min(0).max(300),
        rawText: z.string(),
        filas: z.array(ParsedRowSchema).min(1),
      })
    )
    .min(1, "No hay nada para publicar."),
  sinStock: z.array(z.string()),
  dollarRate: z.number().positive(),
});

export async function publicarPlanAction(
  input: z.input<typeof PublicarSchema>
): Promise<ActionResult<{ publicados: number; enCero: number }>> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado" };
  if (!isSupabaseConfigured()) return { ok: false, error: NO_DB };

  const parsed = PublicarSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { lotes, sinStock, dollarRate } = parsed.data;

  try {
    const supabase = createAdminClient();
    let publicados = 0;

    for (const lote of lotes) {
      publicados += await publicarFilas({
        supabase,
        supplierId: lote.proveedorId,
        marginPct: lote.marginPct,
        dollarRate,
        rows: lote.filas as ParsedRow[],
        rawText: lote.rawText,
      });
    }

    /*
     * Lo que dejó de ofrecerse va a stock cero, no se borra. Borrarlo perdería
     * el historial de precios y rompería cualquier venta que lo referencie; y
     * si el proveedor lo vuelve a ofrecer mañana, la variante ya está con su
     * SKU y su historia.
     */
    let enCero = 0;
    if (sinStock.length > 0) {
      const skus = sinStock.map(skuDesdeClave);
      const { data, error } = await supabase
        .from("product_variants")
        .update({ stock: 0 })
        .in("sku", skus)
        .select("id");
      if (error) throw new Error(error.message);
      enCero = data?.length ?? 0;
    }

    revalidatePath("/catalogo");
    revalidatePath("/admin/productos");
    revalidatePath("/admin/whatsapp");
    revalidatePath("/admin");

    return { ok: true, data: { publicados, enCero } };
  } catch (err) {
    console.error("[whatsapp] publicar plan:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo publicar el plan.",
    };
  }
}
