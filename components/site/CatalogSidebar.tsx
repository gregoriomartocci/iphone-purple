"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { CatalogFacets } from "@/lib/data";
import {
  AUTHENTICITY_LABELS,
  CATEGORY_LABELS,
  GRADE_LABELS,
  GRADE_SPECS,
  type CatalogFilters,
  type Category,
  type Grade,
} from "@/types";
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
    if (next.category) params.set("category", next.category);
    if (next.model) params.set("model", next.model);
    if (next.storage) params.set("storage", next.storage);
    if (next.grade) params.set("grade", next.grade);
    if (next.authenticity === "replica") params.set("tipo", "replica");
    if (next.minBattery) params.set("bateria", String(next.minBattery));
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
      <Section title="Categoría" defaultOpen>
        <ul className="space-y-0.5">
          {facets.categories.map((facet) => (
            <FilterRow
              key={facet.value}
              label={CATEGORY_LABELS[facet.value as Category]}
              count={facet.count}
              checked={filters.category === facet.value}
              onChange={() => toggle("category", facet.value)}
            />
          ))}
        </ul>
      </Section>

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
          {facets.grades.map((facet) => (
            <FilterRow
              key={facet.value}
              label={GRADE_LABELS[facet.value as Grade]}
              hint={`${GRADE_SPECS[facet.value as Grade].cosmetic} ${
                GRADE_SPECS[facet.value as Grade].battery
              }`}
              count={facet.count}
              checked={filters.grade === facet.value}
              onChange={() => toggle("grade", facet.value)}
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

      {facets.batteryTiers.length > 0 && (
        <Section title="Batería">
          <ul className="space-y-0.5">
            {facets.batteryTiers.map((facet) => (
              <FilterRow
                key={facet.value}
                label={`${facet.value}% o más`}
                count={facet.count}
                checked={filters.minBattery === Number(facet.value)}
                onChange={() =>
                  navigate({
                    ...filters,
                    minBattery:
                      filters.minBattery === Number(facet.value)
                        ? undefined
                        : Number(facet.value),
                  })
                }
              />
            ))}
          </ul>
        </Section>
      )}

      <Section title="Disponibilidad" defaultOpen>
        <FilterRow
          label="Solo con stock"
          checked={filters.inStockOnly ?? false}
          onChange={() =>
            navigate({ ...filters, inStockOnly: filters.inStockOnly ? undefined : true })
          }
        />
      </Section>

      {/* Las réplicas viven aparte y se entra a propósito: no son una opción
          más dentro de la lista de originales. */}
      {(facets.replicaCount > 0 || filters.authenticity === "replica") && (
        <div className="border-line mt-4 border-t pt-4">
          <button
            type="button"
            onClick={() =>
              navigate({
                ...filters,
                authenticity: filters.authenticity === "replica" ? undefined : "replica",
                model: undefined,
              })
            }
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
              filters.authenticity === "replica"
                ? "bg-amber-500 font-medium text-white"
                : "bg-elevated text-foreground hover:bg-amber-500/10"
            )}
          >
            {filters.authenticity === "replica"
              ? "Volver a originales"
              : `Ver ${AUTHENTICITY_LABELS.replica.toLowerCase()}s`}
            <span className="tnum text-xs opacity-70">
              {filters.authenticity === "replica" ? "" : facets.replicaCount}
            </span>
          </button>
          <p className="text-muted-foreground mt-2 px-3 text-xs leading-relaxed">
            Las réplicas no son productos originales de marca. Se listan aparte.
          </p>
        </div>
      )}
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
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="bg-elevated text-foreground flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium"
      >
        {title}
        <ChevronDown
          className={cn(
            "text-muted-foreground size-4 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="mt-2 px-1">{children}</div>}
    </div>
  );
}

/** Una opción con su casilla y la cantidad de resultados. */
function FilterRow({
  label,
  hint,
  count,
  checked,
  onChange,
}: {
  label: string;
  /** Qué significa la opción. Se muestra al pasar el mouse. */
  hint?: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <li className="list-none">
      <label
        title={hint}
        className={cn(
          "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
          checked
            ? "bg-purple/8 text-foreground font-medium"
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
