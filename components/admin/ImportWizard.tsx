"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, Loader2, Sparkles, Trash2 } from "lucide-react";
import { parseListAction, publishImportAction } from "@/app/admin/actions";
import { formatARS, formatUSD } from "@/utils/format";
import {
  CONDITION_LABELS,
  CONDITIONS,
  type Condition,
  type ParsedRow,
  type Supplier,
} from "@/types";
import { cn } from "@/lib/utils";

type Row = ParsedRow & { include: boolean; key: string };

const inputClass =
  "h-9 w-full rounded-lg border border-line bg-white px-2.5 text-sm text-ink outline-none transition-colors focus-visible:border-purple";

/** Mismo cálculo que `sellPrice` del servidor, para previsualizar sin ida y vuelta. */
function preview(row: ParsedRow, marginPct: number, dollarRate: number) {
  const costUsd = row.currency === "USD" ? row.cost : row.cost / dollarRate;
  const priceUsd = Math.round(costUsd * (1 + marginPct / 100));
  return {
    costUsd,
    priceUsd,
    priceArs: Math.ceil((priceUsd * dollarRate) / 10_000) * 10_000,
  };
}

/**
 * Importador de listas de proveedor.
 *
 * Tres pasos: pegar → revisar → publicar. El paso del medio no es opcional a
 * propósito: la interpretación automática acierta casi siempre, pero "casi" no
 * alcanza cuando el resultado son los precios que ve el cliente.
 */
export function ImportWizard({
  suppliers,
  defaultMarginPct,
  dollarRate,
  supabaseReady,
}: {
  suppliers: Supplier[];
  defaultMarginPct: number;
  dollarRate: number;
  supabaseReady: boolean;
}) {
  const [rawText, setRawText] = useState("");
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [marginPct, setMarginPct] = useState(
    suppliers[0]?.defaultMarginPct ?? defaultMarginPct
  );
  const [rate, setRate] = useState(dollarRate);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [parsing, startParsing] = useTransition();
  const [publishing, startPublishing] = useTransition();

  const included = useMemo(() => rows?.filter((r) => r.include) ?? [], [rows]);

  const totals = useMemo(() => {
    return included.reduce(
      (acc, row) => {
        const p = preview(row, marginPct, rate);
        return {
          units: acc.units + row.quantity,
          cost: acc.cost + p.costUsd * row.quantity,
          revenue: acc.revenue + p.priceUsd * row.quantity,
        };
      },
      { units: 0, cost: 0, revenue: 0 }
    );
  }, [included, marginPct, rate]);

  function handleParse() {
    startParsing(async () => {
      const result = await parseListAction(rawText);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setRows(
        result.data.rows.map((row, i) => ({ ...row, include: true, key: `row-${i}` }))
      );
      setWarnings(result.data.warnings);
      toast.success(
        `Encontramos ${result.data.rows.length} ${result.data.rows.length === 1 ? "equipo" : "equipos"}.`
      );
    });
  }

  function handlePublish() {
    if (included.length === 0) {
      toast.error("No hay filas seleccionadas.");
      return;
    }

    startPublishing(async () => {
      const result = await publishImportAction({
        supplierId: supplierId || null,
        marginPct,
        dollarRate: rate,
        rawText,
        rows: included.map(({ include, key, ...row }) => {
          void include;
          void key;
          return row;
        }),
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(`Se publicaron ${result.data.published} equipos en el catálogo.`);
      setRows(null);
      setWarnings([]);
      setRawText("");
    });
  }

  function updateRow(key: string, patch: Partial<Row>) {
    setRows(
      (current) =>
        current?.map((row) => (row.key === key ? { ...row, ...patch } : row)) ?? null
    );
  }

  return (
    <div className="space-y-8">
      <section className="border-line rounded-xl border p-5">
        <h2 className="text-ink text-sm font-medium">1. Pegá la lista del proveedor</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Copiá el mensaje tal cual viene de WhatsApp. No hace falta ordenarlo ni sacarle
          los emojis.
        </p>

        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={10}
          placeholder={
            "Ejemplo:\n\nBUEN DÍA! LISTA DE HOY 🔥\niPhone 13 128 impecable bat 89 — 470\n15 pro max 256 sellado 1290 (x2)\nip 14 128gb usado 9/10 600 u$d"
          }
          className="border-line text-ink focus-visible:border-purple mt-4 w-full resize-y rounded-lg border bg-white p-3 font-mono text-[13px] leading-relaxed transition-colors outline-none"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-muted-foreground mb-1.5 block text-xs">Proveedor</span>
            <select
              value={supplierId}
              onChange={(e) => {
                setSupplierId(e.target.value);
                const supplier = suppliers.find((s) => s.id === e.target.value);
                if (supplier) setMarginPct(supplier.defaultMarginPct);
              }}
              className={inputClass}
            >
              <option value="">Sin especificar</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-muted-foreground mb-1.5 block text-xs">Margen (%)</span>
            <input
              type="number"
              min={0}
              max={300}
              value={marginPct}
              onChange={(e) => setMarginPct(Number(e.target.value))}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="text-muted-foreground mb-1.5 block text-xs">
              Dólar (ARS)
            </span>
            <input
              type="number"
              min={1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className={inputClass}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleParse}
          disabled={parsing || !rawText.trim()}
          className="bg-ink hover:bg-ink/85 mt-4 inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {parsing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Interpretando…
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Interpretar lista
            </>
          )}
        </button>
      </section>

      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-amber-900">
            <AlertTriangle className="size-4" />
            Líneas que conviene revisar a mano
          </p>
          <ul className="mt-2 space-y-1 pl-6">
            {warnings.map((w, i) => (
              <li key={i} className="list-disc text-sm text-amber-900">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {rows && rows.length > 0 && (
        <section className="border-line rounded-xl border">
          <div className="border-line flex flex-wrap items-center justify-between gap-3 border-b p-5">
            <div>
              <h2 className="text-ink text-sm font-medium">
                2. Revisá antes de publicar
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Corregí lo que haga falta y destildá lo que no quieras subir.
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="text-muted-foreground">
                {included.length} de {rows.length} · {totals.units} unidades
              </p>
              <p className="tnum text-ink font-medium">
                Margen estimado: {formatUSD(totals.revenue - totals.cost)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-line text-muted-foreground border-b text-left text-xs">
                  <th className="w-10 p-3"></th>
                  <th className="p-3 font-medium">Modelo</th>
                  <th className="p-3 font-medium">Cap.</th>
                  <th className="p-3 font-medium">Color</th>
                  <th className="p-3 font-medium">Estado</th>
                  <th className="p-3 font-medium">Bat.</th>
                  <th className="p-3 font-medium">Costo</th>
                  <th className="p-3 font-medium">Cant.</th>
                  <th className="p-3 text-right font-medium">Precio de venta</th>
                  <th className="w-10 p-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const p = preview(row, marginPct, rate);
                  return (
                    <tr
                      key={row.key}
                      className={cn(
                        "border-line border-b last:border-0",
                        !row.include && "opacity-40"
                      )}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={row.include}
                          onChange={(e) =>
                            updateRow(row.key, { include: e.target.checked })
                          }
                          aria-label="Incluir esta fila"
                          className="size-4 accent-[#7b2fbe]"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          value={row.model}
                          onChange={(e) => updateRow(row.key, { model: e.target.value })}
                          className={cn(inputClass, "min-w-44")}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          value={row.storage}
                          onChange={(e) =>
                            updateRow(row.key, { storage: e.target.value })
                          }
                          className={cn(inputClass, "w-20")}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          value={row.color ?? ""}
                          onChange={(e) =>
                            updateRow(row.key, { color: e.target.value || null })
                          }
                          className={cn(inputClass, "w-28")}
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={row.condition}
                          onChange={(e) =>
                            updateRow(row.key, { condition: e.target.value as Condition })
                          }
                          className={cn(inputClass, "w-32")}
                        >
                          {CONDITIONS.map((c) => (
                            <option key={c} value={c}>
                              {CONDITION_LABELS[c]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={row.batteryHealth ?? ""}
                          onChange={(e) =>
                            updateRow(row.key, {
                              batteryHealth: e.target.value
                                ? Number(e.target.value)
                                : null,
                            })
                          }
                          className={cn(inputClass, "w-16")}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            value={row.cost}
                            onChange={(e) =>
                              updateRow(row.key, { cost: Number(e.target.value) })
                            }
                            className={cn(inputClass, "w-24")}
                          />
                          <select
                            value={row.currency}
                            onChange={(e) =>
                              updateRow(row.key, {
                                currency: e.target.value as "USD" | "ARS",
                              })
                            }
                            className={cn(inputClass, "w-20")}
                          >
                            <option value="USD">USD</option>
                            <option value="ARS">ARS</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={0}
                          value={row.quantity}
                          onChange={(e) =>
                            updateRow(row.key, { quantity: Number(e.target.value) })
                          }
                          className={cn(inputClass, "w-16")}
                        />
                      </td>
                      <td className="p-3 text-right">
                        <span className="tnum text-ink block font-medium">
                          {formatARS(p.priceArs)}
                        </span>
                        <span className="tnum text-muted-foreground block text-xs">
                          {formatUSD(p.priceUsd)}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() =>
                            setRows((c) => c?.filter((r) => r.key !== row.key) ?? null)
                          }
                          aria-label="Quitar fila"
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg p-1.5 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-line flex flex-wrap items-center justify-between gap-3 border-t p-5">
            {!supabaseReady && (
              <p className="text-sm text-amber-700">
                Conectá Supabase para poder publicar. Mientras tanto podés probar la
                interpretación.
              </p>
            )}
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing || included.length === 0 || !supabaseReady}
              className="bg-ink hover:bg-ink/85 ml-auto inline-flex h-10 items-center gap-2 rounded-full px-6 text-sm font-medium text-white transition-colors disabled:opacity-50"
            >
              {publishing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Publicando…
                </>
              ) : (
                <>
                  <Check className="size-4" />
                  Publicar {included.length} en el catálogo
                </>
              )}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
