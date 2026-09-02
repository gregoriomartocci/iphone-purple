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
  LINE_LABELS,
  STATE_LABELS,
  type CatalogFilters,
  type Category,
  type Grade,
  type Line,
  type State,
} from "@/types";
import { cn } from "@/lib/utils";

/**
 * Panel de filtros del catálogo.
 *
 * El estado vive en la URL, no acá: un filtro se puede compartir, guardar en
 * favoritos y sobrevive al refresh. Los valores actuales llegan por props desde
 * el server component, que ya leyó los `searchParams`.
 *
 * Los ejes van de lo general a lo específico, y los que solo tienen sentido
 * dentro de otro aparecen recién cuando corresponde: la condición A+/A/A− se
 * despliega al elegir "Seminuevo", no antes.
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
    if (next.generation) params.set("gen", String(next.generation));
    if (next.line) params.set("linea", next.line);
    if (next.model) params.set("model", next.model);
    if (next.state) params.set("estado", next.state);
    if (next.grade) params.set("grade", next.grade);
    if (next.storage) params.set("storage", next.storage);
    if (next.color) params.set("color", next.color);
    if (next.minBattery) params.set("bateria", String(next.minBattery));
    if (next.authenticity === "replica") params.set("tipo", "replica");
    if (next.sort && next.sort !== "relevancia") params.set("sort", next.sort);

    const qs = params.toString();
    startTransition(() => router.push(qs ? `/catalogo?${qs}` : "/catalogo"));
  }

  /** Volver a tocar la opción activa la desmarca: sirve de atajo para limpiar. */
  const toggle = (key: keyof CatalogFilters, value: string | number) =>
    navigate({ ...filters, [key]: filters[key] === value ? undefined : value });

  const esSeminuevo = filters.state === "seminuevo";

  const panel = (
    <div className={cn("space-y-2 transition-opacity", pending && "opacity-60")}>
      {facets.categories.length > 1 && (
        <Section title="Categoría" defaultOpen>
          {facets.categories.map((f) => (
            <FilterRow
              key={f.value}
              label={CATEGORY_LABELS[f.value as Category]}
              count={f.count}
              checked={filters.category === f.value}
              onChange={() => toggle("category", f.value)}
            />
          ))}
        </Section>
      )}

      {facets.generations.length > 1 && (
        <Section title="Generación" defaultOpen>
          {facets.generations.map((f) => (
            <FilterRow
              key={f.value}
              label={f.value}
              count={f.count}
              checked={filters.generation === Number(f.value)}
              onChange={() => toggle("generation", Number(f.value))}
            />
          ))}
        </Section>
      )}

      {facets.lines.length > 1 && (
        <Section title="Línea" defaultOpen>
          {facets.lines.map((f) => (
            <FilterRow
              key={f.value}
              label={LINE_LABELS[f.value as Line]}
              count={f.count}
              checked={filters.line === f.value}
              onChange={() => toggle("line", f.value)}
            />
          ))}
        </Section>
      )}

      {facets.states.length > 0 && (
        <Section title="Estado" defaultOpen>
          {facets.states.map((f) => (
            <FilterRow
              key={f.value}
              label={STATE_LABELS[f.value as State]}
              count={f.count}
              checked={filters.state === f.value}
              onChange={() =>
                // Cambiar de estado limpia la condición: A+ no aplica a un sellado.
                navigate({
                  ...filters,
                  state: filters.state === f.value ? undefined : (f.value as State),
                  grade: undefined,
                  minBattery: undefined,
                })
              }
            />
          ))}
        </Section>
      )}

      {/* La condición y la batería solo existen dentro de "seminuevo". */}
      {esSeminuevo && facets.grades.length > 0 && (
        <Section title="Condición" defaultOpen>
          {facets.grades.map((f) => (
            <FilterRow
              key={f.value}
              label={GRADE_LABELS[f.value as Grade]}
              hint={`${GRADE_SPECS[f.value as Grade].cosmetic} ${
                GRADE_SPECS[f.value as Grade].battery
              }`}
              count={f.count}
              checked={filters.grade === f.value}
              onChange={() => toggle("grade", f.value)}
            />
          ))}
        </Section>
      )}

      {esSeminuevo && facets.batteryTiers.length > 0 && (
        <Section title="Batería" defaultOpen>
          {facets.batteryTiers.map((f) => (
            <FilterRow
              key={f.value}
              label={`${f.value}% o más`}
              count={f.count}
              checked={filters.minBattery === Number(f.value)}
              onChange={() => toggle("minBattery", Number(f.value))}
            />
          ))}
        </Section>
      )}

      {facets.storages.length > 1 && (
        <Section title="Almacenamiento" defaultOpen>
          {facets.storages.map((f) => (
            <FilterRow
              key={f.value}
              label={f.value}
              count={f.count}
              checked={filters.storage === f.value}
              onChange={() => toggle("storage", f.value)}
            />
          ))}
        </Section>
      )}

      {facets.colors.length > 1 && (
        <Section title="Color">
          {facets.colors.map((f) => (
            <FilterRow
              key={f.value}
              label={f.value}
              count={f.count}
              checked={filters.color === f.value}
              onChange={() => toggle("color", f.value)}
            />
          ))}
        </Section>
      )}

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
                category: undefined,
                generation: undefined,
                line: undefined,
                model: undefined,
              })
            }
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors",
              filters.authenticity === "replica"
                ? "bg-amber-500 text-white"
                : "bg-elevated text-foreground hover:bg-amber-500/10"
            )}
          >
            {filters.authenticity === "replica"
              ? "Volver a originales"
              : `Ver ${AUTHENTICITY_LABELS.replica.toLowerCase()}s`}
            {filters.authenticity !== "replica" && (
              <span className="tnum text-xs opacity-70">{facets.replicaCount}</span>
            )}
          </button>
          <p className="text-muted-foreground mt-2 px-1 text-xs leading-relaxed">
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
        className="border-line bg-surface text-foreground inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border text-[15px] font-medium shadow-sm md:hidden"
      >
        <SlidersHorizontal className="size-4" />
        Filtrar
      </button>

      <aside className="border-line bg-surface hidden rounded-2xl border p-5 shadow-sm md:block">
        <h2 className="eyebrow text-muted-foreground mb-4">Filtrar equipos</h2>
        {panel}
      </aside>

      {openOnMobile && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenOnMobile(false)}
          />
          <div className="bg-background absolute inset-y-0 left-0 w-[88%] max-w-sm overflow-y-auto p-5">
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
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="bg-elevated text-foreground flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-3 text-[15px] font-medium"
      >
        {title}
        <ChevronDown
          className={cn(
            "text-muted-foreground size-4 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <ul className="mt-1.5 mb-1 space-y-0.5 px-1">{children}</ul>}
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
    <li>
      <label
        title={hint}
        className={cn(
          "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[15px] transition-colors",
          checked
            ? "bg-purple/8 text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="size-4 shrink-0 accent-[#5e16eb]"
        />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {count !== undefined && (
          <span className="tnum text-muted-foreground shrink-0 text-xs">{count}</span>
        )}
      </label>
    </li>
  );
}
