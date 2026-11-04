"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Loader2, PackageX, Sparkles, Upload } from "lucide-react";
import {
  planificarDesdeWhatsappAction,
  publicarPlanAction,
  type PlanParaRevisar,
} from "@/app/admin/whatsapp/acciones";
import { formatARS } from "@/utils/format";
import type { Coincidencia } from "@/lib/whatsapp/plan";

/**
 * El paso entre "el lector tiene mensajes" y "el catálogo tiene precios".
 *
 * Son dos botones y no uno a propósito. El primero gasta —cada lista es una
 * llamada al intérprete— pero no cambia nada; el segundo no gasta y cambia los
 * precios que ve el cliente. Tenerlos separados da el único momento en que una
 * persona puede mirar qué va a pasar antes de que pase.
 */
function textoCoincidencia(c: Coincidencia): string {
  if (c.tipo === "producto-nuevo") return "Producto nuevo";
  if (c.tipo === "variante-nueva") return "Variante nueva";
  return `Actualiza: antes ${formatARS(c.precioActual)}`;
}

export function PlanWhatsapp({ hayProveedores }: { hayProveedores: boolean }) {
  const [plan, setPlan] = useState<PlanParaRevisar | null>(null);
  const [armando, setArmando] = useState(false);
  const [publicando, setPublicando] = useState(false);

  async function armar() {
    setArmando(true);
    setPlan(null);
    const r = await planificarDesdeWhatsappAction();
    setArmando(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    setPlan(r.data);
    toast.success(
      `${r.data.listasInterpretadas} ${r.data.listasInterpretadas === 1 ? "lista interpretada" : "listas interpretadas"}`
    );
  }

  async function publicar() {
    if (!plan) return;
    setPublicando(true);
    const r = await publicarPlanAction({
      lotes: plan.lotes,
      sinStock: plan.sinStock,
      dollarRate: plan.dollarRate,
    });
    setPublicando(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success(
      `${r.data.publicados} equipos publicados` +
        (r.data.enCero > 0 ? `, ${r.data.enCero} en stock cero` : "")
    );
    setPlan(null);
  }

  const aPublicar = plan?.lotes.reduce((n, l) => n + l.filas.length, 0) ?? 0;
  const conEquipos = plan?.lotes.filter((l) => l.filas.length > 0) ?? [];
  const sinGanar = plan?.lotes.filter((l) => l.filas.length === 0) ?? [];

  return (
    <section className="vidrio-sutil rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-medium text-white">Importar las listas del día</h2>
          <p className="mt-0.5 text-sm text-white/45">
            Lee los mensajes, los interpreta y arma el plan. No publica nada hasta que lo
            apruebes.
          </p>
        </div>

        <button
          type="button"
          onClick={armar}
          disabled={armando || publicando || !hayProveedores}
          className="bg-primary text-primary-foreground hover:bg-primary/85 inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-[0_10px_30px_-12px_#5e16eb] transition-all active:scale-[0.985] disabled:opacity-50 disabled:shadow-none"
        >
          {armando ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {armando ? "Interpretando…" : "Armar el plan"}
        </button>
      </div>

      {!hayProveedores && (
        <p className="mt-4 text-sm text-amber-200/80">
          Primero mapeá al menos un proveedor abajo: sin eso no se sabe de quién es cada
          lista ni qué margen aplicarle.
        </p>
      )}

      {plan && (
        <div className="mt-6 space-y-4 border-t border-white/[0.07] pt-5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            <span className="text-white">
              <strong className="font-semibold">{aPublicar}</strong> equipos de{" "}
              {conEquipos.length} {conEquipos.length === 1 ? "proveedor" : "proveedores"}
            </span>
            {plan.sinStock.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-white/45">
                <PackageX className="size-3.5" />
                {plan.sinStock.length} pasan a stock cero
              </span>
            )}
          </div>

          {sinGanar.length > 0 && (
            <p className="text-sm text-white/45">
              {sinGanar.map((l) => l.proveedorNombre).join(", ")}: ningún equipo más
              barato que el resto. Su lista se guarda igual para verla en Mercado.
            </p>
          )}

          {conEquipos.map((lote) => (
            <div
              key={lote.proveedorId}
              className="overflow-hidden rounded-xl border border-white/[0.07]"
            >
              <div className="flex items-center justify-between gap-3 bg-white/[0.03] px-4 py-2.5">
                <span className="text-sm font-medium text-white">
                  {lote.proveedorNombre}
                </span>
                <span className="text-xs text-white/40">
                  {lote.filas.length} {lote.filas.length === 1 ? "equipo" : "equipos"} ·
                  margen {lote.marginPct}%
                </span>
              </div>
              <ul className="divide-y divide-white/[0.06]">
                {lote.filas.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-4 px-4 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">
                        {f.model} {f.storage}
                        {f.authenticity === "replica" && (
                          <span className="ml-2 rounded bg-amber-400/15 px-1.5 py-0.5 text-[0.7rem] text-amber-200">
                            réplica
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-white/40">
                        {f.grade} · costo {f.cost} {f.currency} · {f.quantity} u.
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="tnum text-sm text-white">
                        {formatARS(lote.previa[i].precioArs)}
                      </p>
                      <p className="mt-0.5 text-[0.7rem] text-white/40">
                        {textoCoincidencia(lote.previa[i].coincidencia)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {plan.frenadas.length > 0 && (
            <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-amber-100">
                <AlertTriangle className="size-4 shrink-0" />
                {plan.frenadas.length}{" "}
                {plan.frenadas.length === 1 ? "lista frenada" : "listas frenadas"}
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-amber-200/80">
                {plan.frenadas.map((f, i) => (
                  <li key={i}>
                    <strong className="font-medium">{f.proveedor}:</strong>{" "}
                    {f.revisiones.map((r) => r.detalle).join(" ")}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-amber-200/60">
                No entran en la comparación de precios. Si la lista está bien, importala a
                mano desde «Importar lista».
              </p>
            </div>
          )}

          {plan.avisos.length > 0 && (
            <details className="rounded-xl border border-white/[0.07] p-4">
              <summary className="cursor-pointer text-sm text-white/70">
                Líneas que el intérprete marcó para revisar
              </summary>
              <ul className="mt-2 space-y-1.5 text-sm text-white/45">
                {plan.avisos.map((a, i) => (
                  <li key={i}>
                    <strong className="font-medium text-white/70">{a.proveedor}:</strong>{" "}
                    {a.textos.join(" ")}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <button
            type="button"
            onClick={publicar}
            disabled={publicando || !plan.lotes.length}
            className="bg-primary text-primary-foreground hover:bg-primary/85 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-[0_10px_30px_-12px_#5e16eb] transition-all active:scale-[0.985] disabled:opacity-50 disabled:shadow-none"
          >
            {publicando ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {publicando
              ? "Publicando…"
              : aPublicar > 0
                ? `Publicar ${aPublicar} equipos al catálogo`
                : "Guardar las listas"}
          </button>
        </div>
      )}
    </section>
  );
}
