import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { formatARS } from "@/utils/format";
import { leadVariant } from "@/lib/catalog";
import { FOTOS_PRODUCTO } from "@/lib/data/fotos.generado";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Tabla comparativa contra la generación anterior y la siguiente.
 *
 * Responde la pregunta que se hace todo el mundo antes de comprar un usado:
 * cuánto mejor es el que sigue y cuánto se ahorra con el anterior. Las filas
 * salen de la unión de las specs de los modelos comparados, así que si uno
 * declara algo que otro no, la fila igual aparece y el faltante se marca.
 */
/** Si la primera foto del producto es un render recortado sobre transparente. */
function esRender(slug: string): boolean {
  return FOTOS_PRODUCTO[slug]?.[0]?.recorte === "render";
}

export function ProductComparison({
  products,
  currentId,
}: {
  products: Product[];
  currentId: string;
}) {
  if (products.length < 2) return null;

  const filas = [...new Set(products.flatMap((p) => Object.keys(p.specs)))];

  return (
    <section className="mt-20">
      <h2 className="text-2xl font-semibold sm:text-3xl">Cómo se compara</h2>
      <p className="text-muted-foreground mt-2">
        El mismo modelo en la generación anterior y en la siguiente, para que veas qué
        cambia de verdad.
      </p>

      <div className="border-line bg-surface mt-8 overflow-x-auto rounded-2xl border shadow-sm">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="border-line border-b">
              <th className="text-muted-foreground w-40 px-5 py-4 text-sm font-medium">
                Modelo
              </th>
              {products.map((p) => {
                const actual = p.id === currentId;
                const lead = leadVariant(p);
                return (
                  <th
                    key={p.id}
                    className={cn("px-5 py-4 align-top", actual && "bg-elevated")}
                  >
                    <Link href={`/catalogo/${p.slug}`} className="group block">
                      {/* El render del equipo entra entero sobre blanco. Con
                          `cover` se recortaba el celular vertical a un cuadrado
                          y quedaba solo el centro de la pantalla apagada: un
                          cuadrado negro donde tenía que verse el teléfono. */}
                      <span
                        className={cn(
                          "relative block aspect-square w-24 overflow-hidden rounded-xl",
                          esRender(p.slug) ? "bg-white" : "bg-elevated"
                        )}
                      >
                        {p.images[0] && (
                          <Image
                            src={p.images[0].url}
                            alt=""
                            fill
                            sizes="96px"
                            className={cn(
                              "transition-transform duration-500 group-hover:scale-105",
                              esRender(p.slug) ? "object-contain p-2" : "object-cover"
                            )}
                          />
                        )}
                      </span>
                      <span className="text-foreground mt-3 block font-semibold">
                        {p.name}
                      </span>
                      {lead && (
                        <span className="tnum text-muted-foreground mt-0.5 block text-sm">
                          Desde {formatARS(lead.priceArs)}
                        </span>
                      )}
                      {actual && (
                        <span className="text-purple mt-1.5 inline-flex items-center gap-1 text-xs font-semibold">
                          <Check className="size-3.5" />
                          Estás viendo este
                        </span>
                      )}
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-line divide-y">
            {filas.map((fila) => (
              <tr key={fila}>
                <th
                  scope="row"
                  className="text-muted-foreground px-5 py-3.5 text-sm font-medium"
                >
                  {fila}
                </th>
                {products.map((p) => (
                  <td
                    key={p.id}
                    className={cn(
                      "text-foreground px-5 py-3.5 text-sm",
                      p.id === currentId && "bg-elevated font-medium"
                    )}
                  >
                    {p.specs[fila] ?? <span className="text-muted-foreground">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
