import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Cabecera con foto a todo el ancho para las páginas internas.
 *
 * Cumple dos funciones: cortar el blanco apenas entrás a la página —si no, el
 * sitio es un bloque claro continuo desde el header hasta el footer— y darle
 * identidad propia a cada sección.
 *
 * Las fotos van elegidas oscuras a propósito: sobre una clara el título pierde
 * contraste y el corte visual deja de funcionar.
 */
/**
 * Clases de encuadre, en un mapa y no armadas con plantilla.
 *
 * Tailwind analiza el código como texto: una clase construida con
 * `object-${foco}` no aparece en ningún lado y no se genera, así que en
 * producción el encuadre quedaría sin efecto.
 */
const FOCO = {
  top: "object-top",
  center: "object-center",
  bottom: "object-bottom",
} as const;

export function PageHero({
  title,
  subtitle,
  image,
  foco = "center",
}: {
  title: string;
  subtitle?: string;
  image: string;
  /**
   * Desde dónde recorta la foto. La banda es mucho más ancha que alta, así que
   * `cover` descarta más de la mitad del alto; sin decirle de dónde, corta por
   * el centro y a veces deja afuera justo lo que importa.
   */
  foco?: "top" | "center" | "bottom";
}) {
  return (
    <section
      data-hero
      // Baja en teléfono, para no comerse media pantalla antes del contenido;
      // más alta en escritorio, porque cuanto más chata la banda más agresivo
      // es el recorte de la foto y peor el encuadre que queda.
      className="bg-ink relative isolate -mt-16 flex min-h-[300px] items-end overflow-hidden sm:min-h-[440px] lg:min-h-[520px]"
    >
      <Image
        src={image}
        // Decorativa: el sentido lo aporta el <h1>, así que un alt acá sería ruido
        // para quien usa lector de pantalla.
        alt=""
        fill
        priority
        sizes="100vw"
        className={cn("-z-10 object-cover", FOCO[foco])}
      />

      <div aria-hidden className="absolute inset-0 -z-10 bg-black/40" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/45 to-transparent"
      />

      <div className="shell w-full pt-24 pb-9 sm:pt-28 sm:pb-14">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-xl leading-relaxed text-white/75 sm:mt-4">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * Foto de cada sección.
 *
 * Se piden ya recortadas a la proporción de la banda y con `crop=entropy`:
 * así el recorte lo elige Unsplash mirando dónde está la información de la
 * imagen, en vez de cortar por el centro a ciegas y dejar afuera el motivo.
 * Además viaja bastante menos peso, porque no se descarga alto que no se ve.
 *
 * Centralizadas acá para cambiarlas en un solo lugar cuando haya fotos
 * propias del local.
 */
const RECORTE = "auto=format&fit=crop&crop=entropy&w=2000&h=640&q=80";
export const PAGE_PHOTOS = {
  // MacBook encendida en penumbra: pantalla, luz y color, que es la estética
  // que buscamos. La foto de escritorio con los dos monitores pasó a ser la
  // portada de la landing, así catálogo no repite la misma imagen.
  catalogo: `https://images.unsplash.com/photo-1531297484001-80022131f5a1?${RECORTE}`,
  planCanje: `https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?${RECORTE}`,
  reparaciones: `https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?${RECORTE}`,
  blog: `https://images.unsplash.com/photo-1519389950473-47ba0277781c?${RECORTE}`,
  contacto: `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?${RECORTE}`,
} as const;
