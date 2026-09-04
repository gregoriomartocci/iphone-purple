"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { SelectorMoneda } from "./SelectorMoneda";
import {
  CATEGORY_LABELS,
  GRADE_LABELS,
  LINE_LABELS,
  STATE_LABELS,
  type CatalogFilters,
  type Category,
  type Grade,
  type Line,
  type State,
} from "@/types";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "relevancia", label: "Más relevantes" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
  { value: "nuevo", label: "Ingresos recientes" },
] as const;

/**
 * Búsqueda, orden y filtros aplicados.
 *
 * Los chips de lo aplicado son lo que evita el "¿por qué veo tan pocos
 * resultados?": siempre se ve qué está activo y se saca de a uno.
 */
export function CatalogToolbar({
  filters,
  resultCount,
  totalCount,
}: {
  filters: CatalogFilters;
  resultCount: number;
  totalCount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(filters.q ?? "");

  /**
   * Busca mientras se escribe, sin apretar Enter.
   *
   * Espera un cuarto de segundo desde la última tecla: sin esa espera, cada
   * letra dispararía una navegación y escribir "iphone" haría seis. Con ella
   * alcanza con dejar de tipear.
   *
   * No corre en el primer render ni cuando el texto ya coincide con la URL,
   * para no volver a navegar al mismo lugar al entrar o al usar el historial.
   */
  useEffect(() => {
    const actual = filters.q ?? "";
    if (query.trim() === actual) return;
    const id = window.setTimeout(() => {
      navigate({ ...filters, q: query.trim() || undefined });
    }, 250);
    return () => window.clearTimeout(id);
    // `navigate` se recrea en cada render; incluirlo reiniciaría el temporizador.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters.q]);

  function navigate(next: CatalogFilters) {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.brand) params.set("marca", next.brand);
    if (next.category) params.set("category", next.category);
    if (next.generation) params.set("gen", String(next.generation));
    if (next.line) params.set("linea", next.line);
    if (next.state) params.set("estado", next.state);
    if (next.color) params.set("color", next.color);
    if (next.model) params.set("model", next.model);
    if (next.storage) params.set("storage", next.storage);
    if (next.grade) params.set("grade", next.grade);
    if (next.authenticity === "replica") params.set("tipo", "replica");
    if (next.minBattery) params.set("bateria", String(next.minBattery));
    if (next.sort && next.sort !== "relevancia") params.set("sort", next.sort);

    const qs = params.toString();
    // `scroll: false` mantiene la posición: por defecto Next salta al tope
    // en cada navegación, y tocar un filtro te devolvía arriba de todo.
    startTransition(() =>
      router.push(qs ? `/catalogo?${qs}` : "/catalogo", { scroll: false })
    );
  }

  const chips = [
    filters.q && { label: `"${filters.q}"`, clear: { q: undefined } },
    filters.brand && { label: filters.brand, clear: { brand: undefined } },
    filters.category && {
      label: CATEGORY_LABELS[filters.category as Category],
      clear: { category: undefined },
    },
    filters.model && { label: filters.model, clear: { model: undefined } },
    filters.minBattery && {
      label: `Batería ${filters.minBattery}%+`,
      clear: { minBattery: undefined },
    },
    filters.generation && {
      label: `Generación ${filters.generation}`,
      clear: { generation: undefined },
    },
    filters.line && {
      label: LINE_LABELS[filters.line as Line],
      clear: { line: undefined },
    },
    filters.state && {
      label: STATE_LABELS[filters.state as State],
      clear: { state: undefined, grade: undefined, minBattery: undefined },
    },
    filters.grade && {
      label: GRADE_LABELS[filters.grade as Grade],
      clear: { grade: undefined },
    },
    filters.color && { label: filters.color, clear: { color: undefined } },
    filters.storage && { label: filters.storage, clear: { storage: undefined } },
  ].filter(Boolean) as { label: string; clear: Partial<CatalogFilters> }[];

  return (
    <div className={cn("transition-opacity", pending && "opacity-60")}>
      {/* El formulario queda para quien apriete Enter o busque sin JavaScript;
          con JavaScript la búsqueda ya salió sola al dejar de escribir. */}
      <form
        action="/catalogo"
        method="get"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ ...filters, q: query.trim() || undefined });
        }}
        className="relative"
      >
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" />
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar: iPhone 15, 256GB, sellado…"
          aria-label="Buscar en el catálogo"
          className="border-line bg-surface text-foreground placeholder:text-muted-foreground focus-visible:border-ink h-14 w-full rounded-2xl border pr-4 pl-12 text-base shadow-sm transition-colors outline-none"
        />
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground text-[15px]">
          Mostrando <span className="text-foreground font-semibold">{resultCount}</span>{" "}
          de {totalCount} equipos
        </p>

        <div className="flex items-center gap-3">
          {/* La moneda al lado del orden: las dos son maneras de mirar la misma
              lista, y las dos se quedan como quedaron. */}
          <SelectorMoneda />

          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Ordenar por</span>
            <select
              value={filters.sort ?? "relevancia"}
              onChange={(e) =>
                navigate({ ...filters, sort: e.target.value as CatalogFilters["sort"] })
              }
              className="border-line bg-surface text-foreground focus-visible:border-ink h-11 rounded-xl border px-3.5 text-[15px] shadow-sm transition-colors outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs">Filtros aplicados</span>
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                if ("q" in chip.clear) setQuery("");
                navigate({ ...filters, ...chip.clear });
              }}
              className="border-line bg-surface text-foreground hover:border-ink inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm shadow-sm transition-colors"
            >
              {chip.label}
              <X className="size-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setQuery("");
              startTransition(() => router.push("/catalogo", { scroll: false }));
            }}
            className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2"
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  );
}
