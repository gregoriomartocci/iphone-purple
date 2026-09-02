import Image from "next/image";
import Link from "next/link";
import { BatteryMedium } from "lucide-react";
import { formatARS } from "@/utils/format";
import { leadVariant, savingsVsNew, totalStock } from "@/lib/catalog";
import type { VariantFilters } from "@/lib/catalog";
import { CATEGORY_LABELS, GRADE_LABELS, type Grade, type Product } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Color por grado.
 *
 * Que cada grado tenga el suyo permite barrer la grilla de un vistazo y saber
 * qué es sellado y qué es seminuevo sin leer cada tarjeta.
 */
const GRADE_STYLES: Record<Grade, string> = {
  sellado: "bg-purple text-white",
  "a-plus": "bg-emerald-600 text-white",
  a: "bg-sky-600 text-white",
  "a-minus": "bg-amber-500 text-ink",
};

/** Etiqueta de disponibilidad. Poco stock es información útil, no urgencia falsa. */
export function StockBadge({ stock, className }: { stock: number; className?: string }) {
  if (stock === 0) {
    return (
      <span className={cn("text-muted-foreground text-sm", className)}>Sin stock</span>
    );
  }
  if (stock <= 2) {
    return (
      <span className={cn("text-purple text-sm font-medium", className)}>
        {stock === 1 ? "Última unidad" : "Últimas 2 unidades"}
      </span>
    );
  }
  return (
    <span className={cn("text-muted-foreground text-sm", className)}>
      <span className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-500 align-middle" />
      En stock
    </span>
  );
}

/**
 * Tarjeta de producto.
 *
 * Va en una tarjeta blanca sobre el gris de la página: el contorno le da peso
 * y separa cada equipo del fondo, que es lo que hace que la grilla se lea como
 * una vidriera y no como una lista suelta.
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
  const savings = lead ? savingsVsNew(product, lead) : null;
  const fullPrice = savings !== null && lead ? lead.priceArs + savings : null;

  return (
    <Link
      href={`/catalogo/${product.slug}`}
      className={cn(
        "group border-line bg-surface flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-[0_16px_36px_-14px_rgba(16,16,20,0.28)]",
        stock === 0 && "opacity-60"
      )}
    >
      <div className="bg-elevated relative aspect-square overflow-hidden">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 340px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            Sin foto
          </div>
        )}

        {lead && (
          <span
            className={cn(
              "absolute top-3 left-3 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide uppercase",
              GRADE_STYLES[lead.grade]
            )}
          >
            {GRADE_LABELS[lead.grade]}
          </span>
        )}

        {lead?.authenticity === "replica" && (
          <span className="absolute bottom-3 left-3 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase">
            Réplica
          </span>
        )}

        {savings !== null && (
          <span className="absolute top-3 right-3 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
            −{formatARS(savings)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow text-muted-foreground">
          {CATEGORY_LABELS[product.category]}
        </p>

        <h3 className="group-hover:text-purple mt-2 text-xl leading-tight font-semibold transition-colors">
          {product.name}
        </h3>

        <p className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 text-[15px]">
          <span>{lead ? lead.storage : product.model}</span>
          {lead?.color && <span>{lead.color}</span>}
          {lead?.batteryHealth != null && (
            <span className="inline-flex items-center gap-1">
              <BatteryMedium className="size-4" />
              {lead.batteryHealth}%
            </span>
          )}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-baseline gap-2">
            {multiplePrices && (
              <span className="text-muted-foreground text-sm">Desde</span>
            )}
            <span className="tnum text-purple text-2xl font-bold">
              {formatARS(lead?.priceArs ?? 0)}
            </span>
            {fullPrice !== null && (
              <span className="tnum text-muted-foreground text-[15px] line-through">
                {formatARS(fullPrice)}
              </span>
            )}
          </div>

          <StockBadge stock={stock} className="border-line mt-3 block border-t pt-3" />
        </div>
      </div>
    </Link>
  );
}
