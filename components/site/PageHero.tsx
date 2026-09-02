import Image from "next/image";

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
export function PageHero({
  title,
  subtitle,
  image,
}: {
  title: string;
  subtitle?: string;
  image: string;
}) {
  return (
    <section className="bg-ink relative isolate -mt-16 flex min-h-[400px] items-end overflow-hidden sm:min-h-[460px]">
      <Image
        src={image}
        // Decorativa: el sentido lo aporta el <h1>, así que un alt acá sería ruido
        // para quien usa lector de pantalla.
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />

      <div aria-hidden className="absolute inset-0 -z-10 bg-black/40" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/45 to-transparent"
      />

      <div className="shell w-full pt-28 pb-12 sm:pb-14">
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mt-4 max-w-xl leading-relaxed text-white/75">{subtitle}</p>
        )}
      </div>
    </section>
  );
}

/**
 * Foto de cada sección. Centralizadas acá para que se cambien en un solo lugar
 * cuando haya fotos propias del local.
 */
export const PAGE_PHOTOS = {
  catalogo:
    "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=2000&q=80",
  planCanje:
    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=2000&q=80",
  reparaciones:
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=2000&q=80",
  blog: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2000&q=80",
  contacto:
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=2000&q=80",
} as const;
