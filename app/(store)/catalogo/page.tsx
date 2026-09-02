import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CatalogSidebar } from "@/components/site/CatalogSidebar";
import { CatalogToolbar } from "@/components/site/CatalogToolbar";
import { PageHero, PAGE_PHOTOS } from "@/components/site/PageHero";
import { ProductCard } from "@/components/site/ProductCard";
import { getCatalogFacets, getProducts } from "@/lib/data";
import { CONDITIONS, type CatalogFilters, type Condition } from "@/types";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Todos los equipos Apple disponibles hoy, con precio, estado y stock real. Buscá por modelo, capacidad o estado.",
};

type SearchParams = Record<string, string | string[] | undefined>;

/** Un `searchParams` puede traer arrays si el parámetro viene repetido en la URL. */
function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.trim() ? v.trim() : undefined;
}

function parseFilters(params: SearchParams): CatalogFilters {
  const condition = first(params.condition);
  const sort = first(params.sort);

  return {
    q: first(params.q),
    model: first(params.model),
    storage: first(params.storage),
    // Solo aceptamos valores conocidos: una URL manipulada no debe romper el filtro.
    condition: CONDITIONS.includes(condition as Condition)
      ? (condition as Condition)
      : undefined,
    sort: (["precio-asc", "precio-desc", "nuevo"] as const).includes(
      sort as "precio-asc" | "precio-desc" | "nuevo"
    )
      ? (sort as CatalogFilters["sort"])
      : "relevancia",
    inStockOnly: first(params.stock) === "1",
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);

  const [products, facets, all] = await Promise.all([
    getProducts(filters),
    getCatalogFacets(filters),
    getProducts(),
  ]);

  return (
    <>
      <PageHero
        title="Catálogo"
        subtitle="Todo lo que tenemos hoy. Los precios y el stock se actualizan a medida que entran y salen equipos."
        image={PAGE_PHOTOS.catalogo}
      />

      <div className="shell py-8 sm:py-12">
        <nav
          aria-label="Migas de pan"
          className="text-muted-foreground flex items-center gap-1.5 text-sm"
        >
          <Link href="/" className="hover:text-foreground transition-colors">
            Inicio
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground">Catálogo</span>
        </nav>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CatalogSidebar filters={filters} facets={facets} />
          </div>

          <div className="min-w-0">
            <CatalogToolbar
              filters={filters}
              resultCount={products.length}
              totalCount={all.length}
            />

            {products.length > 0 ? (
              <div className="mt-8 grid grid-cols-2 gap-5 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} filters={filters} />
                ))}
              </div>
            ) : (
              <div className="border-line mt-10 rounded-2xl border border-dashed py-20 text-center">
                <p className="text-foreground font-medium">
                  No encontramos equipos con esos filtros
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Probá con menos filtros, o escribinos y te avisamos cuando entre lo que
                  buscás.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/catalogo"
                    className="bg-purple hover:bg-purple/85 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium text-white transition-colors"
                  >
                    Ver todo el catálogo
                  </Link>
                  <Link
                    href="/contacto"
                    className="border-line text-foreground inline-flex h-11 items-center justify-center rounded-full border px-6 text-sm font-medium transition-colors hover:border-white/40"
                  >
                    Pedir un equipo
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
