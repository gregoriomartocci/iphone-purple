import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { getSettings, isSupabaseConfigured } from "@/lib/data";
import {
  cambioMenor,
  precioArsDesdeUsd,
  revisarCotizacion,
  traerCotizacion,
} from "@/lib/cotizacion";

/**
 * Actualiza la cotización del dólar y, con ella, los precios en pesos del
 * catálogo.
 *
 * Son dos cosas y las dos hacen falta. `price_ars` está guardado en la base,
 * no se calcula al mostrarlo, así que cambiar la cotización sola no mueve un
 * solo precio: solo afectaría a lo que se publique después. Esto recalcula lo
 * ya publicado a partir de su precio en dólares, que es el que no cambia.
 *
 * El costo en dólares no se toca: es lo que pagó el negocio, un hecho que ya
 * ocurrió.
 *
 * La llama cada hora el lector de WhatsApp, que está siempre prendido. El cron de
 * `vercel.json` queda como respaldo diario: el plan actual de Vercel no permite
 * que corra más seguido.
 *
 * Entra por dos puertas: el cron manda el `CRON_SECRET`, y una persona del
 * panel entra con su sesión. Sin ninguna de las dos no se dispara algo que
 * reescribe todos los precios del catálogo.
 */
export const dynamic = "force-dynamic";

async function autorizado(req: Request): Promise<boolean> {
  const secreto = process.env.CRON_SECRET;
  if (secreto && req.headers.get("authorization") === `Bearer ${secreto}`) return true;

  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  return user?.role === "admin" || user?.role === "super_admin";
}

export async function GET(req: Request) {
  if (!(await autorizado(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no está configurado" }, { status: 503 });
  }

  const forzar = new URL(req.url).searchParams.get("forzar") === "1";

  try {
    const [nueva, settings] = await Promise.all([traerCotizacion(), getSettings()]);
    const anterior = settings.dollarRate;
    const revision = revisarCotizacion(nueva, anterior);

    if (!revision.ok && !forzar) {
      /*
       * 409 y no 500: la petición está bien, la cotización es la que no
       * convence. Un cron que recibe esto tiene que avisar, no reintentar.
       */
      return NextResponse.json(
        {
          aplicada: false,
          motivo: revision.motivo,
          detalle: revision.detalle,
          anterior,
          nueva: nueva.venta,
        },
        { status: 409 }
      );
    }

    if (!forzar && cambioMenor(nueva.venta, anterior)) {
      return NextResponse.json({
        aplicada: false,
        motivo: "cambio-menor",
        anterior,
        nueva: nueva.venta,
        fuente: nueva.fuente,
      });
    }

    const supabase = createAdminClient();
    const cuando = new Date().toISOString();

    await supabase.from("store_settings").upsert(
      [
        { key: "dollarRate", value: nueva.venta, updated_at: cuando },
        { key: "dollarRateUpdatedAt", value: nueva.fecha, updated_at: cuando },
      ],
      { onConflict: "key" }
    );

    /*
     * Solo las activas y con precio en dólares. Sin ese número no hay de dónde
     * recalcular, y pisar con una cuenta un precio que alguien puso a mano
     * sería peor que dejarlo quieto.
     */
    const { data: variantes, error } = await supabase
      .from("product_variants")
      .select("id, price_usd, price_ars")
      .eq("is_active", true)
      .not("price_usd", "is", null);

    if (error) throw new Error(error.message);

    let recalculadas = 0;
    for (const v of variantes ?? []) {
      const nuevoArs = precioArsDesdeUsd(Number(v.price_usd), nueva.venta);
      if (nuevoArs === Number(v.price_ars)) continue;
      const { error: errorUpdate } = await supabase
        .from("product_variants")
        .update({ price_ars: nuevoArs })
        .eq("id", v.id);
      if (errorUpdate) throw new Error(errorUpdate.message);
      recalculadas += 1;
    }

    return NextResponse.json({
      aplicada: true,
      anterior,
      nueva: nueva.venta,
      fuente: nueva.fuente,
      fecha: nueva.fecha,
      variantesRecalculadas: recalculadas,
      forzada: forzar && !revision.ok ? revision.motivo : undefined,
    });
  } catch (err) {
    console.error("[cotizacion]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
