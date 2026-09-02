import Image from "next/image";
import Link from "next/link";
import { BatteryMedium } from "lucide-react";
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
  bueno: "bg-amber-500 text-ink",
};

/** Etiqueta de disponibilidad. Poco stock es información útil, no urgencia falsa. */
export function StockBadge({ stock, className }: { stock: number; className?: string }) {
  if (stock === 0) {
    return (
      <span className={cn("text-muted-foreground text-xs", className)}>Sin stock</span>
    );
  }
  if (stock <= 2) {
    return (
      <span className={cn("text-purple text-xs font-medium", className)}>
        {stock === 1 ? "Última unidad" : "Últimas 2 unidades"}
      </span>
    );
  }
  return (
    <span className={cn("text-muted-foreground text-xs", className)}>
      <span className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-500 align-middle" />
      En stock
    </span>
  );
}

/**
 * Tarjeta de producto.
 *
 * Sin caja alrededor: la foto va suelta con esquinas redondeadas y el texto
 * debajo, apoyado en el fondo de la página. Encajonar cada producto en un
 * recuadro blanco recarga la grilla; así los equipos respiran y la vista se lee
 * como una vidriera.
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
      className={cn("group block", stock === 0 && "opacity-55")}
    >
      <div className="bg-elevated relative aspect-square overflow-hidden rounded-2xl">
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

      <div className="mt-4">
        <p className="eyebrow text-muted-foreground">{product.category}</p>

        <h3 className="group-hover:text-purple mt-1.5 text-lg leading-tight font-medium transition-colors">
          {product.name}
        </h3>

        <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2.5 text-sm">
          <span>{lead ? lead.storage : product.model}</span>
          {lead?.batteryHealth != null && (
            <span className="inline-flex items-center gap-1">
              <BatteryMedium className="size-3.5" />
              {lead.batteryHealth}%
            </span>
          )}
        </p>

        <div className="mt-2.5 flex flex-wrap items-baseline gap-2">
          {multiplePrices && <span className="text-muted-foreground text-xs">Desde</span>}
          <span className="tnum text-purple text-xl font-semibold">
            {formatARS(lead?.priceArs ?? 0)}
          </span>
          {fullPrice !== null && (
            <span className="tnum text-muted-foreground text-sm line-through">
              {formatARS(fullPrice)}
            </span>
          )}
        </div>

        <StockBadge stock={stock} className="mt-2 block" />
      </div>
    </Link>
  );
}
