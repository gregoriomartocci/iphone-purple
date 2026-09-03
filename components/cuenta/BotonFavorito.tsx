"use client";

import { Heart } from "lucide-react";
import { useCuenta } from "./CuentaProvider";
import { cn } from "@/lib/utils";

/**
 * Marcar un equipo como favorito.
 *
 * No pide cuenta: guardar lo que a alguien le gustó es justamente lo que
 * después le da sentido a crearse una. Pedir el registro antes de dejar
 * guardar nada es pedir el compromiso antes del beneficio.
 */
export function BotonFavorito({
  slug,
  nombre,
  precioArs,
  imagen,
  className,
}: {
  slug: string;
  nombre: string;
  precioArs: number;
  imagen: string | null;
  className?: string;
}) {
  const { esFavorito, alternarFavorito, listo } = useCuenta();
  const marcado = listo && esFavorito(slug);

  return (
    <button
      type="button"
      aria-label={marcado ? `Quitar ${nombre} de favoritos` : `Guardar ${nombre}`}
      aria-pressed={marcado}
      onClick={(e) => {
        // Vive dentro de la tarjeta, que es un link: sin esto marcar un
        // favorito navegaría a la ficha.
        e.preventDefault();
        e.stopPropagation();
        alternarFavorito({ slug, nombre, precioArs, imagen });
      }}
      className={cn(
        "flex size-9 items-center justify-center rounded-full transition-colors",
        "bg-surface/85 hover:bg-surface border-line border shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <Heart
        className={cn(
          "size-[18px] transition-colors",
          marcado ? "fill-purple text-purple" : "text-muted-foreground"
        )}
      />
    </button>
  );
}
