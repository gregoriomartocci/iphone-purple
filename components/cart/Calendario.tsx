"use client";

import { useMemo } from "react";
import { CalendarDays, Clock } from "lucide-react";
import { diasDisponibles, fechaCorta, fechaLarga, horariosDe } from "@/lib/turnos";
import { cn } from "@/lib/utils";

/**
 * Elección del turno para retirar.
 *
 * Los días van en una tira que se desliza y no en una grilla de mes completo:
 * lo que hay para elegir son tres semanas, y un calendario mensual entero
 * obliga a buscar entre días que no se pueden reservar.
 *
 * Los días se calculan una sola vez por montaje. Recalcularlos en cada render
 * haría que la lista cambie sola si alguien deja la pestaña abierta cruzando
 * la medianoche, justo mientras está eligiendo.
 */
export function Calendario({
  fecha,
  hora,
  onFecha,
  onHora,
}: {
  fecha: string;
  hora: string;
  onFecha: (f: string) => void;
  onHora: (h: string) => void;
}) {
  const dias = useMemo(() => diasDisponibles(), []);
  const horarios = fecha ? horariosDe(fecha) : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-foreground flex items-center gap-2 text-sm font-medium">
          <CalendarDays className="text-purple size-4" />
          Elegí el día
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Desde cuatro días en adelante, para tener el equipo listo y revisado.
        </p>

        <div className="scrollbar-hide -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
          {dias.map((d) => {
            const { dia, numero, mes } = fechaCorta(d);
            const elegido = fecha === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  onFecha(d);
                  onHora("");
                }}
                aria-pressed={elegido}
                className={cn(
                  "flex w-16 shrink-0 flex-col items-center rounded-xl border py-2.5 transition-colors",
                  elegido
                    ? "border-purple bg-purple/8"
                    : "border-line hover:border-foreground/30"
                )}
              >
                <span className="text-muted-foreground text-[11px] tracking-wide uppercase">
                  {dia}
                </span>
                <span className="tnum text-foreground text-lg font-semibold">
                  {numero}
                </span>
                <span className="text-muted-foreground text-[11px]">{mes}</span>
              </button>
            );
          })}
        </div>
      </div>

      {fecha && (
        <div>
          <p className="text-foreground flex items-center gap-2 text-sm font-medium">
            <Clock className="text-purple size-4" />
            Elegí el horario
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {fechaLarga(fecha)}
            {horarios.at(-1) === "13:00" && " · los sábados cerramos al mediodía"}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {horarios.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => onHora(h)}
                aria-pressed={hora === h}
                className={cn(
                  "tnum h-11 rounded-xl border px-4 text-[15px] font-medium transition-colors",
                  hora === h
                    ? "border-purple bg-purple/8 text-foreground"
                    : "border-line text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
