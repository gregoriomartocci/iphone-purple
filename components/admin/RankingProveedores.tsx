"use client";

import { useState } from "react";
import {
  ordenarRanking,
  type CriterioRanking,
  type FilaRanking,
} from "@/lib/whatsapp/ranking";

const CRITERIOS: { id: CriterioRanking; etiqueta: string; ayuda: string }[] = [
  {
    id: "precio",
    etiqueta: "Mejor precio",
    ayuda:
      "Cuánto más caro es que el mejor precio, en promedio, en los equipos que también ofrece otro proveedor.",
  },
  {
    id: "variedad",
    etiqueta: "Más equipos",
    ayuda: "Cuántos equipos trae su última lista.",
  },
  { id: "reciente", etiqueta: "Lista más nueva", ayuda: "Cuándo llegó su última lista." },
  {
    id: "frecuencia",
    etiqueta: "Actualiza más seguido",
    ayuda: "En cuántos de los últimos 30 días se registró una lista suya.",
  },
];

function fecha(iso: string | null): string {
  if (!iso) return "Sin listas";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

function precio(f: FilaRanking): string {
  if (f.sobreprecioPct === null) return "Sin comparar";
  const pct =
    f.sobreprecioPct < 0.05 ? "El más barato" : `+${f.sobreprecioPct.toFixed(1)}%`;
  return `${pct} · ${f.masBaratoEn}/${f.compartidos}`;
}

export function RankingProveedores({ filas }: { filas: FilaRanking[] }) {
  const [criterio, setCriterio] = useState<CriterioRanking>("precio");
  const orden = ordenarRanking(filas, criterio);
  const actual = CRITERIOS.find((c) => c.id === criterio);

  return (
    <section
      aria-labelledby="ranking"
      className="vidrio-sutil mb-8 rounded-2xl p-4 sm:p-5"
    >
      <h2 id="ranking" className="font-semibold text-white">
        Ranking
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {CRITERIOS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={criterio === c.id}
            onClick={() => setCriterio(c.id)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              criterio === c.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-white/[0.12] text-white/60 hover:border-white/25 hover:text-white"
            }`}
          >
            {c.etiqueta}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-white/45">{actual?.ayuda}</p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm">
          <thead className="text-left text-xs text-white/45">
            <tr>
              <th className="py-2 pr-3 font-normal">#</th>
              <th className="py-2 pr-3 font-normal">Proveedor</th>
              <th className="py-2 pr-3 font-normal">Precio</th>
              <th className="py-2 pr-3 text-right font-normal">Equipos</th>
              <th className="py-2 pr-3 text-right font-normal">Última lista</th>
              <th className="py-2 text-right font-normal">Días con lista</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] border-t border-white/[0.07]">
            {orden.map((f, i) => (
              <tr key={f.proveedor.id} className="text-white">
                <td className="tnum py-2.5 pr-3 text-white/45">{i + 1}</td>
                <td className="py-2.5 pr-3 font-medium">{f.proveedor.name}</td>
                <td className="tnum py-2.5 pr-3 text-white/70">{precio(f)}</td>
                <td className="tnum py-2.5 pr-3 text-right text-white/70">{f.equipos}</td>
                <td className="tnum py-2.5 pr-3 text-right text-white/70">
                  {fecha(f.ultimaLista)}
                </td>
                <td className="tnum py-2.5 text-right text-white/70">{f.diasConLista}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
