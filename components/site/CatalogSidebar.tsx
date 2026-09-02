"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { CatalogFacets } from "@/lib/data";
import {
  AUTHENTICITY_LABELS,
  CATEGORY_LABELS,
  GRADE_LABELS,
  GRADE_SPECS,
  STATE_LABELS,
  type CatalogFilters,
  type Category,
  type Grade,
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

  /**
   * Secciones abiertas. Arrancan abiertas las que todavía no tienen elección:
   * si ya filtraste por marca, esa sección no necesita seguir ocupando lugar.
   */
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const isOpen = (key: string, hasValue: boolean) =>
    closed[key] === undefined ? !hasValue : !closed[key];
  const toggleSection = (key: string, hasValue: boolean) =>
    setClosed((c) => ({ ...c, [key]: c[key] === undefined ? hasValue : !c[key] }));

  /** Al elegir una opción la sección se cierra; al desmarcar, se queda abierta. */
  const afterPick = (key: string, selecting: boolean) =>
    setClosed((c) => ({ ...c, [key]: selecting }));

  function navigate(next: CatalogFilters) {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.brand) params.set("marca", next.brand);
    if (next.category) params.set("category", next.category);
    if (next.model) params.set("model", next.model);
    if (next.state) params.set("estado", next.state);
    if (next.grade) params.set("grade", next.grade);
    if (next.storage) params.set("storage", next.storage);
    if (next.color) params.set("color", next.color);
    if (next.minBattery) params.set("bateria", String(next.minBattery));
    if (next.authenticity === "replica") params.set("tipo", "replica");
    if (next.sort && next.sort !== "relevancia") params.set("sort", next.sort);

    const qs = params.toString();
    // `scroll: false` mantiene la posición: por defecto Next salta al tope
    // en cada navegación, y tocar un filtro te devolvía arriba de todo.
    startTransition(() =>
      router.push(qs ? `/catalogo?${qs}` : "/catalogo", { scroll: false })
    );
  }

  /** Volver a tocar la opción activa la desmarca: sirve de atajo para limpiar. */
  const toggle = (
    key: keyof CatalogFilters,
    value: string | number,
    section = key as string
  ) => {
    const selecting = filters[key] !== value;
    afterPick(section, selecting);
    navigate({ ...filters, [key]: selecting ? value : undefined });
  };

  const esSeminuevo = filters.state === "seminuevo";

  const panel = (
    <div className={cn("space-y-2 transition-opacity", pending && "opacity-60")}>
      {facets.brands.length > 1 && (
        <Section
          title="Marca"
          summary={filters.brand}
          open={isOpen("brand", Boolean(filters.brand))}
          onToggle={() => toggleSection("brand", Boolean(filters.brand))}
        >
          {facets.brands.map((f) => (
            <FilterRow
              key={f.value}
              label={f.value}
              count={f.count}
              checked={filters.brand === f.value}
              onChange={() =>
                // Cambiar de marca invalida todo lo de abajo.
                navigate({
                  ...filters,
                  brand: filters.brand === f.value ? undefined : f.value,
                  category: undefined,
                  model: undefined,
                  generation: undefined,
                  line: undefined,
                })
              }
            />
          ))}
        </Section>
      )}

      {facets.categories.length > 1 && (
        <Section
          title="Categoría"
          summary={filters.category && CATEGORY_LABELS[filters.category]}
          open={isOpen("category", Boolean(filters.category))}
          onToggle={() => toggleSection("category", Boolean(filters.category))}
        >
          {facets.categories.map((f) => (
            <FilterRow
              key={f.value}
              label={CATEGORY_LABELS[f.value as Category]}
              count={f.count}
              checked={filters.category === f.value}
              onChange={() =>
                navigate({
                  ...filters,
                  category:
                    filters.category === f.value ? undefined : (f.value as Category),
                  model: undefined,
                })
              }
            />
          ))}
        </Section>
      )}

      {/* El modelo solo tiene sentido dentro de una categoría: sin ese corte
          la lista mezcla iPhones, iPads y consolas. */}
      {filters.category && facets.models.length > 1 && (
        <Section
          title="Modelo"
          summary={filters.model}
          open={isOpen("model", Boolean(filters.model))}
          onToggle={() => toggleSection("model", Boolean(filters.model))}
        >
          {facets.models.map((f) => (
            <FilterRow
              key={f.value}
              label={f.value}
              count={f.count}
              checked={filters.model === f.value}
              onChange={() => toggle("model", f.value)}
            />
          ))}
        </Section>
      )}

      {facets.states.length > 0 && (
        <Section
          title="Condición"
          summary={filters.state && STATE_LABELS[filters.state]}
          open={isOpen("state", Boolean(filters.state))}
          onToggle={() => toggleSection("state", Boolean(filters.state))}
        >
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
        <Section
          title="Grado"
          summary={filters.grade && GRADE_LABELS[filters.grade]}
          open={isOpen("grade", Boolean(filters.grade))}
          onToggle={() => toggleSection("grade", Boolean(filters.grade))}
        >
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
        <Section
          title="Batería"
          summary={filters.minBattery ? `${filters.minBattery}% o más` : undefined}
          open={isOpen("battery", Boolean(filters.minBattery))}
          onToggle={() => toggleSection("battery", Boolean(filters.minBattery))}
        >
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

      {/*
        El almacenamiento aparece recién con un modelo elegido.

        Sin modelo, la lista mezcla capacidades de cosas que no se comparan
        entre sí: alguien pedía 64 GB buscando un iPhone y le aparecía la
        Nintendo Switch, que también tiene 64 GB. La capacidad solo significa
        algo dentro de un modelo concreto.
      */}
      {Boolean(filters.model) && facets.storages.length > 1 && (
        <Section
          title="Almacenamiento"
          summary={filters.storage}
          open={isOpen("storage", Boolean(filters.storage))}
          onToggle={() => toggleSection("storage", Boolean(filters.storage))}
        >
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
        <Section
          title="Color"
          summary={filters.color}
          open={isOpen("color", Boolean(filters.color))}
          onToggle={() => toggleSection("color", Boolean(filters.color))}
        >
          {/* Los colores se eligen mirando, no leyendo: la muestra manda y el
              nombre queda como apoyo. */}
          <li className="flex flex-wrap gap-2 px-1.5 py-1">
            {facets.colors.map((f) => {
              const activo = filters.color === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  title={`${f.value} (${f.count})`}
                  aria-label={`${f.value}, ${f.count} equipos`}
                  aria-pressed={activo}
                  onClick={() => toggle("color", f.value)}
                  className={cn(
                    "relative size-9 rounded-full border transition-all duration-200",
                    "hover:scale-110",
                    activo
                      ? "border-purple ring-purple/30 ring-2"
                      : "border-black/15 hover:border-black/35"
                  )}
                  style={{ background: f.hex ?? "#cccccc" }}
                >
                  {activo && (
                    <Check
                      className="absolute inset-0 m-auto size-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                      style={{ color: esClaro(f.hex) ? "#16161a" : "#ffffff" }}
                    />
                  )}
                </button>
              );
            })}
          </li>
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

/**
 * Bloque plegable del panel.
 *
 * El estado de apertura lo maneja el padre: al elegir una opción, la sección
 * se cierra sola y muestra lo elegido en el encabezado. Así el panel no crece
 * indefinidamente a medida que se filtra y siempre se ve qué está aplicado.
 */
function Section({
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string;
  /** Lo elegido, que se muestra cuando la sección está cerrada. */
  summary?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-3 text-left text-[15px] font-medium transition-colors",
          summary && !open
            ? "bg-purple/10 text-foreground"
            : "bg-elevated text-foreground hover:bg-line/60"
        )}
      >
        <span className="min-w-0">
          {title}
          {summary && !open && (
            <span className="text-purple mt-0.5 block truncate text-xs font-normal">
              {summary}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "text-muted-foreground size-4 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* La lista se despliega con una transición de altura, no de golpe. */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <ul className="mt-1.5 mb-1 space-y-0.5 overflow-hidden px-1">{children}</ul>
      </div>
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
            ? "border-purple/40 text-foreground border bg-white font-medium"
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

/**
 * Si un color es claro, para saber de qué color va el tilde encima.
 * Luminancia percibida: el ojo pesa mucho más el verde que el azul.
 */
function esClaro(hex?: string): boolean {
  if (!hex) return true;
  const m = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
