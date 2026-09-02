import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProductDetail } from "@/components/site/ProductDetail";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductComparison } from "@/components/site/ProductComparison";
import {
  getGenerationComparison,
  getProduct,
  getProducts,
  getRelatedProducts,
  getSettings,
} from "@/lib/data";
import { leadVariant, totalStock } from "@/lib/catalog";

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
  const description =
    product.description ||
    `${product.name} ${lead?.storage ?? ""} disponible con garantía en iPhone Purple.`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: lead?.priceArs ?? 0,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="shell py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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

      <ProductComparison products={comparison} currentId={product.id} />

      {related.length > 0 && (
        <section className="border-line mt-24 border-t pt-12">
          <h2 className="text-2xl font-semibold">También te puede servir</h2>
          <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
