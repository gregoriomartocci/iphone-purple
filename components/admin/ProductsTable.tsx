"use client";

import { nombresDeColores } from "@/lib/colores";
import { Fragment, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { elegirOfertaAction, updateVariantAction } from "@/app/admin/actions";
import type { ExtraVariante } from "@/lib/data/admin";
import { formatARS, formatUSD } from "@/utils/format";
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
  extras = {},
}: {
  products: Product[];
  dollarRate: number;
  supabaseReady: boolean;
  extras?: Record<string, ExtraVariante>;
}) {
  const [abierta, setAbierta] = useState<string | null>(null);

  function elegir(variantId: string, proveedorId: string) {
    setSavingId(variantId);
    startSaving(async () => {
      const r = await elegirOfertaAction({ variantId, proveedorId });
      setSavingId(null);
      if (r.ok) toast.success("Listo: publicado con ese proveedor.");
      else toast.error(r.error);
    });
  }
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
          ? `${product.name} ${variant.storage} ${nombresDeColores(variant)} ${variant.sku ?? ""}`
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
    "h-9 rounded-lg border border-line bg-surface px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring";

  return (
    <div>
      <div className="relative max-w-sm">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar modelo, color o SKU…"
          className="border-line text-foreground focus-visible:border-ring bg-surface h-10 w-full rounded-lg border pr-3 pl-9 text-sm transition-colors outline-none"
        />
      </div>

      <p className="text-muted-foreground mt-3 text-sm">
        {rows.length} {rows.length === 1 ? "variante" : "variantes"}
      </p>

      <div className="border-line mt-4 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-line text-muted-foreground border-b text-left text-xs">
              <th className="p-3 font-medium">Equipo</th>
              <th className="p-3 font-medium">Estado</th>
              <th className="p-3 font-medium">Costo</th>
              <th className="p-3 font-medium">Precio</th>
              <th className="p-3 font-medium">Ganancia</th>
              <th className="p-3 font-medium">Stock</th>
              <th className="p-3 font-medium">Proveedores</th>
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
              const gananciaArs = costArs === null ? null : draft.priceArs - costArs;
              const marginPct =
                costArs && costArs > 0 && gananciaArs !== null
                  ? (gananciaArs / costArs) * 100
                  : null;
              const extra = extras[variant.id];
              const ofertas = extra?.ofertas ?? [];
              const abiertaEsta = abierta === variant.id;

              return (
                <Fragment key={variant.id}>
                  <tr className={cn("border-line border-b", abiertaEsta && "border-b-0")}>
                    <td className="p-3">
                      <p className="text-foreground font-medium">{product.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {variant.storage} · {nombresDeColores(variant)}
                      </p>
                      {extra?.proveedor && (
                        <p className="text-muted-foreground text-xs">
                          De {extra.proveedor}
                        </p>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-muted-foreground text-xs">
                        {GRADE_LABELS[variant.grade]}
                        {variant.batteryHealth !== null && ` · ${variant.batteryHealth}%`}
                      </span>
                    </td>
                    <td className="tnum p-3">
                      {variant.costUsd === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <>
                          <p className="text-foreground">{formatUSD(variant.costUsd)}</p>
                          <p className="text-muted-foreground text-xs">
                            {formatARS(costArs ?? 0)}
                          </p>
                        </>
                      )}
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
                      <p className="tnum text-muted-foreground mt-1 text-xs">
                        {formatUSD(draft.priceArs / dollarRate)}
                      </p>
                    </td>
                    <td className="tnum p-3">
                      {gananciaArs === null || marginPct === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <>
                          <p
                            className={cn(
                              "font-medium",
                              marginPct < 4.95 ? "text-destructive" : "text-foreground"
                            )}
                          >
                            {formatUSD(gananciaArs / dollarRate)} · {marginPct.toFixed(1)}
                            %
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatARS(gananciaArs)}
                          </p>
                        </>
                      )}
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
                    <td className="p-3">
                      {ofertas.length === 0 ? (
                        <span className="text-muted-foreground text-xs">Sin lista</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAbierta(abiertaEsta ? null : variant.id)}
                          aria-expanded={abiertaEsta}
                          className="border-line text-foreground hover:bg-surface inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors"
                        >
                          {ofertas.length} {ofertas.length === 1 ? "opción" : "opciones"}
                          <ChevronDown
                            className={cn(
                              "size-3 transition-transform",
                              abiertaEsta && "rotate-180"
                            )}
                          />
                        </button>
                      )}
                    </td>
                    <td className="p-3">
                      {dirty && (
                        <button
                          type="button"
                          onClick={() => save(variant.id, draft)}
                          disabled={savingId === variant.id}
                          className="bg-primary hover:bg-primary/85 text-primary-foreground inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors disabled:opacity-50"
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
                  {abiertaEsta && (
                    <tr className="border-line border-b">
                      <td colSpan={8} className="bg-surface/60 px-3 pb-3">
                        <ul className="divide-line divide-y">
                          {ofertas.map((o, i) => {
                            const actual = o.proveedorId === extra?.proveedorId;
                            const gana = o.precioArs - o.costoUsd * dollarRate;
                            return (
                              <li
                                key={o.proveedorId}
                                className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm"
                              >
                                <div>
                                  <p className="text-foreground font-medium">
                                    {o.proveedor}
                                    {i === 0 && (
                                      <span className="text-muted-foreground ml-2 text-xs font-normal">
                                        más barato
                                      </span>
                                    )}
                                    {o.ingresando && (
                                      <span className="text-muted-foreground ml-2 text-xs font-normal">
                                        ingresando
                                      </span>
                                    )}
                                  </p>
                                  <p className="tnum text-muted-foreground text-xs">
                                    Costo{" "}
                                    {o.moneda === "USD"
                                      ? formatUSD(o.costo)
                                      : formatARS(o.costo)}
                                    {i > 0 &&
                                      ` · +${formatUSD(o.costoUsd - ofertas[0].costoUsd)}`}
                                    {" · lista del "}
                                    {new Date(o.fecha).toLocaleDateString("es-AR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      timeZone: "America/Argentina/Buenos_Aires",
                                    })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="tnum text-right">
                                    <p className="text-foreground">
                                      {formatUSD(o.precioUsd)} · {formatARS(o.precioArs)}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                      Ganás {formatUSD(gana / dollarRate)}
                                    </p>
                                  </div>
                                  {actual ? (
                                    <span className="text-muted-foreground w-28 text-right text-xs">
                                      Publicado
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={savingId === variant.id || !supabaseReady}
                                      onClick={() => elegir(variant.id, o.proveedorId)}
                                      className="border-line text-foreground hover:bg-surface inline-flex h-8 w-28 items-center justify-center rounded-full border text-xs transition-colors disabled:opacity-50"
                                    >
                                      Usar este
                                    </button>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                        <p className="text-muted-foreground mt-1 text-xs">
                          La próxima importación vuelve a elegir el más barato.
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
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
