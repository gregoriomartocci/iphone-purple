import { cn } from "@/lib/utils";

/**
 * Marca de iPhone Purple: símbolo orbital + "IPHONE" sobre "PURPLE".
 *
 * Todo se dimensiona en `em`, así que el tamaño se controla con la clase de
 * `font-size` del contenedor y las proporciones se mantienen en cualquier escala.
 *
 * El símbolo va siempre en violeta; el texto cambia según el fondo, porque la
 * versión original es blanca sobre negro y en el header claro no se leería.
 */
export function Logo({
  className,
  tone = "onLight",
}: {
  className?: string;
  /** `onDark` para fondos negros (footer, hero), `onLight` para fondo blanco. */
  tone?: "onDark" | "onLight";
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-[0.55em] leading-none", className)}
      aria-label="iPhone Purple"
    >
      <LogoMark className="text-purple size-[2.05em] shrink-0" />

      <span className="flex flex-col">
        <span
          className={cn(
            "text-[0.55em] leading-none font-normal tracking-[0.2em]",
            tone === "onDark" ? "text-white" : "text-foreground"
          )}
        >
          IPHONE
        </span>
        <span
          className={cn(
            "mt-[0.1em] text-[1em] leading-none font-semibold tracking-[0.02em]",
            tone === "onDark" ? "text-white" : "text-foreground"
          )}
        >
          PURPLE
        </span>
      </span>
    </span>
  );
}

/**
 * Símbolo solo: una esfera con dos órbitas cruzadas.
 * Sirve para el favicon y para donde no entra la marca completa.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden focusable="false">
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      >
        {/* La esfera. Va primero para que las órbitas la crucen por encima. */}
        <circle cx="60" cy="60" r="34" strokeWidth="8" />
        {/* Órbita principal: la que envuelve la esfera en diagonal. */}
        <ellipse
          cx="60"
          cy="60"
          rx="53"
          ry="32"
          strokeWidth="8"
          transform="rotate(-32 60 60)"
        />
        {/* Órbita secundaria, más fina y con otra inclinación, para dar volumen. */}
        <ellipse
          cx="60"
          cy="60"
          rx="47"
          ry="26"
          strokeWidth="5.5"
          transform="rotate(-72 60 60)"
        />
      </g>
    </svg>
  );
}
