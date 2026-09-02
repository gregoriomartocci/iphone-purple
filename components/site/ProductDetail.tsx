"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { BatteryMedium, Check, ShieldCheck } from "lucide-react";
import { WhatsAppLink } from "./WhatsAppLink";
import { StockBadge } from "./ProductCard";
import { productMessage } from "@/lib/whatsapp";
import { formatARS, formatUSD } from "@/utils/format";
import { CONDITION_LABELS, type Product, type Variant } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Ficha de producto con selector de variante.
 *
 * Es cliente porque elegir capacidad/estado cambia el precio y, sobre todo, el
 * mensaje de WhatsApp: el vendedor tiene que recibir exactamente qué equipo miró
 * la persona, no solo el modelo.
 */
export function ProductDetail({
  product,
  whatsappNumber,
}: {
  product: Product;
  whatsappNumber: string;
}) {
  // Arrancamos en la variante que la tarjeta mostró en el catálogo: la más barata con stock.
  const initial = useMemo(() => {
    const withStock = product.variants.filter((v) => v.stock > 0);
    const pool = withStock.length > 0 ? withStock : product.variants;
    return [...pool].sort((a, b) => a.priceArs - b.priceArs)[0];
  }, [product.variants]);

  const [selected, setSelected] = useState<Variant | undefined>(initial);
  const [imageIndex, setImageIndex] = useState(0);

  const storages = [...new Set(product.variants.map((v) => v.storage))];
  const image = product.images[imageIndex] ?? product.images[0];

  /** Variantes que comparten la capacidad elegida: definen los estados ofrecidos. */
  const sameStorage = product.variants.filter((v) => v.storage === selected?.storage);

  const variantLabel = selected
    ? `${selected.storage} · ${selected.color} · ${CONDITION_LABELS[selected.condition]}`
    : undefined;

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <div className="bg-surface relative aspect-square overflow-hidden rounded-2xl">
          {image && (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
          )}
        </div>

        {product.images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {product.images.map((img, i) => (
              <button
                key={img.url}
                type="button"
                onClick={() => setImageIndex(i)}
                aria-label={`Ver foto ${i + 1}`}
                className={cn(
                  "relative size-16 overflow-hidden rounded-lg border transition-colors",
                  i === imageIndex ? "border-ink" : "border-line hover:border-ink/40"
                )}
              >
                <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-muted-foreground text-sm">{product.brand}</p>
        <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">{product.name}</h1>

        <div className="mt-5 flex items-baseline gap-3">
          <span className="tnum text-ink text-3xl font-semibold">
            {formatARS(selected?.priceArs ?? 0)}
          </span>
          {selected && selected.priceUsd > 0 && (
            <span className="tnum text-muted-foreground text-sm">
              ≈ {formatUSD(selected.priceUsd)}
            </span>
          )}
        </div>
        <StockBadge stock={selected?.stock ?? 0} className="mt-2 block" />

        {storages.length > 1 && (
          <div className="mt-8">
            <h2 className="text-ink text-sm font-medium">Capacidad</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {storages.map((storage) => {
                const active = selected?.storage === storage;
                return (
                  <button
                    key={storage}
                    type="button"
                    onClick={() => {
                      // Al cambiar capacidad, saltamos a la variante más barata de esa capacidad.
                      const next = product.variants
                        .filter((v) => v.storage === storage)
                        .sort((a, b) => a.priceArs - b.priceArs)[0];
                      setSelected(next);
                    }}
                    className={cn(
                      "h-10 rounded-full border px-5 text-sm transition-colors",
                      active
                        ? "border-ink bg-ink text-white"
                        : "border-line text-ink hover:border-ink/40"
                    )}
                  >
                    {storage}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {sameStorage.length > 1 && (
          <div className="mt-6">
            <h2 className="text-ink text-sm font-medium">Estado y color</h2>
            <div className="mt-3 space-y-2">
              {sameStorage.map((variant) => {
                const active = selected?.id === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelected(variant)}
                    disabled={variant.stock === 0}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                      active ? "border-ink" : "border-line hover:border-ink/40",
                      variant.stock === 0 && "cursor-not-allowed opacity-45"
                    )}
                  >
                    <span
                      className="size-6 shrink-0 rounded-full border border-black/10"
                      style={{ background: variant.colorHex }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="text-ink block truncate text-sm">
                        {variant.color} · {CONDITION_LABELS[variant.condition]}
                      </span>
                      <span className="text-muted-foreground block text-xs">
                        {variant.batteryHealth !== null
                          ? `Batería ${variant.batteryHealth}%`
                          : "Sellado"}
                        {variant.stock === 0 && " · sin stock"}
                      </span>
                    </span>
                    <span className="tnum text-ink shrink-0 text-sm font-medium">
                      {formatARS(variant.priceArs)}
                    </span>
                    {active && <Check className="text-purple size-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <WhatsAppLink
          number={whatsappNumber}
          message={productMessage(product.name, variantLabel)}
          className="mt-8 w-full"
        >
          {selected && selected.stock > 0
            ? "Consultar por WhatsApp"
            : "Avisame cuando entre"}
        </WhatsAppLink>

        <div className="text-muted-foreground mt-5 space-y-2.5 text-sm">
          <p className="flex items-start gap-2.5">
            <ShieldCheck className="text-purple mt-0.5 size-4 shrink-0" />
            Garantía escrita de 6 meses y factura.
          </p>
          <p className="flex items-start gap-2.5">
            <BatteryMedium className="text-purple mt-0.5 size-4 shrink-0" />
            Batería, piezas originales y bloqueo de iCloud verificados antes de publicar.
          </p>
        </div>

        {product.description && (
          <p className="text-muted-foreground mt-8 leading-relaxed">
            {product.description}
          </p>
        )}

        {Object.keys(product.specs).length > 0 && (
          <div className="mt-8">
            <h2 className="text-ink text-sm font-medium">Especificaciones</h2>
            <dl className="divide-line border-line mt-3 divide-y border-t">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex gap-4 py-2.5 text-sm">
                  <dt className="text-muted-foreground w-32 shrink-0">{key}</dt>
                  <dd className="text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
