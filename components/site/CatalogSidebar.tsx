"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { CatalogFacets } from "@/lib/data";
import { CONDITION_LABELS, type CatalogFilters, type Condition } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Panel de filtros del catálogo.
 *
 * El estado vive en la URL, no acá: un filtro se puede compartir, guardar en
 * favoritos y sobrevive al refresh. Los valores actuales llegan por props desde
 * el server component, que ya leyó los `searchParams`.
 */
export function CatalogSidebar({
  filters,
  facets,
}: {
  filters: CatalogFilters;
  facets: CatalogFacets;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [openOnMobile, setOpenOnMobile] = useState(false);

  function navigate(next: CatalogFilters) {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.model) params.set("model", next.model);
    if (next.storage) params.set("storage", next.storage);
    if (next.condition) params.set("condition", next.condition);
    if (next.sort && next.sort !== "relevancia") params.set("sort", next.sort);
    if (next.inStockOnly) params.set("stock", "1");

    const qs = params.toString();
    startTransition(() => router.push(qs ? `/catalogo?${qs}` : "/catalogo"));
  }

  /** Volver a tocar la opción activa la desmarca: sirve de atajo para limpiar. */
  const toggle = (key: keyof CatalogFilters, value: string) =>
    navigate({ ...filters, [key]: filters[key] === value ? undefined : value });

  const panel = (
    <div className={cn("space-y-1 transition-opacity", pending && "opacity-60")}>
      <Section title="Modelo" defaultOpen>
        <ul className="space-y-0.5">
          {facets.models.map((facet) => (
            <FilterRow
              key={facet.value}
              label={facet.value}
              count={facet.count}
              checked={filters.model === facet.value}
              onChange={() => toggle("model", facet.value)}
            />
          ))}
        </ul>
      </Section>

      <Section title="Estado" defaultOpen>
        <ul className="space-y-0.5">
          {facets.conditions.map((facet) => (
            <FilterRow
              key={facet.value}
              label={CONDITION_LABELS[facet.value as Condition]}
              count={facet.count}
              checked={filters.condition === facet.value}
              onChange={() => toggle("condition", facet.value)}
            />
          ))}
        </ul>
      </Section>

      <Section title="Capacidad" defaultOpen>
        <ul className="space-y-0.5">
          {facets.storages.map((facet) => (
            <FilterRow
              key={facet.value}
              label={facet.value}
              count={facet.count}
              checked={filters.storage === facet.value}
              onChange={() => toggle("storage", facet.value)}
            />
          ))}
        </ul>
      </Section>

      <Section title="Disponibilidad" defaultOpen>
        <FilterRow
          label="Solo con stock"
          checked={filters.inStockOnly ?? false}
          onChange={() =>
            navigate({ ...filters, inStockOnly: filters.inStockOnly ? undefined : true })
          }
        />
      </Section>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenOnMobile(true)}
        className="border-line bg-surface text-foreground inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium md:hidden"
      >
        <SlidersHorizontal className="size-4" />
        Filtrar
      </button>

      <aside className="border-line bg-surface hidden rounded-2xl border p-5 md:block">
        <h2 className="eyebrow text-muted-foreground mb-4">Filtrar equipos</h2>
        {panel}
      </aside>

      {openOnMobile && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpenOnMobile(false)}
          />
          <div className="bg-background absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="eyebrow text-muted-foreground">Filtrar equipos</h2>
              <button
                type="button"
                onClick={() => setOpenOnMobile(false)}
                aria-label="Cerrar filtros"
                className="text-muted-foreground hover:text-foreground rounded-lg p-2"
              >
                <X className="size-5" />
              </button>
            </div>
            {panel}
          </div>
        </div>
      )}
    </>
  );
}

/** Bloque plegable del panel. */
function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-line border-b py-3 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-foreground flex w-full items-center justify-between gap-2 text-sm font-medium"
      >
        {title}
        <ChevronDown
          className={cn(
            "text-muted-foreground size-4 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

/** Una opción con su casilla y la cantidad de resultados. */
function FilterRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <li className="list-none">
      <label
        className={cn(
          "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
          checked
            ? "text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="accent-purple size-4 shrink-0 accent-[#5e16eb]"
        />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {count !== undefined && (
          <span className="tnum text-muted-foreground shrink-0 text-xs">{count}</span>
        )}
      </label>
    </li>
  );
}
