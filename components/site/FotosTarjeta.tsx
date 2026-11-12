"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type FotoTarjeta = {
  url: string;
  alt: string;
  /** El color que muestra, cuando la foto está en la tarjeta por ese color. */
  color?: string;
  /** Un recorte de estudio entra entero sobre su fondo; una foto se recorta. */
  render: boolean;
  fondo: string | null;
};

/**
 * Las fotos de la tarjeta del catálogo, para deslizar con el dedo.
 *
 * Es desplazamiento nativo con snap y no un carrusel con JavaScript: en el
 * teléfono se siente como cualquier otra lista que se desliza, frena donde
 * tiene que frenar, y un deslizamiento no cuenta como toque, así que no abre
 * la ficha sin querer. Las fotos que todavía no se ven no se descargan.
 *
 * En escritorio no hay dedo: aparecen flechas al pasar el mouse. Están dentro
 * del enlace de la tarjeta, así que frenan el clic para no abrir la ficha.
 */
export function FotosTarjeta({
  fotos,
  sizes,
  mostrarColor,
}: {
  fotos: FotoTarjeta[];
  sizes: string;
  /** Si el producto tiene más de un color, cada foto dice cuál es. */
  mostrarColor: boolean;
}) {
  const tira = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);

  const ir = (e: React.MouseEvent, paso: number) => {
    e.preventDefault();
    e.stopPropagation();
    const el = tira.current;
    if (!el) return;
    el.scrollTo({ left: (actual + paso) * el.clientWidth, behavior: "smooth" });
  };

  return (
    <>
      <div
        ref={tira}
        onScroll={(e) => {
          const el = e.currentTarget;
          setActual(Math.round(el.scrollLeft / Math.max(el.clientWidth, 1)));
        }}
        className="scrollbar-hide flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        aria-label="Fotos del equipo"
      >
        {fotos.map((f, i) => (
          <div
            key={f.url}
            className="relative h-full w-full shrink-0 snap-center"
            style={f.render ? { background: f.fondo ?? "#ffffff" } : undefined}
          >
            <Image
              src={f.url}
              alt={f.color ? `${f.alt} · ${f.color}` : f.alt}
              fill
              draggable={false}
              sizes={sizes}
              // La primera se ve de entrada; el resto, recién al deslizar.
              loading={i === 0 ? undefined : "lazy"}
              className={cn(
                "transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]",
                f.render ? "object-contain p-3" : "object-cover"
              )}
            />
            {mostrarColor && f.color && (
              <span className="text-foreground pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
                {f.color}
              </span>
            )}
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute right-0 bottom-3.5 left-0 flex justify-center gap-1.5"
        aria-hidden
      >
        {fotos.map((f, i) => (
          <span
            key={f.url}
            className={cn(
              "size-1.5 rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.6)] transition-colors",
              i === actual ? "bg-ink" : "bg-ink/25"
            )}
          />
        ))}
      </div>

      {actual > 0 && (
        <button
          type="button"
          onClick={(e) => ir(e, -1)}
          aria-label="Foto anterior"
          className="border-line text-foreground absolute top-1/2 left-2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 md:flex"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      {actual < fotos.length - 1 && (
        <button
          type="button"
          onClick={(e) => ir(e, 1)}
          aria-label="Foto siguiente"
          className="border-line text-foreground absolute top-1/2 right-2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 md:flex"
        >
          <ChevronRight className="size-5" />
        </button>
      )}
    </>
  );
}
