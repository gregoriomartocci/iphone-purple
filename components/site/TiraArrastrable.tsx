"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Tira horizontal que se arrastra con el mouse.
 *
 * `overflow-x: auto` alcanza en el teléfono, donde se tira con el dedo, pero
 * en escritorio deja la barra de scroll como única forma de avanzar y da la
 * sensación de que lo que está cortado no se puede alcanzar. Acá el gesto es
 * el mismo en los dos lados: se agarra y se tira.
 *
 * Un arrastre no puede terminar en clic: si alguien tira de la tira agarrando
 * un botón, al soltar se dispararía ese botón. Por eso se cuenta cuánto se
 * movió y, si pasó de unos pocos píxeles, se cancela el clic siguiente.
 */
export function TiraArrastrable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const marco = useRef<HTMLDivElement>(null);
  const inicio = useRef<{ x: number; scroll: number } | null>(null);
  const recorrido = useRef(0);
  const [arrastrando, setArrastrando] = useState(false);

  return (
    <div
      ref={marco}
      className={cn(
        "scrollbar-hide flex overflow-x-auto",
        arrastrando ? "cursor-grabbing select-none" : "cursor-grab",
        className
      )}
      onPointerDown={(e) => {
        // Con el dedo ya funciona el scroll nativo; esto es para el mouse.
        if (e.pointerType === "touch" || !marco.current) return;
        inicio.current = { x: e.clientX, scroll: marco.current.scrollLeft };
        recorrido.current = 0;
        setArrastrando(true);
      }}
      onPointerMove={(e) => {
        if (!inicio.current || !marco.current) return;
        const delta = e.clientX - inicio.current.x;
        recorrido.current = Math.max(recorrido.current, Math.abs(delta));
        marco.current.scrollLeft = inicio.current.scroll - delta;
      }}
      onPointerUp={() => {
        inicio.current = null;
        setArrastrando(false);
      }}
      onPointerLeave={() => {
        inicio.current = null;
        setArrastrando(false);
      }}
      onClickCapture={(e) => {
        if (recorrido.current > 6) {
          e.preventDefault();
          e.stopPropagation();
          recorrido.current = 0;
        }
      }}
    >
      {children}
    </div>
  );
}
