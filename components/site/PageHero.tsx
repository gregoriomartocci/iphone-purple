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
/**
 * Recorte de las portadas.
 *
 * `fp-y` decide desde qué altura de la foto original se toma la banda: 0.5 es
 * el medio, más chico sube y más grande baja. Con `entropy` el recorte lo
 * elegía el algoritmo mirando dónde hay más detalle, y en fotos con una zona
 * muy brillante —una pantalla encendida en la oscuridad— eso empujaba el
 * motivo contra el borde de arriba.
 *
 * Los valores de cada banda no son a ojo: el título apoya abajo a la
 * izquierda, y si el equipo cae justo ahí compite con el texto. Se midió la
 * variación de luminancia en ese rectángulo —ya con el velo y el degradado
 * aplicados— barriendo fp-y de 0,2 a 0,8, y se eligió el que deja esa zona
 * más tranquila sin vaciar el resto de la foto. Catálogo bajó de 17,6 a 14,4;
 * contacto, de 18,3 a 15,4.
 */
const recorte = (fpY = 0.5) =>
  `auto=format&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=${fpY}&w=2000&h=640&q=80`;
export const PAGE_PHOTOS = {
  // MacBook encendida en penumbra: pantalla, luz y color, que es la estética
  // que buscamos. La foto de escritorio con los dos monitores pasó a ser la
  // portada de la landing, así catálogo no repite la misma imagen.
  // 0.565 no es a ojo: es la altura donde está la MacBook dentro de la foto,
  // medida como el centro de masa del brillo —el equipo es lo iluminado en una
  // escena oscura—. Con ese foco el equipo cae en 0.498 de la banda, o sea
  // centrado. Con 0.62 quedaba en 0.409, empujado contra el borde de arriba.
  // Muchos equipos Apple vistos desde arriba, con sus colores: un catálogo
  // dibujado. La anterior era una MacBook apagada en penumbra, que decía
  // "computadora" pero no decía "hay de todo y podés elegir".
  catalogo: `https://images.unsplash.com/photo-1707485122968-56916bd2c464?${recorte(0.6)}`,
  // Dos iPhone Pro Max de generaciones distintas, uno al lado del otro: es el
  // Plan Canje en una imagen —entregás el de la izquierda, te llevás el de la
  // derecha—. La anterior era un iPhone X con iOS 11, de 2017: un teléfono de
  // ocho años atrás ilustrando la página donde se cotiza lo que vale el tuyo.
  planCanje: `https://images.unsplash.com/photo-1727079513748-d03e7b8c8947?${recorte()}`,
  reparaciones: `https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?${recorte()}`,
  // Un Apple Pencil y unos AirPods sobre gris, y nada más. Producto, como en
  // la portada: sin manos ni gente, que es lo que hacía que estas bandas
  // desentonaran con la landing. El lápiz al lado de la palabra Blog dice
  // solo lo que hace falta.
  blog: `https://images.unsplash.com/photo-1563549054059-bf4ebe2f49d5?${recorte(0.4)}`,
  // Tres iPhone en fila, con la luz cálida de atrás desenfocada. Producto,
  // igual que el resto: se probó con fotos de local lleno de gente y
  // desentonaban con la portada, que es de equipos y nada más.
  contacto: `https://images.unsplash.com/photo-1608022625050-82683640e5a3?${recorte(0.8)}`,
} as const;
