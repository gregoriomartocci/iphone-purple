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

  /**
   * Arrastre con mouse.
   *
   * El teléfono ya desliza con el dedo gracias al scroll nativo; esto es solo
   * para el mouse, que no tiene forma de arrastrar un `overflow-x-auto` de
   * fábrica. Por eso todo lo que sigue mira `pointerType === "mouse"` y deja
   * el touch intacto: capturar también el puntero táctil pisaría el scroll
   * nativo y el momentum que el navegador ya resuelve mejor que un cálculo a
   * mano.
   *
   * Va en refs y no en estado: el handler de "moverse" corre en cada pixel
   * del arrastre, y disparar un render por cada uno sería carísimo para algo
   * que no necesita pintar nada distinto mientras se mueve —el propio scroll
   * ya se ve—.
   */
  const arrastre = useRef<{ x: number; scrollInicial: number; movido: boolean } | null>(
    null
  );
  const [agarrado, setAgarrado] = useState(false);

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

  /**
   * Escucha en window, no en la pista.
   *
   * Es lo que evita el problema que ya había pasado en la galería de
   * producto: si el arrastre se sigue con `setPointerCapture` sobre la pista,
   * el clic que suelta el mouse arriba de una tarjeta le queda robado al
   * link y la tarjeta deja de abrir. Escuchando en window en cambio se sigue
   * el movimiento aunque el mouse salga del carrusel, y el clic de cada
   * tarjeta queda intacto.
   */
  useEffect(() => {
    if (!agarrado) return;

    const mover = (e: PointerEvent) => {
      const el = pista.current;
      const inicio = arrastre.current;
      if (!el || !inicio) return;
      const delta = e.clientX - inicio.x;
      if (Math.abs(delta) > 3) inicio.movido = true;
      el.scrollLeft = inicio.scrollInicial - delta;
    };

    const soltar = () => {
      setAgarrado(false);
      // Si hubo arrastre real, el próximo clic sobre una tarjeta es el gesto
      // de soltar el mouse, no una intención de entrar al producto: el
      // handler de clic de más abajo lo cancela mientras esto siga en true.
      if (!arrastre.current?.movido) arrastre.current = null;
      else window.setTimeout(() => (arrastre.current = null), 0);
    };

    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
    window.addEventListener("pointercancel", soltar);
    return () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
      window.removeEventListener("pointercancel", soltar);
    };
  }, [agarrado]);

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
        onPointerDown={(e) => {
          // Solo mouse: el teléfono ya desliza con el dedo, y sumarle esto
          // ahí compite con el scroll nativo en vez de ayudarlo.
          if (e.pointerType !== "mouse") return;
          arrastre.current = {
            x: e.clientX,
            scrollInicial: pista.current!.scrollLeft,
            movido: false,
          };
          setAgarrado(true);
        }}
        onClickCapture={(e) => {
          // El clic que suelta el arrastre arriba de una tarjeta no es la
          // intención de entrar al producto.
          if (arrastre.current?.movido) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        // Un link o una imagen arrastrados arrancan el drag nativo del
        // navegador, que le roba los eventos de puntero al arrastre de acá:
        // el pointerdown llega pero el pointermove que sigue, no. La imagen
        // ya lo tiene resuelto con `draggable={false}`; esto cubre cualquier
        // otro hijo —el texto del link, por ejemplo— que también lo sea por
        // defecto.
        onDragStart={(e) => e.preventDefault()}
        className={cn(
          "scrollbar-hide mt-4 flex gap-5 overflow-x-auto pt-6 pb-14",
          agarrado
            ? "cursor-grabbing snap-none select-none"
            : "cursor-grab snap-x snap-mandatory"
        )}
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
