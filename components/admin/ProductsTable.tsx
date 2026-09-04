"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Loader2, Search } from "lucide-react";
import { updateVariantAction } from "@/app/admin/actions";
import { formatARS } from "@/utils/format";
import { GRADE_LABELS, type Product } from "@/types";
import { cn } from "@/lib/utils";

type Draft = { priceArs: number; stock: number };

/**
 * Tabla de stock con edición en línea.
 *
 * Precio y stock son los dos campos que cambian todos los días, así que se editan
 * acá mismo sin abrir un formulario aparte. El resto se toca desde el importador
 * o directamente en la base.
 */
export function ProductsTable({
  products,
  dollarRate,
  supabaseReady,
}: {
  products: Product[];
  dollarRate: number;
  supabaseReady: boolean;
}) {
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [, startSaving] = useTransition();

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products
      .flatMap((product) => product.variants.map((variant) => ({ product, variant })))
      .filter(({ product, variant }) =>
        term
          ? `${product.name} ${variant.storage} ${variant.color} ${variant.sku ?? ""}`
              .toLowerCase()
              .includes(term)
          : true
      );
  }, [products, query]);

  function draftFor(id: string, fallback: Draft): Draft {
    return drafts[id] ?? fallback;
  }

  function save(variantId: string, draft: Draft) {
    if (!supabaseReady) {
      toast.error("Conectá Supabase para poder guardar cambios.");
      return;
    }
    setSavingId(variantId);
    startSaving(async () => {
      const result = await updateVariantAction({
        variantId,
        priceArs: draft.priceArs,
        stock: draft.stock,
      });
      setSavingId(null);
      if (result.ok) {
        toast.success("Guardado.");
        setDrafts((d) => {
          const next = { ...d };
          delete next[variantId];
          return next;
        });
      } else {
        toast.error(result.error);
      }
    });
  }

  const inputClass =
    "h-9 rounded-lg border border-line bg-surface px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ink";

  return (
    <div>
      <div className="relative max-w-sm">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar modelo, color o SKU…"
          className="border-line text-foreground focus-visible:border-ink bg-surface h-10 w-full rounded-lg border pr-3 pl-9 text-sm transition-colors outline-none"
        />
      </div>

      <p className="text-muted-foreground mt-3 text-sm">
        {rows.length} {rows.length === 1 ? "variante" : "variantes"}
      </p>

      <div className="border-line mt-4 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-line text-muted-foreground border-b text-left text-xs">
              <th className="p-3 font-medium">Equipo</th>
              <th className="p-3 font-medium">Estado</th>
              <th className="p-3 font-medium">Costo</th>
              <th className="p-3 font-medium">Precio (ARS)</th>
              <th className="p-3 font-medium">Stock</th>
              <th className="p-3 text-right font-medium">Margen</th>
              <th className="w-24 p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, variant }) => {
              const fallback = { priceArs: variant.priceArs, stock: variant.stock };
              const draft = draftFor(variant.id, fallback);
              const dirty =
                draft.priceArs !== variant.priceArs || draft.stock !== variant.stock;
              const costArs =
                variant.costUsd === null ? null : variant.costUsd * dollarRate;
              const marginPct =
                costArs && costArs > 0
                  ? Math.round(((draft.priceArs - costArs) / costArs) * 100)
                  : null;

              return (
                <tr key={variant.id} className="border-line border-b last:border-0">
                  <td className="p-3">
                    <p className="text-foreground font-medium">{product.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {variant.storage} · {variant.color}
                    </p>
                  </td>
                  <td className="p-3">
                    <span className="text-muted-foreground text-xs">
                      {GRADE_LABELS[variant.grade]}
                      {variant.batteryHealth !== null && ` · ${variant.batteryHealth}%`}
                    </span>
                  </td>
                  <td className="tnum text-muted-foreground p-3">
                    {costArs === null ? "—" : formatARS(costArs)}
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={draft.priceArs}
                      onChange={(e) =>
                        setDrafts((d) => ({
                          ...d,
                          [variant.id]: { ...draft, priceArs: Number(e.target.value) },
                        }))
                      }
                      className={cn(inputClass, "tnum w-32")}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      min={0}
                      value={draft.stock}
                      onChange={(e) =>
                        setDrafts((d) => ({
                          ...d,
                          [variant.id]: { ...draft, stock: Number(e.target.value) },
                        }))
                      }
                      className={cn(
                        inputClass,
                        "tnum w-20",
                        draft.stock === 0 && "text-muted-foreground"
                      )}
                    />
                  </td>
                  <td className="tnum p-3 text-right">
                    {marginPct === null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span
                        className={cn(
                          "font-medium",
                          marginPct < 10 ? "text-destructive" : "text-foreground"
                        )}
                      >
                        {marginPct}%
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {dirty && (
                      <button
                        type="button"
                        onClick={() => save(variant.id, draft)}
                        disabled={savingId === variant.id}
                        className="bg-ink hover:bg-ink/85 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-white transition-colors disabled:opacity-50"
                      >
                        {savingId === variant.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Check className="size-3" />
                        )}
                        Guardar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="text-muted-foreground mt-8 text-center text-sm">
          No hay variantes que coincidan con la búsqueda.
        </p>
      )}
    </div>
  );
}
