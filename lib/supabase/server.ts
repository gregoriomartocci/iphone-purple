import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Clientes de Supabase.
 *
 * El sitio público es anónimo — no hay cuentas de cliente ni sesiones — así que
 * ninguno de los dos lee cookies. Eso tiene dos consecuencias buenas: las páginas
 * públicas se siguen pudiendo prerenderizar (acceder a cookies las volvería
 * dinámicas), y el cliente admin no arrastra `next/headers`, que no existe en el
 * runtime del proxy.
 */

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;

/** Lecturas públicas: anon key, sujeto a las policies de RLS del esquema. */
export function createClient() {
  return createSupabaseClient(url(), process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Escrituras y lecturas del panel: service role key, salta RLS.
 * Nunca debe llegar a un componente de cliente.
 */
export function createAdminClient() {
  return createSupabaseClient(url(), process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
