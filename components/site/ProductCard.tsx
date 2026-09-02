import Image from "next/image";
import Link from "next/link";
import { formatARS } from "@/utils/format";
import { leadVariant, totalStock } from "@/lib/catalog";
import { FOTOS_PRODUCTO } from "@/lib/data/fotos.generado";
import { CON_ETIQUETA_VENDIDO } from "@/lib/data/destacados";
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
  const masVendido = CON_ETIQUETA_VENDIDO.has(product.slug);
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
      {/* Fondo blanco cuando la imagen es el equipo recortado: así se ve como
          una foto de catálogo y todas las tarjetas quedan parejas. Las fotos
          ambientales van sobre el gris, que las contiene mejor. */}
      <div
        className={cn(
          "relative aspect-square overflow-hidden",
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

        {masVendido && (
          // Va sobre la foto y no arriba del nombre: es una señal de qué mirar
          // mientras se recorre la grilla, no un dato del equipo.
          <span className="bg-purple absolute bottom-3 left-3 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white uppercase">
            Más vendido
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="eyebrow text-muted-foreground">
          {CATEGORY_LABELS[product.category]}
        </p>

        <h3 className="text-foreground mt-2 text-base leading-snug font-medium sm:text-lg">
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
