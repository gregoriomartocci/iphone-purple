import Image from "next/image";
import { versionado } from "@/lib/assets";
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
      // es el recorte de la foto y peor el encuadre que queda. Es la misma
      // medida en todas las secciones: una más baja que el resto se lee como
      // un error de maquetado, no como una decisión.
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
 * Foto de cada sección, con su encuadre al lado.
 *
 * El encuadre viaja con la foto y no en cada página a propósito: es una
 * propiedad de la imagen —dónde cae el equipo dentro del cuadro—, no de la
 * sección que la usa. Cuando eran dos cosas separadas ya se notó: /cuenta
 * reutiliza la foto del catálogo y se habría quedado con el recorte por
 * defecto, que en esa foto deja el título encima de la MacBook.
 *
 * Se usan con spread: `<PageHero title="…" {...PAGE_PHOTOS.catalogo} />`.
 */
type Banda = {
  image: string;
  foco?: "top" | "center" | "bottom";
};

/**
 * Recorte de las portadas que todavía vienen de Unsplash.
 *
 * `fp-y` decide desde qué altura de la foto original se toma la banda: 0.5 es
 * el medio, más chico sube y más grande baja. Se piden ya recortadas a la
 * proporción de la banda para que no viaje alto que no se ve.
 */
const recorte = (fpY = 0.5) =>
  `auto=format&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=${fpY}&w=2000&h=640&q=80`;

/**
 * Catálogo, blog y contacto llevan fotos locales, en la estética de la portada.
 *
 * Venían de Unsplash y desentonaban: la del catálogo era un fondo blanco con
 * fundas rojas, doradas y naranjas —lo más ruidoso posible justo arriba de la
 * grilla de productos—, y la de contacto, pese a que se la había buscado
 * "macro de titanio", llegaba casi blanca. Ahora las tres son producto solo,
 * sobre superficie oscura y sin gente, y viven en el repo: el recorte es
 * nuestro y no depende de que un servicio de terceros siga sirviendo la foto.
 *
 * Blog y contacto reusan dos de las cuatro de `public/hero/`; el catálogo
 * tiene la suya en `public/bandas/`, porque ninguna de las del hero encuadra
 * bien en una banda tan apaisada.
 *
 * Cuál va en cada una no se eligió a ojo. Se rearmó el recorte de la banda de
 * escritorio para cada foto y cada encuadre, se le aplicaron los dos velos, y
 * se midió la variación de luminancia en el rectángulo donde apoyan el título
 * y la bajada: cuanto más pareja esa zona, menos pelea la foto con el texto.
 * El número mide calma, no encuadre, así que la última palabra la tuvo mirar
 * el recorte renderizado —por eso la más "tranquila" de todas quedó afuera:
 * era un teléfono parado que la banda partía al medio—.
 */
export const PAGE_PHOTOS = {
  // Un iPhone Pro y unos AirPods Pro con su estuche, sobre negro puro y nada
  // más. Es la más despojada de las que probamos, que resultó ser lo que hacía
  // falta: las anteriores tenían de más —un estuche de AirPods Max que hacía
  // un bulto raro, o un escritorio con textura y el reloj del teléfono a la
  // vista— y en una banda de 2,77:1 todo lo que sobra se nota.
  catalogo: { image: versionado("bandas/catalogo.jpg"), foco: "center" },
  // Libreta, lente y iPad con el Pencil al lado. Es la única de las cuatro con
  // algo de escribir adentro, que es justo de lo que va la sección.
  blog: { image: versionado("hero/2.jpg"), foco: "center" },
  // Un iPhone solo, de cerca, sobre negro. La página de contacto no necesita
  // mostrar surtido: necesita no distraer del formulario y de los datos.
  contacto: { image: versionado("hero/3.jpg"), foco: "center" },
  // Dos iPhone Pro Max de generaciones distintas, uno al lado del otro: es el
  // Plan Canje en una imagen —entregás el de la izquierda, te llevás el de la
  // derecha—.
  planCanje: {
    image: `https://images.unsplash.com/photo-1727079513748-d03e7b8c8947?${recorte()}`,
  },
  reparaciones: {
    image: `https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?${recorte()}`,
  },
} satisfies Record<string, Banda>;
