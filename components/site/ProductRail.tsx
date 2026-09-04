"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

/** Cada cuánto avanza solo el carrusel. */
const INTERVALO = 4500;

/**
 * Fila de productos que se desliza en horizontal y avanza sola.
 *
 * Es el formato correcto para una selección corta y ordenada: la lista tiene
 * un primero y un último, y una grilla que reacomoda las tarjetas según el
 * ancho de pantalla rompería ese orden.
 *
 * El avance automático existe para que la portada tenga movimiento sin pedirle
 * nada a quien mira, pero se frena en cuanto hay intención de por medio: al
 * pasar el mouse, al enfocar con el teclado, al tocar la pantalla o al usar
 * las flechas. Un carrusel que se sigue moviendo mientras alguien lee es una
 * molestia, no una animación.
 *
 * También respeta a quien pidió menos movimiento en su sistema: ahí no avanza
 * solo y queda como una fila que se desliza a mano.
 */
export function ProductRail({
  title,
  subtitle,
  products,
  href = "/catalogo",
  auto = false,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  href?: string;
  /** Si avanza solo. Se apaga con interacción y con reduced-motion. */
  auto?: boolean;
}) {
  const pista = useRef<HTMLDivElement>(null);
  const [quieto, setQuieto] = useState(false);

  /** Mueve la pista una tarjeta; al llegar al final vuelve al principio. */
  const avanzar = useCallback((paso: 1 | -1) => {
    const el = pista.current;
    if (!el) return;
    const tarjeta = el.firstElementChild as HTMLElement | null;
    if (!tarjeta) return;
    const salto = tarjeta.offsetWidth + 20; // ancho + separación

    const fin = el.scrollWidth - el.clientWidth - 4;
    if (paso === 1 && el.scrollLeft >= fin) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (paso === -1 && el.scrollLeft <= 4)
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: salto * paso, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!auto || quieto) return;
    const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (sinMovimiento) return;
    const id = window.setInterval(() => avanzar(1), INTERVALO);
    return () => window.clearInterval(id);
  }, [auto, quieto, avanzar]);

  if (products.length === 0) return null;

  return (
    // Sin padding abajo: el propio riel ya reserva el espacio que necesita
    // la sombra de la tarjeta al levantarse, y sumarle el de la sección
    // dejaba un hueco enorme contra el título siguiente.
    <section
      className="shell band pb-0 sm:pb-0"
      onMouseEnter={() => setQuieto(true)}
      onMouseLeave={() => setQuieto(false)}
      onFocusCapture={() => setQuieto(true)}
      onTouchStart={() => setQuieto(true)}
    >
      <div className="aparece flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={href}
            className="text-foreground subraya hidden items-center gap-1.5 text-sm sm:inline-flex"
          >
            Ver todo
            <ArrowRight className="size-3.5" />
          </Link>
          {/* Las flechas solo en escritorio: en el teléfono se arrastra. */}
          <div className="ml-2 hidden gap-1.5 lg:flex">
            <Paso hacia={-1} onClick={() => avanzar(-1)} />
            <Paso hacia={1} onClick={() => avanzar(1)} />
          </div>
        </div>
      </div>

      {/*
        Cuántas tarjetas entran, calculado contra el contenedor.

        Con anchos en `vw` la cuenta nunca cerraba: el contenedor ocupa el 82 %
        de la pantalla, así que cuatro tarjetas de 23 vw más sus separaciones
        dejaban asomando un pedazo de la quinta, que se leía como una tarjeta
        cortada al costado. Ahora entra un número exacto por vez restando
        primero lo que ocupan las separaciones.

        El padding vertical no es decorativo: `overflow-x: auto` recorta también
        en vertical, y sin lugar de sobra la tarjeta que se levanta al pasar el
        mouse mostraba la sombra cortada al ras.
      */}
      <div
        ref={pista}
        className="scrollbar-hide mt-4 flex snap-x snap-mandatory gap-5 overflow-x-auto pt-6 pb-14"
      >
        {products.map((product, i) => (
          <div
            key={product.id}
            className="w-full shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-3.75rem)/4)]"
          >
            <ProductCard product={product} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Paso({ hacia, onClick }: { hacia: 1 | -1; onClick: () => void }) {
  const Icono = hacia === -1 ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={hacia === -1 ? "Anterior" : "Siguiente"}
      className={cn(
        "border-line text-muted-foreground hover:border-foreground/30 hover:text-foreground",
        "flex size-9 items-center justify-center rounded-full border transition-colors"
      )}
    >
      <Icono className="size-4" />
    </button>
  );
}
