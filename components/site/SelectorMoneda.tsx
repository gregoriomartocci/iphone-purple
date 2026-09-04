"use client";

import { useSyncExternalStore } from "react";
import {
  ATRIBUTO_MONEDA,
  PARAM_MONEDA,
  guardarMoneda,
  leerMoneda,
  type Moneda,
} from "@/lib/moneda";
import { cn } from "@/lib/utils";

/** Las dos etiquetas miden lo mismo: el indicador se desplaza media caja exacta. */
const OPCIONES: { valor: Moneda; texto: string; titulo: string }[] = [
  { valor: "ars", texto: "ARS", titulo: "Ver los precios en pesos" },
  { valor: "usd", texto: "USD", titulo: "Ver los precios en dólares" },
];

/**
 * La moneda elegida, leída del navegador.
 *
 * El estado real vive en el atributo de <html>, en la dirección y en
 * localStorage, no en React: lo pone un script antes del primer pintado y lo
 * lee el CSS. Estos avisos existen solo para que el botón pueda contar cuál
 * está activa con `aria-pressed`, que es lo único que el CSS no puede decir.
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

/**
 * Elige en qué moneda se lee el precio.
 *
 * No esconde la otra: los dos números siguen en pantalla y esto solo decide
 * cuál va grande. Por eso no es un selector de moneda al uso —que es un modo, y
 * un modo mal leído en un país donde `$` es pesos hace que alguien crea que un
 * equipo de un millón y medio sale novecientos cincuenta.
 */
export function SelectorMoneda({ className }: { className?: string }) {
  const activa = useSyncExternalStore<Moneda | null>(suscribir, leerMoneda, enElServidor);

  const elegir = (moneda: Moneda) => {
    const raiz = document.documentElement;
    if (moneda === "usd") raiz.setAttribute(ATRIBUTO_MONEDA, "usd");
    else raiz.removeAttribute(ATRIBUTO_MONEDA);
    guardarMoneda(moneda);

    /*
     * La dirección acompaña la elección, para que se pueda copiar y mandar.
     *
     * Va con `replaceState` y no navegando: el cambio es puramente visual —lo
     * resuelve el CSS— y una navegación volvería a pedir la página entera para
     * mostrar exactamente lo mismo. Se conserva el estado de historia que
     * maneja el router, o volver atrás se rompe.
     */
    const url = new URL(window.location.href);
    url.searchParams.set(PARAM_MONEDA, moneda);
    window.history.replaceState(window.history.state, "", url);

    for (const avisar of oyentes) avisar();
  };

  return (
    <div
      className={cn(
        "selector-moneda border-line bg-surface inline-flex h-11 items-center rounded-xl border p-[3px] shadow-sm",
        className
      )}
      role="group"
      aria-label="Moneda de los precios"
    >
      {OPCIONES.map(({ valor, texto, titulo }) => (
        <button
          key={valor}
          type="button"
          onClick={() => elegir(valor)}
          aria-label={titulo}
          aria-pressed={activa === null ? undefined : activa === valor}
          data-para={valor}
          className="h-full w-[3.25rem] rounded-[0.55rem] text-[13px] font-semibold tracking-wide"
        >
          {texto}
        </button>
      ))}
    </div>
  );
}
