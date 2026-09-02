"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { BatteryMedium, Check, ShieldCheck, Truck, Wrench } from "lucide-react";
import { WhatsAppLink } from "./WhatsAppLink";
import { AddToCart } from "@/components/cart/AddToCart";
import { savingsVsNew } from "@/lib/catalog";
import { FOTOS_PRODUCTO } from "@/lib/data/fotos.generado";
import { productMessage } from "@/lib/whatsapp";
import { formatARS, formatUSD } from "@/utils/format";
import {
  GRADE_LABELS,
  GRADE_SPECS,
  type Grade,
  type Product,
  type Variant,
} from "@/types";
import { cn } from "@/lib/utils";

const GRADE_STYLES: Record<Grade, string> = {
  sellado: "bg-purple text-white",
  "a-plus": "bg-emerald-600 text-white",
  a: "bg-sky-600 text-white",
  "a-minus": "bg-amber-500 text-ink",
};

const GARANTIAS = [
  { icon: ShieldCheck, text: "Garantía escrita de 6 meses, con factura." },
  {
    icon: BatteryMedium,
    text: "Batería, piezas originales y bloqueo de iCloud verificados.",
  },
  { icon: Wrench, text: "Servicio técnico propio si algo falla." },
  { icon: Truck, text: "Envío a todo el país o retiro en el local." },
];

/**
 * Ficha de producto con selector de variante.
 *
 * Acá va todo el detalle que la tarjeta del catálogo deliberadamente no
 * muestra: grado con su definición, batería exacta, colores, comparación
 * contra el sellado y especificaciones.
 *
 * Es cliente porque elegir capacidad o color cambia el precio y, sobre todo,
 * el mensaje de WhatsApp: el vendedor tiene que recibir exactamente qué equipo
 * miró la persona, no solo el modelo.
 */
export function ProductDetail({
  product,
  whatsappNumber,
}: {
  product: Product;
  whatsappNumber: string;
}) {
  // Arrancamos en la variante que la tarjeta mostró: la más barata con stock.
  const initial = useMemo(() => {
    const withStock = product.variants.filter((v) => v.stock > 0);
    const pool = withStock.length > 0 ? withStock : product.variants;
    return [...pool].sort((a, b) => a.priceArs - b.priceArs)[0];
  }, [product.variants]);

  const [selected, setSelected] = useState<Variant | undefined>(initial);
  const [imageIndex, setImageIndex] = useState(0);

  const storages = [...new Set(product.variants.map((v) => v.storage))];
  const image = product.images[imageIndex] ?? product.images[0];

  /**
   * Fotos del producto real, con su autoría. Cuando existen se encuadran
   * enteras y se muestra el crédito; cuando no, lo que hay es una foto
   * ambiental de la familia y no corresponde acreditar a nadie.
   */
  const propias = FOTOS_PRODUCTO[product.slug];
  const credito = propias?.[imageIndex] ?? propias?.[0];

  /** Variantes de la capacidad elegida: definen los grados y colores ofrecidos. */
  const sameStorage = product.variants.filter((v) => v.storage === selected?.storage);

  const savings = selected ? savingsVsNew(product, selected) : null;
  const fullPrice = savings !== null && selected ? selected.priceArs + savings : null;

  const variantLabel = selected
    ? `${selected.storage} · ${selected.color} · ${GRADE_LABELS[selected.grade]}`
    : undefined;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-14">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="border-line bg-surface relative aspect-square overflow-hidden rounded-3xl border shadow-sm">
          {image && (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 620px"
              // Las fotos propias del producto entran completas: recortarlas
              // le come el borde al equipo. Las genéricas son ambientales y sí
              // se recortan, porque encuadrarlas enteras deja aire muerto.
              className={cn(propias ? "object-contain p-6" : "object-cover")}
            />
          )}

          {selected && (
            <span
              className={cn(
                "absolute top-5 left-5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase",
                GRADE_STYLES[selected.grade]
              )}
            >
              {GRADE_LABELS[selected.grade]}
            </span>
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
                  "relative size-20 overflow-hidden rounded-xl border transition-colors",
                  i === imageIndex
                    ? "border-purple"
                    : "border-line hover:border-foreground/30"
                )}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="80px"
                  className={cn(propias ? "object-contain p-1.5" : "object-cover")}
                />
              </button>
            ))}
          </div>
        )}

        {credito && (
          // Las licencias Creative Commons obligan a dar crédito. Va discreto
          // pero visible, y se cae solo cuando la foto es propia del local.
          <p className="text-muted-foreground mt-3 text-xs">
            Foto:{" "}
            <a
              href={credito.origen}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground underline underline-offset-2"
            >
              {credito.autor}
            </a>{" "}
            · {credito.licencia}
          </p>
        )}
      </div>

      <div>
        <p className="eyebrow text-muted-foreground">{product.brand}</p>
        <h1 className="mt-2 text-3xl leading-tight font-semibold sm:text-4xl">
          {product.name}
        </h1>

        {selected?.authenticity === "replica" && (
          <p className="mt-4 rounded-xl border border-amber-500/50 bg-amber-500/10 p-3.5 text-sm leading-relaxed text-amber-900">
            <strong className="font-semibold">Esto es una réplica.</strong> No es un
            producto original de la marca ni cuenta con su garantía oficial.
          </p>
        )}

        {/* Bloque de precio: lo primero que se busca al entrar. */}
        <div className="border-line bg-surface mt-6 rounded-2xl border p-6 shadow-sm">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="tnum text-foreground text-4xl font-semibold">
              {formatARS(selected?.priceArs ?? 0)}
            </span>
            {fullPrice !== null && (
              <span className="tnum text-muted-foreground text-lg line-through">
                {formatARS(fullPrice)}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-sm">
            {selected && selected.priceUsd > 0 && (
              <span className="tnum text-muted-foreground">
                ≈ {formatUSD(selected.priceUsd)}
              </span>
            )}
            {savings !== null && (
              <span className="font-medium text-emerald-700">
                Ahorrás {formatARS(savings)} contra el sellado
              </span>
            )}
          </div>

          <p className="mt-4 flex items-center gap-2 text-sm">
            {(selected?.stock ?? 0) > 0 ? (
              <>
                <span className="inline-block size-2 rounded-full bg-emerald-500" />
                <span className="text-foreground">
                  {selected!.stock <= 2
                    ? `Queda${selected!.stock === 1 ? "" : "n"} ${selected!.stock}`
                    : "Disponible"}{" "}
                  para entrega inmediata
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Sin stock por ahora</span>
            )}
          </p>

          {/* Dos caminos, sin obligar a ninguno: quien quiere resolverlo solo
              compra, y quien prefiere preguntar antes escribe. */}
          <div className="mt-5 flex flex-col gap-2.5">
            <AddToCart product={product} variant={selected} className="w-full" />
            <WhatsAppLink
              number={whatsappNumber}
              message={productMessage(product.name, variantLabel)}
              variant="outline"
              className="w-full"
            >
              {(selected?.stock ?? 0) > 0
                ? "Consultar por WhatsApp"
                : "Avisame cuando entre"}
            </WhatsAppLink>
          </div>
        </div>

        {storages.length > 1 && (
          <div className="mt-8">
            <h2 className="text-foreground text-sm font-medium">Capacidad</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {storages.map((storage) => {
                const active = selected?.storage === storage;
                return (
                  <button
                    key={storage}
                    type="button"
                    onClick={() => {
                      // Al cambiar capacidad saltamos a la más barata de esa capacidad.
                      const next = product.variants
                        .filter((v) => v.storage === storage)
                        .sort((a, b) => a.priceArs - b.priceArs)[0];
                      setSelected(next);
                    }}
                    className={cn(
                      "h-11 rounded-xl border px-5 text-sm font-medium transition-all duration-200",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-line bg-surface hover:border-foreground/40"
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
            <h2 className="text-foreground text-sm font-medium">Estado y color</h2>
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
                      "bg-surface flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all duration-200",
                      active
                        ? "border-foreground shadow-sm"
                        : "border-line hover:border-foreground/30",
                      variant.stock === 0 && "cursor-not-allowed opacity-45"
                    )}
                  >
                    <span
                      className="size-7 shrink-0 rounded-full border border-black/10"
                      style={{ background: variant.colorHex }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="text-foreground block truncate text-sm font-medium">
                        {variant.color} · {GRADE_LABELS[variant.grade]}
                      </span>
                      <span className="text-muted-foreground block text-xs">
                        {/*
                          La aclaración sale del grado, no de si hay batería:
                          una consola o un accesorio seminuevo no reporta
                          batería, y guiarse por eso los describía como
                          "sellado, sin uso" aunque fueran usados.
                        */}
                        {variant.grade === "sellado"
                          ? "Sellado, sin uso"
                          : variant.batteryHealth !== null
                            ? `Batería ${variant.batteryHealth}%`
                            : GRADE_SPECS[variant.grade].cosmetic}
                        {variant.stock === 0 && " · sin stock"}
                      </span>
                    </span>
                    <span className="tnum text-foreground shrink-0 text-sm font-semibold">
                      {formatARS(variant.priceArs)}
                    </span>
                    {active && <Check className="text-purple size-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selected && (
          <div className="border-line bg-elevated mt-8 rounded-2xl border p-5">
            <p className="text-foreground text-sm font-medium">
              Qué significa &laquo;{GRADE_LABELS[selected.grade]}&raquo;
            </p>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
              {GRADE_SPECS[selected.grade].cosmetic} {GRADE_SPECS[selected.grade].battery}
            </p>
          </div>
        )}

        <ul className="mt-8 space-y-3">
          {GARANTIAS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="text-muted-foreground flex items-start gap-3 text-sm"
            >
              <Icon className="text-purple mt-0.5 size-4 shrink-0" />
              {text}
            </li>
          ))}
        </ul>

        {product.description && (
          <p className="text-muted-foreground mt-8 leading-relaxed">
            {product.description}
          </p>
        )}

        {Object.keys(product.specs).length > 0 && (
          <div className="border-line bg-surface mt-8 overflow-hidden rounded-2xl border">
            <h2 className="border-line bg-elevated text-foreground border-b px-5 py-3.5 text-sm font-medium">
              Especificaciones
            </h2>
            <dl className="divide-line divide-y">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex gap-4 px-5 py-3 text-sm">
                  <dt className="text-muted-foreground w-36 shrink-0">{key}</dt>
                  <dd className="text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
