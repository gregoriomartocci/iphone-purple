import "server-only";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { CATEGORIES, GRADES } from "@/types";

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

export { publicarFilas } from "./escritura";
