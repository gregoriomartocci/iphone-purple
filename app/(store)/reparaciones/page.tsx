import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { WhatsAppLink } from "@/components/site/WhatsAppLink";
import { PageHero, PAGE_PHOTOS } from "@/components/site/PageHero";
import { getRepairServices, getSettings } from "@/lib/data";
import { repairMessage } from "@/lib/whatsapp";
import { formatARS } from "@/utils/format";

export const metadata: Metadata = {
  title: "Reparaciones",
  description:
    "Servicio técnico propio para iPhone y iPad: pantalla, batería, pin de carga y más. Diagnóstico sin cargo y garantía sobre la reparación.",
};

export const revalidate = 3600;

export default async function RepairsPage() {
  const [services, settings] = await Promise.all([getRepairServices(), getSettings()]);

  return (
    <>
      <PageHero
        title="Reparaciones"
        subtitle="Servicio técnico propio, acá mismo. Diagnóstico sin cargo, presupuesto antes de tocar nada y tres meses de garantía sobre la reparación."
        image={PAGE_PHOTOS.reparaciones}
      />

      <div className="shell py-12 sm:py-16">
        <WhatsAppLink
          number={settings.whatsappNumber}
          message={repairMessage("una reparación")}
        >
          Consultar por mi equipo
        </WhatsAppLink>

        <section className="mt-16">
          <h2 className="text-muted-foreground text-sm font-medium">
            Servicios y precios orientativos
          </h2>

          <ul className="divide-line border-line mt-4 divide-y border-t">
            {services.map((service) => (
              <li
                key={service.id}
                className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-foreground font-medium">{service.name}</h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {service.description}
                  </p>
                  <p className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span>{service.device}</span>
                    {service.duration && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {service.duration}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                  <div className="sm:text-right">
                    {service.priceFrom > 0 ? (
                      <>
                        <span className="text-muted-foreground block text-[11px]">
                          Desde
                        </span>
                        <span className="tnum text-foreground text-lg font-semibold">
                          {formatARS(service.priceFrom)}
                        </span>
                      </>
                    ) : (
                      <span className="text-purple text-lg font-semibold">Sin cargo</span>
                    )}
                  </div>
                  <WhatsAppLink
                    number={settings.whatsappNumber}
                    message={repairMessage(service.name, service.device)}
                    variant="outline"
                    className="h-10 px-5"
                  >
                    Consultar
                  </WhatsAppLink>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-muted-foreground mt-6 text-sm leading-relaxed">
            Los precios varían según el modelo y la disponibilidad del repuesto. El
            presupuesto exacto te lo damos después del diagnóstico, y no se toca nada
            hasta que lo apruebes.
          </p>
        </section>

        <section className="bg-surface mt-20 rounded-2xl p-8 sm:p-10">
          <h2 className="text-xl font-semibold">Antes de traerlo</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            <li>
              <h3 className="text-foreground text-sm font-medium">Hacé un backup</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                Toda reparación tiene riesgo de pérdida de datos. Un respaldo en iCloud o
                en la computadora te deja tranquilo.
              </p>
            </li>
            <li>
              <h3 className="text-foreground text-sm font-medium">
                Desactivá «Buscar mi iPhone»
              </h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                Hace falta para poder probar el equipo después de repararlo. Si no sabés
                cómo, te ayudamos en el mostrador.
              </p>
            </li>
            <li>
              <h3 className="text-foreground text-sm font-medium">
                Contanos qué le pasó
              </h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                Si se cayó, se mojó o ya lo abrieron antes, decilo. Cambia el diagnóstico
                y nos ahorra tiempo a los dos.
              </p>
            </li>
            <li>
              <h3 className="text-foreground text-sm font-medium">
                Traé el cargador si podés
              </h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                En fallas de carga, muchas veces el problema está en el cable o el
                transformador, no en el equipo.
              </p>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
