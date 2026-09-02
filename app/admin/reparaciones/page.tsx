import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { getRepairServices, isSupabaseConfigured } from "@/lib/data";
import { formatARS } from "@/utils/format";

export const metadata: Metadata = { title: "Reparaciones" };

export const dynamic = "force-dynamic";

export default async function AdminRepairsPage() {
  const services = await getRepairServices();

  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Reparaciones</h1>
        <p className="text-muted-foreground mt-1.5">
          Los servicios que se publican en la página de reparaciones.
        </p>
      </header>

      <ul className="divide-line border-line divide-y rounded-xl border">
        {services.map((service) => (
          <li key={service.id} className="flex items-center justify-between gap-4 p-5">
            <div className="min-w-0">
              <p className="text-ink font-medium">{service.name}</p>
              <p className="text-muted-foreground mt-0.5 text-sm">{service.device}</p>
              {service.duration && (
                <p className="text-muted-foreground mt-1 inline-flex items-center gap-1 text-xs">
                  <Clock className="size-3" />
                  {service.duration}
                </p>
              )}
            </div>
            <span className="tnum text-ink shrink-0 font-medium">
              {service.priceFrom > 0
                ? `Desde ${formatARS(service.priceFrom)}`
                : "Sin cargo"}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-muted-foreground mt-5 text-sm">
        {isSupabaseConfigured()
          ? "Para agregar o editar servicios, usá la tabla repair_services en Supabase."
          : "Estos son los servicios de demostración de lib/data/seed.ts. Conectá Supabase para administrarlos."}
      </p>
    </div>
  );
}
