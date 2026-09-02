"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { CONDITION_LABELS, type CatalogFilters, type Condition } from "@/types";
import { cn } from "@/lib/utils";

type Facets = {
  brands: string[];
  models: string[];
  storages: string[];
  conditions: Condition[];
};

/**
 * Barra de filtros del catálogo.
 *
 * El estado vive en la URL, no en el componente: así un filtro se puede compartir,
 * guardar en favoritos y sobrevive al refresh. Los valores actuales llegan por props
 * desde el server component, que ya leyó los `searchParams`.
 */
export function CatalogFilters({
  filters,
  facets,
  resultCount,
}: {
  filters: CatalogFilters;
  facets: Facets;
  resultCount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(filters.q ?? "");
  const [openOnMobile, setOpenOnMobile] = useState(false);

  function navigate(next: CatalogFilters) {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.brand) params.set("brand", next.brand);
    if (next.model) params.set("model", next.model);
    if (next.storage) params.set("storage", next.storage);
    if (next.condition) params.set("condition", next.condition);
    if (next.sort && next.sort !== "relevancia") params.set("sort", next.sort);
    if (next.inStockOnly) params.set("stock", "1");

    const qs = params.toString();
    startTransition(() => router.push(qs ? `/catalogo?${qs}` : "/catalogo"));
  }

  const set = (patch: Partial<CatalogFilters>) => navigate({ ...filters, ...patch });

  const activeChips = [
    filters.brand && { label: filters.brand, clear: { brand: undefined } },
    filters.model && { label: filters.model, clear: { model: undefined } },
    filters.storage && { label: filters.storage, clear: { storage: undefined } },
    filters.condition && {
      label: CONDITION_LABELS[filters.condition],
      clear: { condition: undefined },
    },
    filters.inStockOnly && { label: "Con stock", clear: { inStockOnly: undefined } },
  ].filter(Boolean) as { label: string; clear: Partial<CatalogFilters> }[];

  const selectClass =
    "h-10 rounded-full border border-line bg-surface px-4 text-sm text-foreground outline-none transition-colors hover:border-white/30 focus-visible:border-purple";

  return (
    <div className={cn("transition-opacity", pending && "opacity-60")}>
      <form
        action="/catalogo"
        method="get"
        onSubmit={(e) => {
          e.preventDefault();
          set({ q: query.trim() || undefined });
        }}
        className="relative"
      >
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar: iPhone 15, 256GB, como nuevo…"
          aria-label="Buscar en el catálogo"
          className="border-line text-foreground placeholder:text-muted-foreground focus-visible:border-purple bg-surface h-12 w-full rounded-full border pr-28 pl-11 text-[15px] transition-colors outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              set({ q: undefined });
            }}
            aria-label="Limpiar búsqueda"
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-24 -translate-y-1/2 rounded-full p-1.5"
          >
            <X className="size-4" />
          </button>
        )}
        <button
          type="submit"
          className="bg-purple hover:bg-purple/85 absolute top-1.5 right-1.5 h-9 rounded-full px-5 text-sm font-medium text-white transition-colors"
        >
          Buscar
        </button>
      </form>

      <button
        type="button"
        onClick={() => setOpenOnMobile((v) => !v)}
        aria-expanded={openOnMobile}
        className="border-line text-foreground mt-3 inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm sm:hidden"
      >
        <SlidersHorizontal className="size-4" />
        Filtros
        {activeChips.length > 0 && (
          <span className="bg-purple rounded-full px-1.5 text-xs text-white">
            {activeChips.length}
          </span>
        )}
      </button>

      <div
        className={cn(
          "mt-3 flex-wrap items-center gap-2",
          openOnMobile ? "flex" : "hidden sm:flex"
        )}
      >
        <select
          value={filters.model ?? ""}
          onChange={(e) => set({ model: e.target.value || undefined })}
          aria-label="Modelo"
          className={selectClass}
        >
          <option value="">Todos los modelos</option>
          {facets.models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={filters.storage ?? ""}
          onChange={(e) => set({ storage: e.target.value || undefined })}
          aria-label="Capacidad"
          className={selectClass}
        >
          <option value="">Capacidad</option>
          {facets.storages.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filters.condition ?? ""}
          onChange={(e) => set({ condition: (e.target.value as Condition) || undefined })}
          aria-label="Estado"
          className={selectClass}
        >
          <option value="">Estado</option>
          {facets.conditions.map((c) => (
            <option key={c} value={c}>
              {CONDITION_LABELS[c]}
            </option>
          ))}
        </select>

        <select
          value={filters.sort ?? "relevancia"}
          onChange={(e) => set({ sort: e.target.value as CatalogFilters["sort"] })}
          aria-label="Ordenar"
          className={selectClass}
        >
          <option value="relevancia">Más relevantes</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
          <option value="nuevo">Ingresos recientes</option>
        </select>

        <label className="border-line text-foreground bg-surface inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm transition-colors hover:border-white/30">
          <input
            type="checkbox"
            checked={filters.inStockOnly ?? false}
            onChange={(e) => set({ inStockOnly: e.target.checked || undefined })}
            className="size-3.5 accent-[#6d1fe0]"
          />
          Solo con stock
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-sm">
          {resultCount === 0
            ? "Sin resultados"
            : `${resultCount} ${resultCount === 1 ? "equipo" : "equipos"}`}
        </span>

        {activeChips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => set(chip.clear)}
            className="bg-surface text-foreground hover:bg-line inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors"
          >
            {chip.label}
            <X className="size-3" />
          </button>
        ))}

        {(activeChips.length > 0 || filters.q) && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              startTransition(() => router.push("/catalogo"));
            }}
            className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2"
          >
            Limpiar todo
          </button>
        )}
      </div>
    </div>
  );
}
