"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/data";
import { CONDITIONS } from "@/types";

const TradeInSchema = z.object({
  brand: z.string().min(1, "Falta la marca"),
  model: z.string().min(1, "Elegí el modelo de tu equipo"),
  storage: z.string().min(1, "Elegí la capacidad"),
  condition: z.enum(CONDITIONS as [string, ...string[]]),
  estimatedValue: z.number().nonnegative(),
  wantedProductId: z.string().nullable(),
  contactName: z.string().min(2, "Decinos tu nombre"),
  contactPhone: z
    .string()
    .min(6, "Dejanos un teléfono para responderte")
    .max(30, "Ese teléfono parece muy largo"),
  notes: z.string().max(500).nullable(),
});

export type TradeInInput = z.infer<typeof TradeInSchema>;

export type TradeInResult = { ok: true } | { ok: false; error: string };

/**
 * Guarda una consulta de Plan Canje.
 *
 * Es un lead, no una operación: el valor final se define viendo el equipo. Si
 * Supabase todavía no está conectado, no falla — la persona igual sigue a WhatsApp,
 * que es donde realmente se cierra. Perder el lead en la base es recuperable;
 * cortarle el camino al cliente, no.
 */
export async function submitTradeIn(input: TradeInInput): Promise<TradeInResult> {
  const parsed = TradeInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisá los datos" };
  }

  const data = parsed.data;

  if (!isSupabaseConfigured()) {
    console.info("[plan-canje] lead sin guardar (Supabase no configurado):", {
      model: data.model,
      condition: data.condition,
      contact: data.contactPhone,
    });
    return { ok: true };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("trade_ins").insert({
      brand: data.brand,
      model: data.model,
      storage: data.storage,
      condition: data.condition,
      estimated_value: data.estimatedValue,
      wanted_product_id: data.wantedProductId,
      contact_name: data.contactName,
      contact_phone: data.contactPhone,
      notes: data.notes,
      status: "pending",
    });

    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (err) {
    console.error("[plan-canje] no se pudo guardar el lead:", err);
    // El chat de WhatsApp sigue adelante igual.
    return { ok: true };
  }
}
