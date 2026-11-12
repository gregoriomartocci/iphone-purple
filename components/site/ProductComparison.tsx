import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { leadVariant } from "@/lib/catalog";
import { fotoDe } from "@/lib/data/fotos";
import { Precio } from "./Precio";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Comparación contra la generación anterior y la siguiente.
 *
 * Responde la pregunta que se hace todo el mundo antes de comprar un usado:
 * cuánto mejor es el que sigue y cuánto se ahorra con el anterior. Las filas
 * salen de la unión de las specs de los modelos comparados, así que si uno
 * declara algo que otro no, la fila igual aparece y el faltante se marca.
 *
 * Es una grilla y no una tabla con desplazamiento lateral. En el teléfono la
 * tabla medía 680 px: se veía la primera columna y el modelo que se estaba
 * mirando quedaba afuera, a la derecha, sin ninguna pista de que había que
 * deslizar. Ahora cada modelo es una columna del mismo ancho y el nombre de
 * cada dato va arriba, a todo lo ancho, así entran los tres en 360 px.
 */
export function ProductComparison({
  products,
  currentId,
}: {
  products: Product[];
  currentId: string;
}) {
  if (products.length < 2) return null;

  const filas = [...new Set(products.flatMap((p) => Object.keys(p.specs)))];
  const columnas = { gridTemplateColumns: `repeat(${products.length}, minmax(0, 1fr))` };

  return (
    <section className="mt-20">
      <h2 className="text-2xl font-semibold sm:text-3xl">Cómo se compara</h2>
      <p className="text-muted-foreground mt-2">
        El mismo modelo en la generación anterior y en la siguiente, para que veas qué
        cambia de verdad.
      </p>

      <div className="border-line bg-surface mt-8 overflow-hidden rounded-2xl border shadow-sm">
        <div className="border-line grid border-b" style={columnas}>
          {products.map((p) => {
            const actual = p.id === currentId;
            const lead = leadVariant(p);
            const foto = p.images[0];
            const datos = foto ? fotoDe(foto.url) : undefined;
            const render = datos?.recorte === "render";
            return (
              <Link
                key={p.id}
                href={`/catalogo/${p.slug}`}
                aria-current={actual ? "page" : undefined}
                className={cn(
                  "group block min-w-0 px-2.5 py-4 sm:px-5",
                  actual && "bg-elevated"
                )}
              >
                {/* El recorte del equipo entra entero, sobre su propio fondo.
                    Con `cover` se recortaba el celular vertical a un cuadrado
                    y quedaba solo el centro de la pantalla apagada. */}
                <span
                  className={cn(
                    "relative mx-auto block aspect-square w-full max-w-28 overflow-hidden rounded-xl",
                    !render && "bg-elevated"
                  )}
                  style={render ? { background: datos?.fondo ?? "#ffffff" } : undefined}
                >
                  {foto && (
                    <Image
                      src={foto.url}
                      alt=""
                      fill
                      sizes="112px"
                      className={cn(
                        "transition-transform duration-500 group-hover:scale-105",
                        render ? "object-contain p-2" : "object-cover"
                      )}
                    />
                  )}
                </span>
                <span className="text-foreground mt-3 block text-sm leading-snug font-semibold sm:text-base">
                  {p.name}
                </span>
                {lead && (
                  // Sigue la moneda elegida, igual que la tarjeta y la ficha.
                  <Precio
                    ars={lead.priceArs}
                    usd={lead.priceUsd}
                    desde
                    fuerte="0.875rem"
                    suave="0.75rem"
                    className="mt-0.5"
                  />
                )}
                {actual && (
                  <span className="text-foreground mt-1.5 inline-flex items-center gap-1 text-xs font-semibold">
                    <Check className="size-3.5 shrink-0" />
                    Estás viendo este
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <dl className="divide-line divide-y">
          {filas.map((fila) => (
            <div key={fila} className="py-3">
              <dt className="text-muted-foreground px-2.5 text-xs font-medium sm:px-5">
                {fila}
              </dt>
              <div className="mt-1 grid" style={columnas}>
                {products.map((p) => (
                  <dd
                    key={p.id}
                    className={cn(
                      "text-foreground min-w-0 px-2.5 text-sm break-words sm:px-5",
                      p.id === currentId && "font-medium"
                    )}
                  >
                    {p.specs[fila] ?? <span className="text-muted-foreground">—</span>}
                  </dd>
                ))}
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
