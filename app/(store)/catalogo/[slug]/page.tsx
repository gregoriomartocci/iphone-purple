import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProductDetail } from "@/components/site/ProductDetail";
import { ProductComparison } from "@/components/site/ProductComparison";
import { ProductRail } from "@/components/site/ProductRail";
import { Descripcion } from "@/components/site/Descripcion";
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
    // El carrusel muestra cuatro por vez, así que con ocho hay para deslizar.
    getRelatedProducts(product, 8),
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
    // Solo imágenes: desde que la galería admite un video al final, la lista
    // trae también un .mp4, y schema.org espera fotos acá. Un video que el
    // buscador no puede mostrar invalida el dato entero.
    image: product.images.filter((i) => !/\.(mp4|webm)$/i.test(i.url)).map((i) => i.url),
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
        <ProductDetail
          product={product}
          whatsappNumber={settings.whatsappNumber}
          dollarRate={settings.dollarRate}
          dollarRateUpdatedAt={settings.dollarRateUpdatedAt}
        />
      </div>

      {/* El orden sigue cómo se decide una compra: primero qué es y qué trae
          este modelo, después el detalle técnico, luego cómo se compara contra
          los vecinos, con qué respaldo se compra, las dudas de cerrar la
          operación, y al final qué otra cosa mirar. */}
      <Descripcion product={product} />

      <FichaTecnica product={product} variante={lead} />

      <ProductComparison products={comparison} currentId={product.id} />

      <Respaldos />

      <FaqProducto product={product} esSellado={lead?.grade === "sellado"} />

      {/* Mismo carrusel que la portada: avanza solo y se frena al tocarlo. */}
      <div className="border-line mt-16 border-t sm:mt-20">
        <ProductRail
          title="También te puede interesar"
          products={related}
          href={`/catalogo?category=${product.category}`}
          auto
        />
      </div>
    </div>
  );
}
