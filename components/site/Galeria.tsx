"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type PiezaGaleria = {
  url: string;
  alt: string;
  /** Un recorte de estudio se muestra entero sobre su fondo; una foto se recorta. */
  render?: boolean;
  /** Color del fondo del recorte, medido de la propia imagen. */
  fondo?: string | null;
  /** Los videos van al final: primero se quiere ver el equipo quieto. */
  video?: boolean;
};

/**
 * Galería del producto.
 *
 * Se arrastra con el dedo o con el mouse, igual que en una app: en el teléfono
 * nadie busca las flechitas, tira de la foto. Las miniaturas quedan igual para
 * quien prefiere ir directo a una toma concreta.
 *
 * El arrastre se hace con eventos de puntero y no con el scroll nativo porque
 * necesitamos el mismo gesto en escritorio, donde no hay scroll horizontal
 * táctil, y además así el cambio de foto es discreto —una por gesto— en vez de
 * quedar a mitad de camino entre dos.
 */
export function Galeria({ piezas, nombre }: { piezas: PiezaGaleria[]; nombre: string }) {
  const [indice, setIndice] = useState(0);
  const [arrastre, setArrastre] = useState(0);
  // En estado y no solo en el ref: la transición depende de si se está
  // arrastrando, y leer un ref durante el render no está permitido.
  const [arrastrando, setArrastrando] = useState(false);
  const inicio = useRef<number | null>(null);
  const marco = useRef<HTMLDivElement>(null);

  const total = piezas.length;
  const ir = useCallback(
    (n: number) => setIndice(((n % total) + total) % total),
    [total]
  );

  // Flechas del teclado: es lo que se espera de una galería enfocada.
  useEffect(() => {
    const el = marco.current;
    if (!el) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") ir(indice + 1);
      if (e.key === "ArrowLeft") ir(indice - 1);
    };
    el.addEventListener("keydown", alTeclear);
    return () => el.removeEventListener("keydown", alTeclear);
  }, [indice, ir]);

  /** Cuánto hay que arrastrar para que cuente como cambio de foto. */
  const UMBRAL = 60;

  const alSoltar = () => {
    if (inicio.current === null) return;
    if (arrastre < -UMBRAL) ir(indice + 1);
    else if (arrastre > UMBRAL) ir(indice - 1);
    inicio.current = null;
    setArrastrando(false);
    setArrastre(0);
  };

  if (total === 0) {
    // Igual que en la tarjeta: falta la foto y se dice, en vez de poner una
    // genérica que no es este equipo.
    return (
      <div className="border-line bg-elevated flex aspect-square flex-col items-center justify-center gap-3 rounded-3xl border px-6 text-center">
        <Camera className="text-muted-foreground/50 size-10" />
        <p className="text-foreground font-medium">{nombre}</p>
        <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
          Todavía no tenemos foto propia de este equipo. Escribinos y te mandamos fotos
          reales del que está en stock.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={marco}
        tabIndex={0}
        role="group"
        aria-label={`Fotos del producto, ${indice + 1} de ${total}`}
        className="border-line bg-surface focus-visible:ring-ink/30 relative aspect-square touch-pan-y overflow-hidden rounded-3xl border shadow-sm outline-none focus-visible:ring-2"
        onPointerDown={(e) => {
          if (total < 2) return;
          // Las flechas viven dentro del marco: si el gesto arranca sobre una,
          // no se toma como arrastre. Capturar el puntero le robaba el clic al
          // botón y las flechas quedaban muertas.
          if ((e.target as HTMLElement).closest("button")) return;
          inicio.current = e.clientX;
          setArrastrando(true);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (inicio.current === null) return;
          setArrastre(e.clientX - inicio.current);
        }}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
      >
        {/* Toda la tira se mueve junta: al arrastrar se ve asomar la foto
            siguiente, que es lo que hace entender que hay más. */}
        <div
          className={cn(
            "flex h-full",
            !arrastrando && "transition-transform duration-300 ease-out"
          )}
          style={{
            width: `${total * 100}%`,
            transform: `translateX(calc(${(-indice * 100) / total}% + ${arrastre}px))`,
          }}
        >
          {piezas.map((pieza, i) => (
            <div
              key={pieza.url}
              className="relative h-full"
              style={{
                width: `${100 / total}%`,
                // El recorte se muestra entero, así que hay fondo a la vista:
                // va el color medido de la propia imagen para que no se note
                // dónde termina la foto.
                background: pieza.render ? (pieza.fondo ?? "#ffffff") : undefined,
              }}
            >
              {pieza.video ? (
                <video
                  src={pieza.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full bg-black object-contain"
                />
              ) : (
                <Image
                  src={pieza.url}
                  alt={pieza.alt}
                  fill
                  // Solo la primera es prioritaria: es la que se ve al entrar.
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 620px"
                  draggable={false}
                  className={cn(
                    "select-none",
                    pieza.render ? "object-contain p-4" : "object-cover"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {total > 1 && (
          <>
            <Flecha lado="izq" onClick={() => ir(indice - 1)} />
            <Flecha lado="der" onClick={() => ir(indice + 1)} />

            {/* Contador: en el teléfono las miniaturas quedan fuera de vista
                al mirar la foto, y sin esto no se sabe cuántas hay. */}
            <span className="tnum bg-ink/70 absolute right-4 bottom-4 rounded-full px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {indice + 1} / {total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1">
          {piezas.map((pieza, i) => (
            <button
              key={pieza.url}
              type="button"
              onClick={() => ir(i)}
              aria-label={`Ver ${pieza.video ? "el video" : `la foto ${i + 1}`}`}
              aria-current={i === indice}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-xl border transition-colors",
                i === indice ? "border-ink" : "border-line hover:border-foreground/30"
              )}
              style={{
                background: pieza.render ? (pieza.fondo ?? "#ffffff") : undefined,
              }}
            >
              {pieza.video ? (
                <span className="bg-ink flex h-full w-full items-center justify-center text-white">
                  <Play className="size-5" />
                </span>
              ) : (
                <Image
                  src={pieza.url}
                  alt=""
                  fill
                  sizes="80px"
                  className={cn(pieza.render ? "object-contain p-1.5" : "object-cover")}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Flecha({ lado, onClick }: { lado: "izq" | "der"; onClick: () => void }) {
  const Icono = lado === "izq" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={lado === "izq" ? "Foto anterior" : "Foto siguiente"}
      // Aparecen al acercar el mouse; en táctil el gesto ya alcanza, así que
      // en pantallas chicas no ocupan lugar sobre la foto.
      className={cn(
        "border-line bg-surface/90 text-foreground absolute top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors sm:flex",
        "hover:bg-surface",
        lado === "izq" ? "left-3" : "right-3"
      )}
    >
      <Icono className="size-5" />
    </button>
  );
}
