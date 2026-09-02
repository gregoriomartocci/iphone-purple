import type { Metadata } from "next";
import { Clock, Mail, MapPin } from "lucide-react";
import { InstagramIcon } from "@/components/site/BrandIcons";
import { ContactForm } from "@/components/site/ContactForm";
import { PageHero, PAGE_PHOTOS } from "@/components/site/PageHero";
import { WhatsAppLink } from "@/components/site/WhatsAppLink";
import { getSettings } from "@/lib/data";
import { GENERAL_MESSAGE } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contacto y dónde estamos en La Plata",
  description:
    "Dirección del local en La Plata, horarios de atención y WhatsApp. Respondemos dentro del horario y enviamos a todo el país.",
  alternates: { canonical: "/contacto" },
};

export const revalidate = 3600;

/**
 * Una fila de la tarjeta de datos: ícono, etiqueta y contenido.
 *
 * Existe para que las cuatro filas compartan exactamente el mismo alto de
 * ícono, la misma separación y la misma jerarquía. Escritas a mano se iban
 * desalineando de a poco, que era buena parte de por qué el bloque se veía
 * desprolijo.
 */
function Dato({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 px-6 py-5 sm:px-8">
      <span className="border-purple/25 bg-purple/8 text-purple flex size-10 shrink-0 items-center justify-center rounded-xl border">
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase">
          {label}
        </dt>
        <dd className="mt-1.5 leading-relaxed">{children}</dd>
      </div>
    </div>
  );
}

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
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
          {/*
            Los datos del local van en una tarjeta y no sueltos sobre el fondo.
            Antes eran cuatro bloques flotando en el gris: se leían como notas
            al margen y no como la información principal de la página, que es
            justamente lo que la gente viene a buscar acá.
          */}
          <div className="border-line bg-surface overflow-hidden rounded-2xl border shadow-sm">
            {/* Cabecera oscura: el WhatsApp es la acción que más se usa, así
                que arranca la tarjeta en vez de perderse entre los datos. */}
            <div className="bg-ink px-6 py-7 text-white sm:px-8">
              <p className="eyebrow text-white/55">Escribinos</p>
              <p className="mt-2 text-2xl font-semibold sm:text-3xl">
                Respondemos por WhatsApp
              </p>
              <p className="mt-2 leading-relaxed text-white/65">
                Dentro del horario de atención. Consultar no compromete a nada.
              </p>
              <WhatsAppLink
                number={settings.whatsappNumber}
                message={GENERAL_MESSAGE}
                // Sobre la cabecera oscura el botón se invierte: el `solid`
                // por defecto es tinta sobre claro y acá desaparecería.
                className="text-ink mt-5 bg-white hover:bg-white/90"
              >
                {settings.whatsappDisplay}
              </WhatsAppLink>
            </div>

            {/* Cada dato es una fila con su divisor: el ojo baja por una sola
                columna en vez de saltar entre bloques de altura distinta. */}
            <dl id="local" className="divide-line scroll-mt-24 divide-y">
              <Dato icon={MapPin} label="Dónde estamos">
                <p className="text-foreground">{settings.address}</p>
                {settings.mapsUrl && (
                  <a
                    href={settings.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple hover:text-purple/80 mt-1.5 inline-block text-sm font-medium transition-colors"
                  >
                    Ver en el mapa
                  </a>
                )}
              </Dato>

              <Dato icon={Clock} label="Horarios">
                <p className="text-foreground">{settings.hours}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Domingos y feriados, cerrado.
                </p>
              </Dato>

              <Dato icon={Mail} label="Mail">
                <a
                  href={`mailto:${settings.email}`}
                  className="text-foreground hover:text-purple transition-colors"
                >
                  {settings.email}
                </a>
              </Dato>

              <Dato icon={InstagramIcon} label="Redes">
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
