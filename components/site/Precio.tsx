import { formatARS, formatUSD } from "@/utils/format";
import { cn } from "@/lib/utils";

/**
 * Precio de un equipo en las dos monedas.
 *
 * Los dos números salen siempre. El que elige la persona va grande y el otro
 * queda abajo en chico; eso lo decide el CSS a partir de un atributo en
 * <html>, no este componente, así que puede seguir siendo de servidor y
 * renderizarse dentro del catálogo sin arrastrar JavaScript.
 *
 * No hay un solo precio convertido al vuelo: cada variante guarda `priceArs` y
 * `priceUsd` por separado. Dividir uno para obtener el otro dejaba precios con
 * decimales raros que cambiaban cada vez que se tocaba la cotización, y en una
 * lista de veinte equipos eso se nota.
 */
export function Precio({
  ars,
  usd,
  fuerte = "1.25rem",
  suave = "0.8125rem",
  desde = false,
  anclado = false,
  className,
}: {
  ars: number;
  /** 0 cuando el proveedor no dio precio en dólares: ahí no se muestra. */
  usd: number;
  /** Tamaño del número principal. */
  fuerte?: string;
  /** Tamaño del secundario. */
  suave?: string;
  /** Antepone "Desde" cuando el producto tiene variantes de distinto precio. */
  desde?: boolean;
  /**
   * No sigue la moneda elegida: los pesos van siempre grandes.
   *
   * Es para el checkout y el carrito, donde el número no es una referencia sino
   * el importe que Mercado Pago va a cobrar. Mostrar dólares grandes ahí sería
   * decirle a alguien que va a pagar en una moneda en la que no va a pagar.
   */
  anclado?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("precio tnum", anclado && "precio-anclado", className)}
      style={
        {
          "--precio-fuerte": fuerte,
          "--precio-suave": suave,
        } as React.CSSProperties
      }
    >
      {/* El "Desde" va en las dos, y el CSS deja visible solo el de la que está
          grande: es el precio principal el que arranca en ese número, y
          repetirlo en la línea chica sonaba a tartamudeo. */}
      <span className="moneda-ars">
        {desde && <span className="desde">Desde </span>}
        {formatARS(ars)}
      </span>
      {usd > 0 && (
        <span className="moneda-usd">
          {desde && <span className="desde">Desde </span>}
          {formatUSD(usd)}
        </span>
      )}
    </div>
  );
}
