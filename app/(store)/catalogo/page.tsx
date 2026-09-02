import type { Metadata } from "next";
import Link from "next/link";
import { CatalogFilters as FiltersBar } from "@/components/site/CatalogFilters";
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
    brand: first(params.brand),
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

  const [products, facets] = await Promise.all([
    getProducts(filters),
    getCatalogFacets(),
  ]);

  return (
    <div className="shell py-12 sm:py-16">
      <header>
        <h1 className="text-3xl font-semibold sm:text-4xl">Catálogo</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Todo lo que tenemos hoy. Los precios y el stock se actualizan a medida que
          entran y salen equipos.
        </p>
      </header>

      <div className="mt-8">
        <FiltersBar filters={filters} facets={facets} resultCount={products.length} />
      </div>

      {products.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="border-line mt-16 rounded-2xl border border-dashed py-20 text-center">
          <p className="text-ink font-medium">No encontramos equipos con esos filtros</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Probá con menos filtros, o escribinos y te avisamos cuando entre lo que
            buscás.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/catalogo"
              className="bg-ink hover:bg-ink/85 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium text-white transition-colors"
            >
              Ver todo el catálogo
            </Link>
            <Link
              href="/contacto"
              className="border-line text-ink hover:border-ink inline-flex h-11 items-center justify-center rounded-full border px-6 text-sm font-medium transition-colors"
            >
              Pedir un equipo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
