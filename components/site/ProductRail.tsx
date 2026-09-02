import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

/**
 * Fila de productos que se desliza en horizontal.
 *
 * Es el formato correcto para una selección corta y ordenada: la lista tiene
 * un primero y un último, y una grilla que reacomoda las tarjetas según el
 * ancho de pantalla rompería ese orden. Además ocupa una franja de alto fijo,
 * así se pueden apilar varias selecciones en la portada sin que quede
 * kilométrica.
 *
 * El desplazamiento es nativo con `snap`: se arrastra con el dedo en el
 * teléfono y con la rueda o el trackpad en escritorio, sin JavaScript ni
 * flechas que tapen contenido.
 */
export function ProductRail({
  title,
  subtitle,
  products,
  href = "/catalogo",
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  href?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="shell band">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <Link
          href={href}
          className="text-foreground hover:text-purple hidden shrink-0 items-center gap-1.5 text-sm sm:inline-flex"
        >
          Ver todo
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* El padding lateral negativo deja que la primera y la última tarjeta
          lleguen al borde del contenedor en vez de quedar recuadradas, que es
          lo que da la sensación de que la fila sigue. */}
      <div className="scrollbar-hide -mx-5 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8">
        {products.map((product, i) => (
          <div
            key={product.id}
            className="w-[70vw] shrink-0 snap-start sm:w-[44vw] lg:w-[30vw] xl:w-[23%]"
          >
            <ProductCard product={product} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Selección numerada, del 1 al 5.
 *
 * A diferencia del riel, acá el número es el contenido: la persona quiere
 * saber cuál es el primero. Por eso va en vertical y con la posición grande al
 * costado, en lugar de tarjetas todas iguales donde el orden se pierde.
 */
export function ProductRanking({
  title,
  subtitle,
  products,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="shell band">
      <div>
        <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-2 max-w-xl">{subtitle}</p>}
      </div>

      <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {products.map((product, i) => (
          <li key={product.id} className="relative">
            {/* La posición flota sobre la esquina de la tarjeta: ocupa cero
                espacio del layout y se lee de un vistazo al recorrer la fila. */}
            <span
              aria-hidden
              className="border-line bg-surface text-foreground absolute -top-2 -left-2 z-10 flex size-9 items-center justify-center rounded-full border text-sm font-semibold shadow-sm"
            >
              {i + 1}
            </span>
            <ProductCard product={product} index={i} />
          </li>
        ))}
      </ol>
    </section>
  );
}
