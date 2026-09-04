"use client";

import { useSyncExternalStore } from "react";
import { ATRIBUTO_MONEDA, guardarMoneda, leerMoneda, type Moneda } from "@/lib/moneda";

const OPCIONES: { valor: Moneda; texto: string; titulo: string }[] = [
  { valor: "ars", texto: "$", titulo: "Ver los precios en pesos" },
  { valor: "usd", texto: "US$", titulo: "Ver los precios en dólares" },
];

/**
 * La moneda elegida, leída del navegador.
 *
 * El estado real vive en el atributo de <html> y en localStorage, no en React:
 * lo pone un script antes del primer pintado y lo lee el CSS. Estos avisos
 * existen solo para que el botón pueda contar cuál está activa con
 * `aria-pressed`, que es lo único que el CSS no puede decir.
 */
const oyentes = new Set<() => void>();

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  return () => {
    oyentes.delete(avisar);
  };
}

/** En el servidor todavía no se sabe: null evita inventar una y que el primer
 *  render del cliente no coincida. */
const enElServidor = () => null;

export function SelectorMoneda({ className }: { className?: string }) {
  const activa = useSyncExternalStore<Moneda | null>(suscribir, leerMoneda, enElServidor);

  const elegir = (moneda: Moneda) => {
    const raiz = document.documentElement;
    if (moneda === "usd") raiz.setAttribute(ATRIBUTO_MONEDA, "usd");
    else raiz.removeAttribute(ATRIBUTO_MONEDA);
    guardarMoneda(moneda);
    for (const avisar of oyentes) avisar();
  };

  return (
    <div
      className={
        "border-line bg-surface inline-flex items-center rounded-xl border p-0.5 shadow-sm " +
        (className ?? "")
      }
      role="group"
      aria-label="Moneda de los precios"
    >
      {OPCIONES.map(({ valor, texto, titulo }) => (
        <button
          key={valor}
          type="button"
          onClick={() => elegir(valor)}
          title={titulo}
          aria-label={titulo}
          aria-pressed={activa === null ? undefined : activa === valor}
          data-para={valor}
          className="marca-moneda tnum h-9 rounded-[0.6rem] px-3 text-sm font-medium transition-colors"
        >
          {texto}
        </button>
      ))}
    </div>
  );
}
