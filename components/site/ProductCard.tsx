import Image from "next/image";
import Link from "next/link";
import { formatARS } from "@/utils/format";
import { leadVariant, totalStock } from "@/lib/catalog";
import { CONDITION_LABELS, type Product } from "@/types";
import { cn } from "@/lib/utils";

/** Etiqueta de disponibilidad. Poco stock es información útil, no una urgencia falsa. */
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
  return <span className={cn("text-muted-foreground text-xs", className)}>En stock</span>;
}

export function ProductCard({ product }: { product: Product }) {
  const lead = leadVariant(product);
  const stock = totalStock(product);
  const image = product.images[0];
  const multiplePrices = new Set(product.variants.map((v) => v.priceArs)).size > 1;

  return (
    <Link
      href={`/catalogo/${product.slug}`}
      className={cn(
        "group border-line hover:border-ink/25 flex flex-col overflow-hidden rounded-2xl border bg-white transition-colors",
        stock === 0 && "opacity-60"
      )}
    >
      <div className="bg-surface relative aspect-4/3 overflow-hidden">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            Sin foto
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-ink text-[15px] leading-snug font-medium">{product.name}</h3>

        <p className="text-muted-foreground mt-1 text-xs">
          {lead ? (
            <>
              {lead.storage} · {CONDITION_LABELS[lead.condition]}
              {lead.batteryHealth !== null && ` · Batería ${lead.batteryHealth}%`}
            </>
          ) : (
            product.model
          )}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            {multiplePrices && (
              <span className="text-muted-foreground block text-[11px]">Desde</span>
            )}
            <span className="tnum text-ink text-[17px] font-semibold">
              {formatARS(lead?.priceArs ?? 0)}
            </span>
          </div>
          <StockBadge stock={stock} className="pb-0.5" />
        </div>
      </div>
    </Link>
  );
}
