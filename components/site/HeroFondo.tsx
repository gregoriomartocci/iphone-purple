"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Fondo de la portada: varias fotos que se van pasando con un fundido lento.
 *
 * Son todas del mismo lenguaje —plano cenital, luz baja, equipos Apple y nada
 * más—, y eso es lo que hace que el cambio se lea como que la imagen respira
 * y no como un carrusel. Si las fotos fueran de estilos distintos, el fundido
 * se notaría como un salto.
 *
 * Ocho segundos quieta y dos de fundido: lo suficiente para que quien llega y
 * se queda leyendo alcance a ver un cambio, sin que el que está eligiendo un
 * equipo sienta que la página se mueve sola.
 */
const QUIETA_MS = 8000;

export function HeroFondo({ fotos }: { fotos: string[] }) {
  const [actual, setActual] = useState(0);
  const capa = useRef<HTMLDivElement>(null);

  /**
   * El pase automático.
   *
   * No corre para quien pidió menos movimiento: en ese caso queda la primera
   * foto fija, que es una portada perfectamente válida.
   */
  useEffect(() => {
    const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (menosMovimiento.matches) return;

    const id = window.setInterval(
      () => setActual((i) => (i + 1) % fotos.length),
      QUIETA_MS
    );
    return () => window.clearInterval(id);
  }, [fotos.length]);

  /**
   * Parallax con el mouse.
   *
   * El fondo se corre unos pocos píxeles en contra del puntero. Es deliberadamente
   * poco: lo que se busca es que la imagen se sienta a otra profundidad que el
   * texto, no que se mueva.
   *
   * Tres cuidados que hacen la diferencia entre refinado y mareador:
   *
   * - Solo con mouse. En un teléfono no hay puntero que seguir, y `pointer:
   *   fine` es la forma de preguntarlo.
   * - La posición se escribe en el estilo dentro de un `requestAnimationFrame`,
   *   así el navegador la aplica una vez por cuadro por más seguido que el
   *   mouse dispare eventos.
   * - El movimiento lo suaviza una transición larga, no el evento: sin eso el
   *   fondo persigue al cursor con nerviosismo.
   */
  useEffect(() => {
    const finoYConGanas = window.matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)"
    );
    if (!finoYConGanas.matches) return;

    let pendiente = 0;
    const alMover = (e: PointerEvent) => {
      if (pendiente) return;
      pendiente = window.requestAnimationFrame(() => {
        pendiente = 0;
        const el = capa.current;
        if (!el) return;
        // De -1 a 1 desde el centro de la ventana.
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        el.style.setProperty("--parallax-x", `${(-x * 14).toFixed(2)}px`);
        el.style.setProperty("--parallax-y", `${(-y * 10).toFixed(2)}px`);
      });
    };

    window.addEventListener("pointermove", alMover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", alMover);
      if (pendiente) window.cancelAnimationFrame(pendiente);
    };
  }, []);

  return (
    <div
      ref={capa}
      aria-hidden
      className="hero-parallax absolute inset-0 -z-10 overflow-hidden"
    >
      {fotos.map((foto, i) => (
        <Image
          key={foto}
          src={foto}
          alt=""
          fill
          // La primera es lo primero que se ve de la página: tiene que estar
          // antes que nada. Las demás pueden esperar, hay ocho segundos.
          priority={i === 0}
          sizes="100vw"
          className={[
            "object-cover object-center transition-opacity duration-[2000ms] ease-in-out",
            i === actual ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
