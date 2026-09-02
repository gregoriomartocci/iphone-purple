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
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <WhatsAppLink number={settings.whatsappNumber} message={GENERAL_MESSAGE}>
              {settings.whatsappDisplay}
            </WhatsAppLink>

            <dl id="local" className="mt-10 scroll-mt-24 space-y-7">
              <div className="flex gap-4">
                <MapPin className="text-purple mt-0.5 size-5 shrink-0" />
                <div>
                  <dt className="text-foreground text-sm font-medium">Dónde estamos</dt>
                  <dd className="text-muted-foreground mt-1">{settings.address}</dd>
                  {settings.mapsUrl && (
                    <a
                      href={settings.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple mt-1.5 inline-block text-sm hover:underline"
                    >
                      Ver en el mapa
                    </a>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Clock className="text-purple mt-0.5 size-5 shrink-0" />
                <div>
                  <dt className="text-foreground text-sm font-medium">Horarios</dt>
                  <dd className="text-muted-foreground mt-1">{settings.hours}</dd>
                  <dd className="text-muted-foreground mt-1 text-sm">
                    Domingos y feriados, cerrado.
                  </dd>
                </div>
              </div>

              <div className="flex gap-4">
                <Mail className="text-purple mt-0.5 size-5 shrink-0" />
                <div>
                  <dt className="text-foreground text-sm font-medium">Mail</dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {settings.email}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex gap-4">
                <InstagramIcon className="text-purple mt-0.5 size-5 shrink-0" />
                <div>
                  <dt className="text-foreground text-sm font-medium">Redes</dt>
                  <dd className="mt-1 flex flex-wrap gap-x-4">
                    <a
                      href={settings.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Instagram
                    </a>
                    <a
                      href={settings.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      TikTok
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <ContactForm whatsappNumber={settings.whatsappNumber} />
        </div>
      </div>
    </>
  );
}
