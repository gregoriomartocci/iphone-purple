import Image from "next/image";
import Link from "next/link";
import { Camera } from "lucide-react";
import { Precio } from "./Precio";
import { leadVariant, totalStock } from "@/lib/catalog";
import { FOTOS_PRODUCTO } from "@/lib/data/fotos.generado";
import type { VariantFilters } from "@/lib/catalog";
import { GRADE_LABELS, type Product } from "@/types";
import { cn } from "@/lib/utils";

/** Etiqueta de disponibilidad, en texto y sin color. */
export function StockBadge({ stock, className }: { stock: number; className?: string }) {
  if (stock === 0) {
    return (
      <span className={cn("text-muted-foreground text-sm", className)}>Sin stock</span>
    );
  }
  if (stock <= 2) {
    return (
      <span className={cn("text-foreground text-sm", className)}>
        {stock === 1 ? "Última unidad" : "Últimas 2 unidades"}
      </span>
    );
  }
  return <span className={cn("text-muted-foreground text-sm", className)}>En stock</span>;
}

/**
 * Tarjeta de producto.
 *
 * Deliberadamente sobria: foto, nombre, una línea de datos y el precio. Todo
 * lo demás —specs, batería exacta, comparación de precios, colores
 * disponibles— vive en la ficha, donde hay lugar para explicarlo. Una grilla
 * con etiquetas de colores en cada tarjeta compite consigo misma y hace que
 * ninguna destaque.
 *
 * La única excepción es la réplica: eso se dice siempre, porque callarlo en
 * el listado sería engañoso. Va como texto, no como etiqueta de color.
 */
export function ProductCard({
  product,
  filters,
  index = 0,
}: {
  product: Product;
  /** Filtros activos del catálogo, para que la tarjeta muestre lo que se pidió. */
  filters?: VariantFilters;
  /** Posición en la grilla, para escalonar la animación de entrada. */
  index?: number;
}) {
  const lead = leadVariant(product, filters);
  const stock = totalStock(product);
  const image = product.images[0];
  // Recorte de estudio: se muestra entero, sobre su propio fondo. La grilla
  // siempre muestra la primera foto, que es el recorte cuando lo hay.
  const primera = FOTOS_PRODUCTO[product.slug]?.[0];
  const propia = primera?.recorte === "render";
  const multiplePrices = new Set(product.variants.map((v) => v.priceArs)).size > 1;

  const detalle = [
    lead?.storage,
    lead && GRADE_LABELS[lead.grade],
    lead?.authenticity === "replica" ? "Réplica" : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/catalogo/${product.slug}`}
      // El retraso se corta a los 300 ms: más allá, la última fila tardaría
      // tanto en aparecer que se sentiría lenta en vez de fluida.
      style={{ "--delay": `${Math.min(index * 45, 300)}ms` } as React.CSSProperties}
      className={cn(
        "group border-line bg-surface rise-in flex flex-col overflow-hidden rounded-2xl border shadow-sm",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:-translate-y-1.5 hover:border-transparent",
        "hover:shadow-[0_22px_45px_-18px_rgba(16,16,22,0.35)]",
        stock === 0 && "opacity-55"
      )}
    >
      {/* La foto va cuadrada en todos los tamaños. Más ancha que alta la
          tarjeta quedaba más compacta, pero el equipo —que es vertical— se
          veía diminuto en el medio, con aire a los costados. Acá lo que
          importa es que se vea el teléfono.

          Fondo blanco cuando la imagen es el equipo recortado: así se ve como
          una foto de catálogo y todas las tarjetas quedan parejas. Las fotos
          ambientales van sobre el gris, que las contiene mejor. */}
      <div
        className={cn("relative aspect-square overflow-hidden", !propia && "bg-elevated")}
        // El color sale de medir el borde de la propia imagen. Con un blanco
        // fijo, un recorte sobre negro quedaba con un marco oscuro alrededor.
        style={propia ? { background: primera?.fondo ?? "#ffffff" } : undefined}
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
            className={cn(
              "transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]",
              // Igual que en la ficha: la foto del producto entra completa,
              // la ambiental se recorta.
              propia ? "object-contain p-3" : "object-cover"
            )}
          />
        ) : (
          // Sin foto propia no se rellena con una genérica: mostrar otro equipo
          // donde va este engaña a quien compra. Se dice que falta, con el
          // nombre bien grande para que la tarjeta siga siendo reconocible.
          <div className="bg-elevated flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <Camera className="text-muted-foreground/50 size-7" />
            <span className="text-foreground text-sm leading-snug font-medium">
              {product.name}
            </span>
            <span className="text-muted-foreground text-xs">Foto en camino</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="text-foreground text-base leading-snug font-medium">
          {product.name}
        </h3>

        <p className="text-muted-foreground mt-0.5 text-sm">{detalle.join(" · ")}</p>

        <div className="mt-auto pt-3">
          <Precio
            ars={lead?.priceArs ?? 0}
            usd={lead?.priceUsd ?? 0}
            desde={multiplePrices}
          />
        </div>
      </div>
    </Link>
  );
}
