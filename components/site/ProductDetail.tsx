"use client";

import { useMemo, useState } from "react";
import { BatteryMedium, Check, ShieldCheck, Truck, Wrench } from "lucide-react";
import { WhatsAppLink } from "./WhatsAppLink";
import { AddToCart } from "@/components/cart/AddToCart";
import { Galeria } from "./Galeria";
import { Precio } from "./Precio";
import { antiguedadCotizacion } from "@/lib/moneda";
import { savingsVsNew } from "@/lib/catalog";
import { FOTOS_PRODUCTO } from "@/lib/data/fotos.generado";
import { productMessage } from "@/lib/whatsapp";
import { formatARS } from "@/utils/format";
import {
  GRADE_LABELS,
  GRADE_SPECS,
  type Grade,
  type Product,
  type Variant,
} from "@/types";
import { cn } from "@/lib/utils";

const GRADE_STYLES: Record<Grade, string> = {
  sellado: "bg-ink text-white",
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
  dollarRate,
  dollarRateUpdatedAt,
}: {
  product: Product;
  whatsappNumber: string;
  dollarRate: number;
  dollarRateUpdatedAt: string;
}) {
  const cotizacion = antiguedadCotizacion(dollarRateUpdatedAt);
  // Arrancamos en la variante que la tarjeta mostró: la más barata con stock.
  const initial = useMemo(() => {
    const withStock = product.variants.filter((v) => v.stock > 0);
    const pool = withStock.length > 0 ? withStock : product.variants;
    return [...pool].sort((a, b) => a.priceArs - b.priceArs)[0];
  }, [product.variants]);

  const [selected, setSelected] = useState<Variant | undefined>(initial);

  const storages = [...new Set(product.variants.map((v) => v.storage))];

  /**
   * Fotos del producto real, con su autoría. Cuando existen se muestra el
   * crédito; cuando no, lo que hay es una foto ambiental de la familia y no
   * corresponde acreditar a nadie.
   */
  const propias = FOTOS_PRODUCTO[product.slug];
  // Solo se acredita lo que tiene autor. Una foto propia, comprada o bajada
  // de la sala de prensa del fabricante no tiene a quién acreditar, y la
  // línea de crédito vacía quedaba colgada abajo de la galería.
  const credito = propias?.find(
    (f): f is typeof f & { autor: string; origen: string } => !!f.autor && !!f.origen
  );

  /**
   * Piezas de la galería.
   *
   * El video va último a propósito: primero se quiere ver el equipo quieto y
   * desde todos los ángulos, y recién después cómo se ve andando.
   */
  const piezas = product.images.map((img, i) => ({
    url: img.url,
    alt: img.alt,
    render: propias?.[i]?.recorte === "render",
    video: propias?.[i]?.video ?? false,
  }));

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
        <div className="relative">
          <Galeria piezas={piezas} nombre={product.name} />

          {selected && (
            <span
              className={cn(
                "pointer-events-none absolute top-5 left-5 z-10 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase",
                GRADE_STYLES[selected.grade]
              )}
            >
              {GRADE_LABELS[selected.grade]}
            </span>
          )}
        </div>

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
          <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            <Precio
              ars={selected?.priceArs ?? 0}
              usd={selected?.priceUsd ?? 0}
              fuerte="2.25rem"
              suave="1rem"
            />
            {fullPrice !== null && (
              <span className="tnum text-muted-foreground pb-1 text-lg line-through">
                {formatARS(fullPrice)}
              </span>
            )}
          </div>

          {savings !== null && (
            <p className="mt-1.5 text-sm font-medium text-emerald-700">
              Ahorrás {formatARS(savings)} contra el sellado
            </p>
          )}

          {/*
            La cotización, dicha en voz alta.

            Es la pregunta que aparece igual en cada consulta por WhatsApp —"¿a
            cuánto lo tomás?"— y contestarla antes de que la hagan es lo que
            hace que el precio en dólares se lea como un ancla y no como un
            número de adorno. Va con la antigüedad al lado: si la cotización
            quedó vieja, que se vea.
          */}
          {cotizacion && (
            <p className="text-muted-foreground mt-3 text-xs">
              Tomamos el dólar a{" "}
              <span className="tnum text-foreground">{formatARS(dollarRate)}</span> ·{" "}
              {cotizacion}
            </p>
          )}

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
                    {active && <Check className="text-foreground size-4 shrink-0" />}
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
              <Icon className="text-foreground mt-0.5 size-4 shrink-0" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
