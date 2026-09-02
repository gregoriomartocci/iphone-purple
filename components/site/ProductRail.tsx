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
      <div className="aparece flex items-end justify-between gap-4">
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

      {/*
        Cuántas tarjetas entran, calculado contra el contenedor.

        Antes el ancho iba en `vw` y la cuenta nunca cerraba: el contenedor
        ocupa el 82 % de la pantalla, así que cuatro tarjetas de 23 vw más sus
        separaciones dejaban asomando un pedazo de la quinta. El riel además se
        estiraba unos píxeles hacia los costados, lo que dejaba asomar otro
        pedacito. Las dos cosas se leían igual: una tarjeta cortada al costado
        en vez de una fila prolija.

        Ahora el riel termina donde termina el contenedor, y entra un número
        exacto por vez —una, dos, tres o cuatro según el ancho— restando
        primero lo que ocupan las separaciones. Lo que no entra queda fuera de
        pantalla y se llega scrolleando.

        El padding vertical no es decorativo: `overflow-x: auto` recorta
        también en vertical, y sin lugar de sobra la tarjeta que se levanta al
        pasar el mouse mostraba la sombra cortada al ras.
      */}
      <div className="scrollbar-hide mt-4 flex snap-x snap-mandatory gap-5 overflow-x-auto pt-6 pb-14">
        {products.map((product, i) => (
          <div
            key={product.id}
            className="w-full shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-3.75rem)/4)]"
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
      <div className="aparece">
        <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-2 max-w-xl">{subtitle}</p>}
      </div>

      <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {products.map((product, i) => (
          <li key={product.id} className="aparece relative">
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
