"use client";

import { useEffect, useState } from "react";
import { estadoDelLocal, semana, type EstadoLocal } from "@/lib/horario";
import { cn } from "@/lib/utils";

/**
 * Estado del local y horarios de la semana.
 *
 * Se calcula en el navegador y no en el servidor a propósito: la página se
 * cachea una hora, así que un "Abierto ahora" renderizado en el servidor
 * podría seguir diciendo eso sesenta minutos después de que el local cerró.
 * Decirle a alguien que estamos abiertos cuando no lo estamos es peor que no
 * decir nada.
 *
 * En el primer render no muestra estado —el servidor no sabe la hora de quien
 * mira— y lo completa apenas monta. Eso evita además que el HTML del servidor
 * y el del cliente no coincidan.
 */
export function HorarioLocal() {
  const [estado, setEstado] = useState<EstadoLocal | null>(null);
  const [hoy, setHoy] = useState<number | null>(null);

  useEffect(() => {
    const actualizar = () => {
      setEstado(estadoDelLocal());
      setHoy(new Date().getDay());
    };
    actualizar();
    // Se revisa cada minuto: si alguien deja la pestaña abierta cruzando la
    // hora de cierre, el cartel se corrige solo.
    const id = window.setInterval(actualizar, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div>
      {estado && (
        <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span
            className={cn(
              "size-2 rounded-full",
              estado.abierto ? "bg-emerald-500" : "bg-muted-foreground/40"
            )}
          />
          <span className="text-foreground font-medium">
            {estado.abierto ? "Abierto ahora" : "Cerrado ahora"}
          </span>
          <span className="text-muted-foreground">
            {estado.abierto
              ? `· cerramos a las ${estado.cierraA}`
              : `· abrimos ${estado.proximo}`}
          </span>
        </p>
      )}

      <ul className="space-y-1.5">
        {semana().map((d) => (
          <li
            key={d.dia}
            className={cn(
              "flex justify-between gap-4 text-sm",
              d.indice === hoy ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            <span className="capitalize">
              {d.dia}
              {d.indice === hoy && " · hoy"}
            </span>
            <span className="tnum">{d.horario}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
