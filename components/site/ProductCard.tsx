import Image from "next/image";
import Link from "next/link";
import { BatteryMedium, ArrowRight } from "lucide-react";
import { formatARS } from "@/utils/format";
import { leadVariant, savingsVsNew, totalStock } from "@/lib/catalog";
import {
  CONDITION_LABELS,
  type CatalogFilters,
  type Condition,
  type Product,
} from "@/types";
import { cn } from "@/lib/utils";

/**
 * Color por estado.
 *
 * Que cada estado tenga el suyo permite barrer la grilla de un vistazo y saber
 * qué es sellado y qué es usado sin leer cada tarjeta.
 */
const CONDITION_STYLES: Record<Condition, string> = {
  nuevo: "bg-purple text-white",
  "como-nuevo": "bg-emerald-600 text-white",
  "muy-bueno": "bg-sky-600 text-white",
  bueno: "bg-amber-500 text-[#1f1f26]",
};

/** Etiqueta de disponibilidad. Poco stock es información útil, no urgencia falsa. */
export function StockBadge({ stock, className }: { stock: number; className?: string }) {
  if (stock === 0) {
    return <span className={cn("text-xs text-neutral-400", className)}>Sin stock</span>;
  }
  if (stock <= 2) {
    return (
      <span className={cn("text-purple text-xs font-medium", className)}>
        {stock === 1 ? "Última unidad" : "Últimas 2 unidades"}
      </span>
    );
  }
  return (
    <span className={cn("text-xs text-neutral-500", className)}>
      <span className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-500 align-middle" />
      En stock
    </span>
  );
}

/**
 * Tarjeta de producto.
 *
 * Va en blanco sobre el fondo oscuro del sitio: es lo que hace que la foto y el
 * precio se lean de un saque y le da el aire comercial de una tienda. El hover
 * levanta la tarjeta con una sombra, sin resplandores de color.
 */
export function ProductCard({
  product,
  filters,
}: {
  product: Product;
  /** Filtros activos del catálogo, para que la tarjeta muestre lo que se pidió. */
  filters?: Pick<CatalogFilters, "condition" | "storage">;
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
        "group flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.45)]",
        stock === 0 && "opacity-60"
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 380px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            Sin foto
          </div>
        )}

        {lead && (
          <span
            className={cn(
              "absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase",
              CONDITION_STYLES[lead.condition]
            )}
          >
            {CONDITION_LABELS[lead.condition]}
          </span>
        )}

        {savings !== null && (
          <span className="absolute top-3 right-3 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white">
            −{formatARS(savings)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg leading-tight font-medium text-neutral-900">
          {product.name}
        </h3>

        <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 text-sm text-neutral-500">
          <span>{lead ? lead.storage : product.model}</span>
          {lead?.batteryHealth != null && (
            <span className="inline-flex items-center gap-1">
              <BatteryMedium className="size-3.5" />
              {lead.batteryHealth}%
            </span>
          )}
        </p>

        <div className="mt-auto pt-5">
          {multiplePrices && (
            <span className="block text-xs text-neutral-400">Desde</span>
          )}
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="tnum text-2xl font-semibold text-neutral-900">
              {formatARS(lead?.priceArs ?? 0)}
            </span>
            {fullPrice !== null && (
              <span className="tnum text-sm text-neutral-400 line-through">
                {formatARS(fullPrice)}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3">
            <StockBadge stock={stock} />
            <span className="text-purple inline-flex items-center gap-1 text-sm font-medium">
              Ver
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
