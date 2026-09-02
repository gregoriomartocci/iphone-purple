import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, SearchX } from "lucide-react";
import { CatalogSidebar } from "@/components/site/CatalogSidebar";
import { CatalogToolbar } from "@/components/site/CatalogToolbar";
import { PageHero, PAGE_PHOTOS } from "@/components/site/PageHero";
import { ProductCard } from "@/components/site/ProductCard";
import { getCatalogFacets, getProducts } from "@/lib/data";
import {
  BATTERY_TIERS,
  CATEGORIES,
  GRADES,
  LINES,
  STATES,
  type CatalogFilters,
  type Category,
  type Grade,
  type Line,
  type State,
} from "@/types";

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
  const grade = first(params.grade);
  const category = first(params.category);
  const state = first(params.estado);
  const line = first(params.linea);
  const sort = first(params.sort);
  const battery = Number(first(params.bateria));
  const generation = Number(first(params.gen));

  return {
    q: first(params.q),
    brand: first(params.marca),
    model: first(params.model),
    storage: first(params.storage),
    // Solo aceptamos valores conocidos: una URL manipulada no debe romper el filtro.
    category: CATEGORIES.includes(category as Category)
      ? (category as Category)
      : undefined,
    generation: Number.isInteger(generation) && generation > 0 ? generation : undefined,
    line: LINES.includes(line as Line) ? (line as Line) : undefined,
    color: first(params.color),
    state: STATES.includes(state as State) ? (state as State) : undefined,
    grade: GRADES.includes(grade as Grade) ? (grade as Grade) : undefined,
    // Sin este parámetro, la capa de datos sirve solo originales.
    authenticity: first(params.tipo) === "replica" ? "replica" : undefined,
    minBattery: (BATTERY_TIERS as readonly number[]).includes(battery)
      ? battery
      : undefined,
    sort: (["precio-asc", "precio-desc", "nuevo"] as const).includes(
      sort as "precio-asc" | "precio-desc" | "nuevo"
    )
      ? (sort as CatalogFilters["sort"])
      : "relevancia",
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

        <div className="mt-8 grid gap-8 md:grid-cols-[240px_1fr] md:gap-10 lg:grid-cols-[260px_1fr]">
          <div className="md:sticky md:top-24 md:self-start">
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
                {products.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    filters={filters}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="border-line bg-surface mt-8 overflow-hidden rounded-2xl border shadow-sm">
                <div className="bg-elevated flex flex-col items-center px-6 py-14 text-center">
                  <span className="bg-purple/10 text-purple flex size-14 items-center justify-center rounded-2xl">
                    <SearchX className="size-7" />
                  </span>
                  <h2 className="mt-5 text-2xl font-semibold">
                    No encontramos equipos con esos filtros
                  </h2>
                  <p className="text-muted-foreground mt-2 max-w-md leading-relaxed">
                    Puede que se haya vendido lo que buscabas. Probá sacando algún filtro,
                    o decinos qué necesitás y te avisamos apenas entre.
                  </p>
                </div>

                <div className="flex flex-col gap-3 p-6 sm:flex-row sm:justify-center">
                  <Link
                    href="/catalogo"
                    className="bg-purple hover:bg-purple/85 inline-flex h-12 items-center justify-center rounded-full px-7 text-[15px] font-medium text-white transition-colors"
                  >
                    Ver todo el catálogo
                  </Link>
                  <Link
                    href="/contacto"
                    className="border-line text-foreground hover:border-foreground/35 inline-flex h-12 items-center justify-center rounded-full border px-7 text-[15px] font-medium transition-colors"
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
