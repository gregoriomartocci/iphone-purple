import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { getProducts, getSettings, isSupabaseConfigured } from "@/lib/data";

export const metadata: Metadata = { title: "Productos" };

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);

  return (
    <div className="max-w-6xl">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-muted-foreground mt-1.5">
            Editá precio y stock directo en la tabla. El resto se carga desde el
            importador.
          </p>
        </div>
        <Link
          href="/admin/importar"
          className="bg-ink hover:bg-ink/85 inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-medium text-white transition-colors"
        >
          Importar lista
          <ArrowRight className="size-3.5" />
        </Link>
      </header>

      <ProductsTable
        products={products}
        dollarRate={settings.dollarRate}
        supabaseReady={isSupabaseConfigured()}
      />
    </div>
  );
}
