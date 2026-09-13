"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  BatteryMedium,
  Check,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { WhatsAppLink } from "./WhatsAppLink";
import { AddToCart } from "@/components/cart/AddToCart";
import { Galeria } from "./Galeria";
import { Precio } from "./Precio";
import { antiguedadCotizacion } from "@/lib/moneda";
import { ordenarPorColor, savingsVsNew } from "@/lib/catalog";
import { FOTOS_PRODUCTO } from "@/lib/data/fotos.generado";
import { IMITADOS } from "@/lib/data/replicas";
import { productMessage } from "@/lib/whatsapp";
import { formatARS } from "@/utils/format";
import {
  AUTHENTICITY_LABELS,
  GRADE_LABELS,
  GRADE_SPECS,
  type Grade,
  type Product,
  type Variant,
} from "@/types";
import { cn, esClaro } from "@/lib/utils";

const GRADE_STYLES: Record<Grade, string> = {
  sellado: "bg-ink text-white",
  "a-plus": "bg-emerald-600 text-white",
  a: "bg-sky-600 text-white",
  "a-minus": "bg-amber-500 text-ink",
};

/**
 * Qué respalda al equipo. La primera línea depende de qué es.
 *
 * Solo los originales que tienen una réplica a la venta —ver
 * lib/data/replicas.ts— dicen "original" con todas las letras: ahí es donde
 * alguien duda, y ahí importa la diferencia concreta, que en Apple sellado
 * es la garantía oficial de Apple de un año. En el resto del catálogo nadie
 * pregunta si el iPhone es original, y decirlo lo volvía sospechoso. Una
 * réplica no recibe la línea —el aviso ámbar de arriba ya lo dijo— y se queda
 * con lo que el local sí respalda.
 */
function garantiasDe(variant: Variant | undefined, brand: string, imitado: boolean) {
  const original = imitado && variant?.authenticity === "original";
  const selladoApple = original && brand === "Apple" && variant?.grade === "sellado";
  return [
    selladoApple && {
      icon: BadgeCheck,
      text: `Producto original Apple, sellado, con 1 año de garantía oficial de Apple.`,
    },
    original &&
      !selladoApple && { icon: BadgeCheck, text: `Producto original ${brand}.` },
    { icon: ShieldCheck, text: "Garantía escrita de 6 meses, con factura." },
    {
      icon: BatteryMedium,
      text: "Batería, piezas originales y bloqueo de iCloud verificados.",
    },
    { icon: Wrench, text: "Servicio técnico propio si algo falla." },
    { icon: Truck, text: "Envío a todo el país o retiro en el local." },
  ].filter((g): g is { icon: typeof ShieldCheck; text: string } => Boolean(g));
}

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
  /** Si el local vende una réplica de este producto. */
  const imitado = IMITADOS.has(product.slug);
  // Arrancamos en la variante que la tarjeta mostró: la más barata con stock.
  const initial = useMemo(() => {
    const withStock = product.variants.filter((v) => v.stock > 0);
    const pool = withStock.length > 0 ? withStock : product.variants;
    return [...pool].sort((a, b) => a.priceArs - b.priceArs)[0];
  }, [product.variants]);

  const [selected, setSelected] = useState<Variant | undefined>(initial);

  /**
   * Batería de ESTA unidad. Un seminuevo es un teléfono concreto, y el blanco
   * de 256 puede estar al 97 % y el negro al 84 %: el número acompaña a la
   * variante elegida y cambia con ella. Un sellado no la informa: es nueva.
   */
  const bateria =
    selected && selected.grade !== "sellado" && selected.batteryHealth !== null
      ? selected.batteryHealth
      : null;

  const storages = [...new Set(product.variants.map((v) => v.storage))];

  /**
   * Colores en que se vende el equipo, con la muestra de la primera variante
   * que lo tiene. Es lo que va arriba de todo: antes de capacidad y estado,
   * porque es lo primero que alguien decide y lo que cambia lo que ve.
   */
  const colores = useMemo(() => {
    const vistos = new Map<string, string>();
    for (const v of product.variants)
      if (!vistos.has(v.color)) vistos.set(v.color, v.colorHex);
    return [...vistos].map(([color, hex]) => ({ color, hex }));
  }, [product.variants]);

  /**
   * Elegir un color es elegir una variante de ese color, la más parecida a la
   * que ya estaba: misma capacidad y grado si existe, si no misma capacidad,
   * si no cualquiera con stock, y si no la que haya. Así el precio y el
   * botón de comprar siguen apuntando a algo real.
   */
  function elegirColor(color: string) {
    const del = product.variants.filter((v) => v.color === color);
    const next =
      del.find(
        (v) =>
          v.storage === selected?.storage && v.grade === selected?.grade && v.stock > 0
      ) ??
      del.find((v) => v.storage === selected?.storage && v.stock > 0) ??
      del.find((v) => v.stock > 0) ??
      del[0];
    if (next) setSelected(next);
  }

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
  const piezas = ordenarPorColor(
    product.images.map((img, i) => ({
      url: img.url,
      alt: img.alt,
      render: propias?.[i]?.recorte === "render",
      fondo: propias?.[i]?.fondo ?? null,
      video: propias?.[i]?.video ?? false,
      colores: img.colores,
    })),
    selected?.color
  );

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
          {/* La `key` remonta la galería al cambiar de color: vuelve a la
              primera foto, que ahora es la del color elegido. */}
          <Galeria key={selected?.color ?? ""} piezas={piezas} nombre={product.name} />

          {selected && (
            <div className="pointer-events-none absolute top-5 left-5 z-10 flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase",
                  GRADE_STYLES[selected.grade]
                )}
              >
                {GRADE_LABELS[selected.grade]}
              </span>
              {/* La batería al lado del grado: en un usado son las dos cosas
                  que se miran primero, y van juntas sobre la foto. */}
              {bateria !== null && (
                <span className="border-line text-foreground tnum inline-flex items-center gap-1.5 rounded-full border bg-white/90 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                  <BatteryMedium className="size-3.5" aria-hidden />
                  {bateria}%
                </span>
              )}
            </div>
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
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="eyebrow text-muted-foreground">{product.brand}</p>
          {/* La autenticidad al lado de la marca, antes que el nombre, y solo
              donde hay una réplica a la venta del mismo producto: es lo que
              quien sabe que acá también hay réplicas quiere confirmar primero. */}
          {selected && (selected.authenticity === "replica" || imitado) && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
                selected.authenticity === "replica"
                  ? "bg-amber-500 text-white"
                  : "border-line text-foreground border bg-white"
              )}
            >
              {selected.authenticity === "original" && (
                <BadgeCheck className="size-3.5" aria-hidden />
              )}
              {AUTHENTICITY_LABELS[selected.authenticity]}
            </span>
          )}
        </div>
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

        {colores.length > 1 && (
          <div className="mt-8">
            <h2 className="text-foreground text-sm font-medium">
              Color
              {selected && (
                <span className="text-muted-foreground ml-2 font-normal">
                  {selected.color}
                </span>
              )}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {colores.map(({ color, hex }) => {
                const active = selected?.color === color;
                const hayStock = product.variants.some(
                  (v) => v.color === color && v.stock > 0
                );
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => elegirColor(color)}
                    aria-label={hayStock ? color : `${color}, sin stock`}
                    aria-pressed={active}
                    title={color}
                    className={cn(
                      "relative size-10 rounded-full border transition-all duration-200 hover:scale-110",
                      active
                        ? "border-foreground ring-foreground/20 ring-2"
                        : "border-black/15 hover:border-black/35",
                      !hayStock && "opacity-45"
                    )}
                    style={{ background: hex }}
                  >
                    {active && (
                      <Check
                        className="absolute inset-0 m-auto size-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                        style={{ color: esClaro(hex) ? "#16161a" : "#ffffff" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
          {garantiasDe(selected, product.brand, imitado).map(({ icon: Icon, text }) => (
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
