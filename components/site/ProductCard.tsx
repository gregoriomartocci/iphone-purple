import Image from "next/image";
import Link from "next/link";
import { formatARS } from "@/utils/format";
import { leadVariant, totalStock } from "@/lib/catalog";
import type { VariantFilters } from "@/lib/catalog";
import { CATEGORY_LABELS, GRADE_LABELS, type Product } from "@/types";
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
}: {
  product: Product;
  /** Filtros activos del catálogo, para que la tarjeta muestre lo que se pidió. */
  filters?: VariantFilters;
}) {
  const lead = leadVariant(product, filters);
  const stock = totalStock(product);
  const image = product.images[0];
  const multiplePrices = new Set(product.variants.map((v) => v.priceArs)).size > 1;

  const detalle = [
    lead?.storage,
    lead && GRADE_LABELS[lead.grade],
    lead?.authenticity === "replica" ? "Réplica" : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/catalogo/${product.slug}`}
      className={cn(
        "group border-line bg-surface flex flex-col overflow-hidden rounded-2xl border transition-all duration-300",
        "hover:border-foreground/20 hover:shadow-[0_14px_32px_-16px_rgba(16,16,20,0.25)]",
        stock === 0 && "opacity-55"
      )}
    >
      <div className="bg-elevated relative aspect-square overflow-hidden">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 340px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            Sin foto
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow text-muted-foreground">
          {CATEGORY_LABELS[product.category]}
        </p>

        <h3 className="text-foreground mt-2 text-lg leading-snug font-medium">
          {product.name}
        </h3>

        <p className="text-muted-foreground mt-1 text-sm">{detalle.join(" · ")}</p>

        <div className="mt-auto flex items-baseline gap-2 pt-5">
          {multiplePrices && <span className="text-muted-foreground text-sm">Desde</span>}
          <span className="tnum text-foreground text-xl font-semibold">
            {formatARS(lead?.priceArs ?? 0)}
          </span>
        </div>
      </div>
    </Link>
  );
}
