import { cn } from "@/lib/utils";

/**
 * Marca de iPhone Purple.
 *
 * Es el archivo original vectorizado (`public/logo.svg`), no una
 * reconstrucción: se sirve como imagen para que el SVG —que pesa 26 KB de
 * paths— se descargue y cachee una sola vez, en lugar de repetirse inline en
 * el header y el footer de cada página.
 *
 * La relación de aspecto es 3.34:1, así que el tamaño se controla por la
 * altura.
 */
export function Logo({
  className,
  tone = "onDark",
}: {
  className?: string;
  /** `onDark` usa la marca en blanco; `onLight`, en tinta. */
  tone?: "onDark" | "onLight";
}) {
  return (
    // nada pasando por el optimizador, y next/image bloquea SVG por defecto.
    <img
      src={tone === "onLight" ? "/logo-dark.svg" : "/logo.svg"}
      alt="iPhone Purple"
      className={cn("h-8 w-auto", className)}
      width={828}
      height={248}
    />
  );
}

/** Solo el símbolo orbital, en formato cuadrado. Para favicon y redes. */
export function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- ídem arriba.
    <img
      src="/logo-mark.svg"
      alt=""
      aria-hidden
      className={cn("size-8", className)}
      width={251}
      height={251}
    />
  );
}
