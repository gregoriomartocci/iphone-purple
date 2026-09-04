import { Sparkles } from "lucide-react";
import { descripcionDe } from "@/lib/data/descripcion";
import type { Product } from "@/types";

/**
 * Descripción de venta del equipo.
 *
 * Abre el recorrido de abajo de la ficha: antes de los datos duros hay que
 * poder contar en dos párrafos qué trae este modelo que no traía el anterior,
 * que es la pregunta real de alguien comparando dos generaciones.
 *
 * Cuando no hay descripción propia —un producto que no es un iPhone conocido—
 * cae en la línea corta del catálogo en vez de inventar un texto.
 */
export function Descripcion({ product }: { product: Product }) {
  const d = descripcionDe(product);

  if (!d) {
    if (!product.description) return null;
    return (
      <section className="mt-14 sm:mt-16">
        <h2 className="text-2xl font-semibold sm:text-3xl">Sobre este equipo</h2>
        <p className="text-muted-foreground prosa mt-4 leading-relaxed">
          {product.description}
        </p>
      </section>
    );
  }

  return (
    <section className="mt-14 sm:mt-16">
      <div className="border-line bg-surface overflow-hidden rounded-2xl border shadow-sm">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <div>
            <p className="eyebrow text-foreground">Sobre este equipo</p>
            <h2 className="mt-2 text-2xl leading-snug font-semibold sm:text-3xl">
              {d.titular}
            </h2>
            <p className="text-muted-foreground prosa mt-4 leading-relaxed">{d.cuerpo}</p>
          </div>

          {/* Los mismos puntos que el párrafo, en formato escaneable: mucha
              gente no lee el texto y baja directo buscando viñetas. */}
          <ul className="divide-line border-line divide-y rounded-xl border">
            {d.destacados.map((punto) => (
              <li key={punto} className="flex items-start gap-3 px-4 py-3.5">
                <Sparkles className="text-foreground mt-0.5 size-4 shrink-0" />
                <span className="text-foreground text-sm leading-relaxed">{punto}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
