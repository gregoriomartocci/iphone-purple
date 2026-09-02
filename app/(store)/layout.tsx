import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getSettings } from "@/lib/data";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  // Datos del negocio para Google. Salen de los mismos ajustes que usa el footer,
  // así cambiar la dirección en el panel actualiza también lo que ve el buscador.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "iPhone Purple",
    description:
      "Venta de equipos Apple con garantía, Plan Canje y servicio técnico en Buenos Aires.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://iphonepurple.com.ar",
    telephone: `+${settings.whatsappNumber}`,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "Ciudad Autónoma de Buenos Aires",
      addressCountry: "AR",
    },
    openingHours: settings.hours,
    sameAs: [settings.instagram, settings.tiktok].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader whatsappNumber={settings.whatsappNumber} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
