import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProductDetail } from "@/components/site/ProductDetail";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductComparison } from "@/components/site/ProductComparison";
import { FichaTecnica, Respaldos } from "@/components/site/FichaTecnica";
import { FaqProducto } from "@/components/site/FaqProducto";
import {
  getGenerationComparison,
  getProduct,
  getProducts,
  getRelatedProducts,
  getSettings,
} from "@/lib/data";
import { leadVariant, totalStock } from "@/lib/catalog";
import { CATEGORY_LABELS, GRADE_LABELS } from "@/types";

export const revalidate = 600;

/** Prerrenderiza las fichas conocidas; las nuevas se generan a demanda. */
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Equipo no encontrado" };

  const lead = leadVariant(product);
  // El título de la ficha es lo que compite en el buscador contra el mismo
  // modelo en otros comercios: lleva capacidad, condición y ciudad, que es
  // como la gente busca de verdad ("iphone 15 128gb la plata").
  const detalle = [lead?.storage, lead && GRADE_LABELS[lead.grade]]
    .filter(Boolean)
    .join(" ");
  const title = `${product.name}${detalle ? ` ${detalle}` : ""} en La Plata`;
  const description =
    `${product.name}${detalle ? ` ${detalle}` : ""} con garantía escrita y factura, en La Plata. ` +
    (product.description || "Consultá stock y precio por WhatsApp.");

  return {
    title,
    description,
    alternates: { canonical: `/catalogo/${slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [settings, related, comparison] = await Promise.all([
    getSettings(),
    getRelatedProducts(product, 4),
    getGenerationComparison(product),
  ]);

  const lead = leadVariant(product);
  const inStock = totalStock(product) > 0;

  const precios = product.variants.map((v) => v.priceArs).filter((p) => p > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    category: CATEGORY_LABELS[product.category],
    image: product.images.map((i) => i.url),
    // Cada variante es una oferta distinta: con el rango, el buscador puede
    // mostrar "desde $X" en vez de un precio suelto que puede no ser el que
    // la persona termina viendo.
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "ARS",
      lowPrice: precios.length ? Math.min(...precios) : 0,
      highPrice: precios.length ? Math.max(...precios) : 0,
      offerCount: product.variants.length,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition:
        lead?.grade === "sellado"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/RefurbishedCondition",
      seller: { "@type": "Organization", name: "iPhone Purple" },
    },
  };

  // Migas de pan: Google las muestra en lugar de la URL cruda.
  const jsonLdMigas = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: "/" },
      { "@type": "ListItem", position: 2, name: "Catálogo", item: "/catalogo" },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `/catalogo/${product.slug}`,
      },
    ],
  };

  return (
    <div className="shell py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMigas) }}
      />

      <Link
        href="/catalogo"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
      >
        <ChevronLeft className="size-4" />
        Volver al catálogo
      </Link>

      <div className="mt-8">
        <ProductDetail product={product} whatsappNumber={settings.whatsappNumber} />
      </div>

      {/* El orden de abajo sigue el de las preguntas de quien está mirando:
          primero qué trae el equipo, después con qué respaldo lo compra, luego
          cómo se compara con los modelos vecinos, y al final las dudas de
          cerrar la operación. */}
      <FichaTecnica product={product} variante={lead} />

      <Respaldos />

      <ProductComparison products={comparison} currentId={product.id} />

      <FaqProducto product={product} esSellado={lead?.grade === "sellado"} />

      {related.length > 0 && (
        <section className="border-line mt-16 border-t pt-12 sm:mt-20">
          <h2 className="text-2xl font-semibold">También te puede servir</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
