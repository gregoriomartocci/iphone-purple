import Image from "next/image";
import Link from "next/link";
import { formatARS } from "@/utils/format";
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
  // Foto del equipo recortado sobre transparente: se muestra sobre blanco.
  const propia = FOTOS_PRODUCTO[product.slug]?.[0]?.recorte === "render";
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
      {/* La foto va más ancha que alta y el texto ocupa lo mínimo: así la
          tarjeta entera queda con proporción pareja en vez de alargada, que
          es lo que pasaba con una foto cuadrada más cuatro líneas debajo.

          Fondo blanco cuando la imagen es el equipo recortado: así se ve como
          una foto de catálogo y todas las tarjetas quedan parejas. Las fotos
          ambientales van sobre el gris, que las contiene mejor. */}
      <div
        className={cn(
          "relative aspect-4/3 overflow-hidden",
          propia ? "bg-white" : "bg-elevated"
        )}
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
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            Sin foto
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="text-foreground text-base leading-snug font-medium">
          {product.name}
        </h3>

        <p className="text-muted-foreground mt-0.5 text-sm">{detalle.join(" · ")}</p>

        <div className="mt-auto flex items-baseline gap-1.5 pt-3">
          {multiplePrices && <span className="text-muted-foreground text-xs">Desde</span>}
          <span className="tnum text-foreground text-xl font-semibold">
            {formatARS(lead?.priceArs ?? 0)}
          </span>
        </div>
      </div>
    </Link>
  );
}
