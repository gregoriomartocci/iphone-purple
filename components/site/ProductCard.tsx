import Image from "next/image";
import Link from "next/link";
import { BatteryMedium } from "lucide-react";
import { formatARS } from "@/utils/format";
import { leadVariant, savingsVsNew, totalStock } from "@/lib/catalog";
import { CONDITION_LABELS, type Condition, type Product } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Color por estado.
 *
 * Que cada estado tenga el suyo permite barrer la grilla de un vistazo y saber
 * qué es sellado y qué es usado sin leer cada tarjeta.
 */
const CONDITION_STYLES: Record<Condition, string> = {
  nuevo: "bg-purple/90 text-white",
  "como-nuevo": "bg-emerald-500/90 text-white",
  "muy-bueno": "bg-sky-500/90 text-white",
  bueno: "bg-amber-500/90 text-white",
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
      <span className={cn("text-purple-light text-xs font-medium", className)}>
        {stock === 1 ? "Última unidad" : "Últimas 2 unidades"}
      </span>
    );
  }
  return (
    <span className={cn("text-muted-foreground text-xs", className)}>
      <span className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-400 align-middle" />
      En stock
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const lead = leadVariant(product);
  const stock = totalStock(product);
  const image = product.images[0];
  const multiplePrices = new Set(product.variants.map((v) => v.priceArs)).size > 1;
  const savings = lead ? savingsVsNew(product, lead) : null;

  return (
    <Link
      href={`/catalogo/${product.slug}`}
      className={cn(
        "group border-line bg-surface hover:border-purple/60 relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300",
        "hover:shadow-[0_0_0_1px_rgba(124,58,237,0.25),0_18px_50px_-20px_rgba(124,58,237,0.55)]",
        stock === 0 && "opacity-55"
      )}
    >
      <div className="bg-ink relative aspect-square overflow-hidden">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
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
              "absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm",
              CONDITION_STYLES[lead.condition]
            )}
          >
            {CONDITION_LABELS[lead.condition]}
          </span>
        )}

        {savings !== null && (
          <span className="absolute top-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-emerald-300 backdrop-blur-sm">
            Ahorrás {formatARS(savings)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-foreground text-[15px] leading-snug font-medium">
          {product.name}
        </h3>

        <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 text-xs">
          <span>{lead ? lead.storage : product.model}</span>
          {lead?.batteryHealth != null && (
            <span className="inline-flex items-center gap-1">
              <BatteryMedium className="size-3" />
              {lead.batteryHealth}%
            </span>
          )}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            {multiplePrices && (
              <span className="text-muted-foreground block text-[11px]">Desde</span>
            )}
            <span className="price text-foreground block text-xl font-semibold">
              {formatARS(lead?.priceArs ?? 0)}
            </span>
          </div>
          <StockBadge stock={stock} className="pb-1" />
        </div>
      </div>
    </Link>
  );
}
