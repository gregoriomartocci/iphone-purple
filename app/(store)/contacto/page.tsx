import type { Metadata } from "next";
import { Clock, Mail, MapPin } from "lucide-react";
import { InstagramIcon } from "@/components/site/BrandIcons";
import { ContactForm } from "@/components/site/ContactForm";
import { PageHero, PAGE_PHOTOS } from "@/components/site/PageHero";
import { WhatsAppLink } from "@/components/site/WhatsAppLink";
import { getSettings } from "@/lib/data";
import { GENERAL_MESSAGE } from "@/lib/whatsapp";
import { HorarioLocal } from "@/components/site/HorarioLocal";

/**
 * Una fila de datos: ícono chico, título y contenido.
 *
 * El ícono va suelto y en el tono apagado, sin recuadro de color: a esta
 * escala el recuadro pesaba más que el dato que acompañaba, que era buena
 * parte de por qué el bloque se veía cargado.
 */
function Dato({
  icono: Icono,
  titulo,
  children,
}: {
  icono: React.ComponentType<{ className?: string }>;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 py-5">
      <Icono className="text-muted-foreground mt-0.5 size-[18px] shrink-0" />
      <div className="min-w-0 flex-1">
        <dt className="text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase">
          {titulo}
        </dt>
        <dd className="mt-2 leading-relaxed">{children}</dd>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Contacto y dónde estamos en La Plata",
  description:
    "Dirección del local en La Plata, horarios de atención y WhatsApp. Respondemos dentro del horario y enviamos a todo el país.",
  alternates: { canonical: "/contacto" },
};

export const revalidate = 3600;

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        title="Contacto"
        subtitle="Escribinos por WhatsApp o pasá por el local. Consultar no compromete a nada."
        image={PAGE_PHOTOS.contacto}
      />

      <div className="shell py-12 sm:py-16">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="mt-4 text-3xl leading-tight font-semibold sm:text-4xl">
              Escribinos y te
              <br />
              respondemos hoy.
            </h2>
            <p className="text-muted-foreground prosa mt-4 leading-relaxed">
              Por WhatsApp contestamos dentro del horario de atención. Si preferís, pasá
              por el local y lo vemos juntos: consultar no compromete a nada.
            </p>

            <WhatsAppLink
              number={settings.whatsappNumber}
              message={GENERAL_MESSAGE}
              className="mt-6"
            >
              {settings.whatsappDisplay}
            </WhatsAppLink>

            {/* Los datos van como lista tipográfica y no como tarjetas con
                ícono en un recuadro: a esta escala esos recuadros pesaban más
                que el dato que acompañaban. */}
            <dl
              id="local"
              className="divide-line border-line mt-10 scroll-mt-24 divide-y border-t"
            >
              <Dato icono={MapPin} titulo="Dónde estamos">
                <p className="text-foreground">{settings.address}</p>
                {settings.mapsUrl && (
                  <a
                    href={settings.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple hover:text-purple/80 subraya mt-1 inline-block text-sm font-medium transition-colors"
                  >
                    Ver en el mapa
                  </a>
                )}
              </Dato>

              <Dato icono={Clock} titulo="Horarios">
                <HorarioLocal />
              </Dato>

              <Dato icono={Mail} titulo="Mail">
                <a
                  href={`mailto:${settings.email}`}
                  className="text-foreground hover:text-purple subraya transition-colors"
                >
                  {settings.email}
                </a>
              </Dato>

              <Dato icono={InstagramIcon} titulo="Redes">
                <div className="flex flex-wrap gap-2">
                  {[
                    { href: settings.instagram, label: "Instagram" },
                    { href: settings.tiktok, label: "TikTok" },
                  ].map(({ href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-line text-foreground hover:border-foreground/35 hover:bg-elevated inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </Dato>
            </dl>
          </div>

          <ContactForm whatsappNumber={settings.whatsappNumber} />
        </div>
      </div>
    </>
  );
}
