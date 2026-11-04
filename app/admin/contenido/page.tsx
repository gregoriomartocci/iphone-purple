import type { Metadata } from "next";
import Image from "next/image";
import { CopiarTexto } from "@/components/admin/CopiarTexto";
import { getSettings } from "@/lib/data";
import { getProductsConCosto } from "@/lib/data/admin";
import { armarPlan } from "@/lib/contenido";

export const metadata: Metadata = { title: "Contenido" };

export const dynamic = "force-dynamic";

/** El día en Argentina, no en el servidor: a la noche serían días distintos. */
function hoyEnArgentina(): Date {
  const iso = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  });
  return new Date(`${iso}T12:00:00Z`);
}

function fechaLarga(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export default async function AdminContenidoPage() {
  const [productos, settings] = await Promise.all([getProductsConCosto(), getSettings()]);
  const plan = armarPlan(productos, settings, hoyEnArgentina());

  return (
    <div className="max-w-4xl">
      <header className="mb-6">
        <h1 className="text-[1.75rem] font-semibold tracking-[-0.02em] text-white">
          Contenido
        </h1>
        <p className="mt-1.5 text-white/45">
          Historias de Instagram para los próximos 7 días, con los productos que hay hoy.
          Tres por día: producto a la mañana, interacción al mediodía y llamado a escribir
          a la noche. Los precios cambian con el dólar: revisalos antes de publicar.
        </p>
      </header>

      <ol className="space-y-5">
        {plan.map((dia) => (
          <li key={dia.fecha} className="vidrio-sutil rounded-2xl p-4 sm:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold text-white">{dia.tema}</h2>
              <span className="text-xs text-white/40">{fechaLarga(dia.fecha)}</span>
            </div>
            <p className="mt-0.5 text-sm text-white/45">{dia.objetivo}</p>

            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {dia.historias.map((h) => (
                <li
                  key={h.hora}
                  className="flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"
                >
                  <p className="tnum text-xs text-white/40">
                    {h.hora} · {h.formato}
                  </p>
                  {h.producto && (
                    <div className="mt-2 flex items-center gap-3">
                      <Image
                        src={h.producto.foto}
                        alt={h.producto.nombre}
                        width={56}
                        height={56}
                        className="size-14 shrink-0 rounded-lg bg-white object-contain p-1"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {h.producto.nombre}
                        </p>
                        <p className="truncate text-xs text-white/45">
                          {h.producto.detalle}
                        </p>
                        <p className="tnum text-xs text-white/70">{h.producto.precio}</p>
                      </div>
                    </div>
                  )}
                  <p className="mt-2 text-xs font-medium text-white/60">{h.idea}</p>
                  <p className="mt-1 flex-1 text-sm text-white">“{h.texto}”</p>
                  <p className="mt-2 text-xs text-white/45">Sticker: {h.sticker}</p>
                  <div className="mt-3">
                    <CopiarTexto
                      texto={
                        h.producto
                          ? `${h.texto}\n${h.producto.nombre} · ${h.producto.precio}`
                          : h.texto
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
