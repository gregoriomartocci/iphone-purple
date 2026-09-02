import type { Metadata } from "next";
import {
  BatteryCharging,
  Camera,
  Clock,
  Droplets,
  Layers,
  PlugZap,
  Smartphone,
  Stethoscope,
  Volume2,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { PageHero, PAGE_PHOTOS } from "@/components/site/PageHero";
import { WhatsAppLink } from "@/components/site/WhatsAppLink";
import { getRepairServices, getSettings } from "@/lib/data";
import { repairMessage } from "@/lib/whatsapp";
import { formatARS } from "@/utils/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reparación de iPhone en La Plata",
  description:
    "Servicio técnico propio en La Plata para iPhone y iPad: cambio de pantalla, batería, pin de carga, cámara y daño por líquido. Diagnóstico sin cargo y garantía escrita sobre la reparación.",
  alternates: { canonical: "/reparaciones" },
};

export const revalidate = 3600;

/**
 * Ícono por servicio, elegido por palabra clave del nombre.
 *
 * Se deduce en vez de guardarse: los servicios se cargan desde el panel, y
 * pedir que además se elija un ícono sería un campo más que nadie completa.
 */
const ICONS: [RegExp, LucideIcon][] = [
  [/pantalla/i, Smartphone],
  [/bater/i, BatteryCharging],
  [/pin|carga/i, PlugZap],
  [/tapa/i, Layers],
  [/c[áa]mara/i, Camera],
  [/altavoz|micr[óo]fono/i, Volume2],
  [/l[íi]quido/i, Droplets],
  [/diagn[óo]stico/i, Stethoscope],
];

const iconFor = (name: string): LucideIcon =>
  ICONS.find(([pattern]) => pattern.test(name))?.[1] ?? Wrench;

const PREPARACION = [
  {
    title: "Hacé un backup",
    text: "Toda reparación tiene riesgo de pérdida de datos. Un respaldo en iCloud o en la computadora te deja tranquilo.",
  },
  {
    title: "Desactivá «Buscar mi iPhone»",
    text: "Hace falta para poder probar el equipo después de repararlo. Si no sabés cómo, te ayudamos en el mostrador.",
  },
  {
    title: "Contanos qué le pasó",
    text: "Si se cayó, se mojó o ya lo abrieron antes, decilo. Cambia el diagnóstico y nos ahorra tiempo a los dos.",
  },
  {
    title: "Traé el cargador si podés",
    text: "En fallas de carga, muchas veces el problema está en el cable o el transformador, no en el equipo.",
  },
];

export default async function RepairsPage() {
  const [services, settings] = await Promise.all([getRepairServices(), getSettings()]);

  return (
    <>
      <PageHero
        title="Reparaciones"
        subtitle="Servicio técnico propio, acá mismo. Diagnóstico sin cargo, presupuesto antes de tocar nada y tres meses de garantía sobre la reparación."
        image={PAGE_PHOTOS.reparaciones}
      />

      <div className="shell-wide py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Qué reparamos</h2>
            <p className="text-muted-foreground mt-2">
              Precios orientativos. El exacto sale del diagnóstico.
            </p>
          </div>
          <WhatsAppLink
            number={settings.whatsappNumber}
            message={repairMessage("una reparación")}
          >
            Consultar por mi equipo
          </WhatsAppLink>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service, i) => {
            const Icon = iconFor(service.name);
            // El diagnóstico sin cargo se destaca: es la puerta de entrada.
            const destacado = service.priceFrom === 0;

            return (
              <article
                key={service.id}
                style={{ "--delay": `${i * 50}ms` } as React.CSSProperties}
                className={cn(
                  "rise-in flex flex-col rounded-2xl border p-6 shadow-sm",
                  "transition-[transform,box-shadow] duration-300 ease-out",
                  "hover:-translate-y-1 hover:shadow-[0_20px_40px_-18px_rgba(16,16,22,0.3)]",
                  destacado ? "border-purple/40 bg-surface" : "border-line bg-surface"
                )}
              >
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl",
                    destacado
                      ? "border-purple text-purple bg-white"
                      : "border-purple/25 text-purple bg-white"
                  )}
                >
                  <Icon className="size-5" />
                </span>

                <h3 className="text-foreground mt-4 text-lg font-semibold">
                  {service.name}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {service.description}
                </p>

                <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span>{service.device}</span>
                  {service.duration && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {service.duration}
                    </span>
                  )}
                </div>

                <div className="border-line mt-5 flex items-end justify-between gap-3 border-t pt-4">
                  <div>
                    {service.priceFrom > 0 ? (
                      <>
                        <span className="text-muted-foreground block text-xs">Desde</span>
                        <span className="tnum text-foreground text-xl font-semibold">
                          {formatARS(service.priceFrom)}
                        </span>
                      </>
                    ) : (
                      <span className="text-purple text-xl font-semibold">Sin cargo</span>
                    )}
                  </div>

                  <WhatsAppLink
                    number={settings.whatsappNumber}
                    message={repairMessage(service.name, service.device)}
                    variant="outline"
                    className="h-10 shrink-0 px-4 text-sm"
                  >
                    Consultar
                  </WhatsAppLink>
                </div>
              </article>
            );
          })}
        </div>

        <p className="text-muted-foreground mt-8 max-w-2xl text-sm leading-relaxed">
          Los precios varían según el modelo y la disponibilidad del repuesto. El
          presupuesto exacto te lo damos después del diagnóstico, y no se toca nada hasta
          que lo apruebes.
        </p>

        <section className="border-line bg-surface mt-16 rounded-2xl border p-8 shadow-sm sm:p-10">
          <h2 className="text-2xl font-semibold">Antes de traerlo</h2>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {PREPARACION.map((item) => (
              <li key={item.title}>
                <h3 className="text-foreground text-sm font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
