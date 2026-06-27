import { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { BenefitsStrip } from "@/components/landing/BenefitsStrip";
import { BestsellersSection } from "@/components/landing/BestsellersSection";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { TradeInSection } from "@/components/landing/TradeInSection";
import { ReviewsSection } from "@/components/landing/ReviewsSection";
import { NewsletterSection } from "@/components/landing/NewsletterSection";

export const metadata: Metadata = {
  title: "iPhone Purple — Tu tienda premium de celulares en Argentina",
  description:
    "Comprá iPhone, Samsung y accesorios con garantía oficial. Envío express 24hs, hasta 18 cuotas sin interés y Plan Canje de tu equipo usado.",
};

export const revalidate = 3600;

async function getFeaturedProducts() {
  // When Supabase is connected, replace with real query:
  // const supabase = await createClient()
  // const { data } = await supabase.from('products')
  //   .select('*, variants:product_variants(*), images:product_images(*), brand:brands(name,slug)')
  //   .eq('status', 'active').eq('is_featured', true).limit(8)
  // return data ?? []
  return [];
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <>
      <HeroSection />
      <BenefitsStrip />
      <BestsellersSection products={products} />
      <CategoriesSection />
      <TradeInSection />
      <ReviewsSection />
      <NewsletterSection />
    </>
  );
}
