import { AvisoCatalogoDemo } from "@/components/site/AvisoCatalogoDemo";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getSettings } from "@/lib/data";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://iphonepurple.com.ar";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  // "Calle 20 4243, Gonnet, La Plata" → calle y localidad, que es como las
  // pide schema.org. Sin coma, todo es calle y la localidad cae al partido.
  const [calle, localidad = "La Plata"] = settings.address
    .split(",")
    .map((parte) => parte.trim());

  /**
   * Ficha del negocio para Google, en el formato que arma el resultado con
   * mapa, horarios y teléfono.
   *
   * Sale de los mismos ajustes que usa el footer, así cambiar la dirección en
   * el panel actualiza también lo que ve el buscador y no quedan dos verdades.
   *
   * `ElectronicsStore` en vez de `Store` a secas: es el tipo específico del
   * rubro y ayuda a que el negocio entre en las búsquedas de la categoría.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    "@id": `${SITE_URL}/#tienda`,
    name: "iPhone Purple",
    description:
      "Venta de iPhone, iPad, Mac, Apple Watch y celulares en La Plata, con garantía escrita, Plan Canje y servicio técnico propio.",
    url: SITE_URL,
    telephone: `+${settings.whatsappNumber}`,
    email: settings.email,
    priceRange: "$$",
    currenciesAccepted: "ARS",
    paymentAccepted: "Efectivo, transferencia, tarjeta",
    address: {
      "@type": "PostalAddress",
      /*
       * La dirección se guarda como un solo texto porque es un solo campo del
       * panel, pero el schema la quiere partida. Se corta en la primera coma:
       * lo de antes es la calle, lo que sigue la localidad.
       *
       * Antes la localidad estaba fija en "La Plata" y la calle llevaba la
       * dirección entera, así que el partido aparecía dos veces y la
       * localidad real —Gonnet, City Bell, lo que sea— se perdía.
       */
      streetAddress: calle,
      addressLocality: localidad,
      addressRegion: "Buenos Aires",
      addressCountry: "AR",
    },
    areaServed: [
      { "@type": "City", name: "La Plata" },
      { "@type": "City", name: "Berisso" },
      { "@type": "City", name: "Ensenada" },
      { "@type": "Country", name: "Argentina" },
    ],
    openingHours: settings.hours,
    sameAs: [settings.instagram, settings.tiktok].filter(Boolean),
    // Cada rubro del catálogo, para que el negocio aparezca buscando el
    // producto y no solo el nombre del local.
    makesOffer: [
      "iPhone",
      "iPad",
      "MacBook",
      "Apple Watch",
      "AirPods",
      "Celulares Xiaomi y Motorola",
      "Consolas",
      "Plan Canje",
      "Reparación de celulares",
    ].map((nombre) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Product", name: nombre },
    })),
  };

  // Migas de pan del sitio: Google las usa para mostrar la ruta en el
  // resultado en vez de la URL cruda.
  const jsonLdSitio = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "iPhone Purple",
    url: SITE_URL,
    inLanguage: "es-AR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/catalogo?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSitio) }}
      />
      <AvisoCatalogoDemo />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
