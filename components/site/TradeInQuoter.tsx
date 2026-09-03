"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowRight, Calculator, Loader2 } from "lucide-react";
import { WhatsAppLink } from "./WhatsAppLink";
import { Buscador } from "./Buscador";
import { submitTradeIn } from "@/app/(store)/plan-canje/actions";
import { tradeInMessage } from "@/lib/whatsapp";
import { formatARS, formatUSD } from "@/utils/format";
import {
  GRADE_LABELS,
  GRADE_SPECS,
  GRADES,
  type Grade,
  type TradeInPrice,
} from "@/types";
import { cn } from "@/lib/utils";

type WantedOption = { id: string; label: string; priceArs: number };

/**
 * Cotizador del Plan Canje.
 *
 * Muestra el mismo cálculo que publicamos: valor base del modelo por el ajuste
 * de estado. Es una estimación, no una oferta cerrada — el número final sale de
 * ver el equipo, y eso se dice en pantalla en lugar de esconderlo.
 */
export function TradeInQuoter({
  prices,
  gradeMultipliers,
  wantedOptions,
  dollarRate,
  whatsappNumber,
}: {
  prices: TradeInPrice[];
  gradeMultipliers: Record<Grade, number>;
  wantedOptions: WantedOption[];
  dollarRate: number;
  whatsappNumber: string;
}) {
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState("");
  const [grade, setCondition] = useState<Grade | "">("");
  const [wantedId, setWantedId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  /**
   * Solo tomamos Apple, así que la marca no se pregunta: sale de la tabla de
   * valores, que hoy tiene una sola. Un desplegable con una única opción es
   * fricción pura, y además decir "solo Apple" en pantalla evita que alguien
   * cargue un Samsung y se lleve la decepción al final.
   *
   * Si algún día se toman otras marcas, la tabla tendrá más de una y el
   * selector vuelve solo, sin tocar este componente.
   */
  const brands = useMemo(() => [...new Set(prices.map((p) => p.brand))].sort(), [prices]);
  const brand = brands.length === 1 ? brands[0] : "";

  /** Modelos como opciones del buscador: con 21 un desplegable se recorre a ojo. */
  const opcionesModelo = useMemo(
    () =>
      [...new Set(prices.filter((p) => p.brand === brand).map((p) => p.model))].map(
        (m) => ({ id: m, label: m })
      ),
    [prices, brand]
  );

  const storages = useMemo(
    () =>
      [
        ...new Set(
          prices
            .filter((p) => p.brand === brand && p.model === model)
            .map((p) => p.storage)
        ),
      ].sort((a, b) => parseInt(a, 10) - parseInt(b, 10)),
    [prices, brand, model]
  );

  const match = prices.find(
    (p) => p.brand === brand && p.model === model && p.storage === storage
  );

  const estimateUsd =
    match && grade
      ? Math.round((match.baseValue * gradeMultipliers[grade]) / 5) * 5
      : null;

  const estimateArs = estimateUsd === null ? null : estimateUsd * dollarRate;

  const wanted = wantedOptions.find((o) => o.id === wantedId);
  const difference =
    wanted && estimateArs !== null ? Math.max(0, wanted.priceArs - estimateArs) : null;

  const ready = Boolean(match && grade && estimateUsd !== null);

  const waMessage =
    ready && estimateArs !== null
      ? tradeInMessage(
          `${brand} ${model} ${storage}`,
          GRADE_LABELS[grade as Grade],
          formatARS(estimateArs),
          wanted?.label
        )
      : "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!ready || estimateUsd === null) return;

    startTransition(async () => {
      const result = await submitTradeIn({
        brand,
        model,
        storage,
        grade: grade as Grade,
        estimatedValue: estimateUsd,
        wantedProductId: wanted?.id ?? null,
        contactName: name.trim(),
        contactPhone: phone.trim(),
        notes: wanted ? `Le interesa: ${wanted.label}` : null,
      });

      if (result.ok) setSent(true);
      else setError(result.error);
    });
  }

  const fieldClass =
    "h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] text-foreground outline-none transition-colors focus-visible:border-purple disabled:bg-surface disabled:text-muted-foreground";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
      {/* Todo lo que se completa vive en una tarjeta blanca sobre el fondo
          gris: antes eran campos sueltos y el formulario no se distinguía de
          la página. */}
      <div className="border-line bg-surface overflow-hidden rounded-2xl border shadow-sm">
        <div className="border-line bg-elevated border-b px-6 py-5 sm:px-8">
          <p className="eyebrow text-muted-foreground">Tu equipo</p>
          <h2 className="mt-1.5 text-xl font-semibold">¿Qué nos entregás?</h2>
          {brand && (
            <p className="text-muted-foreground mt-1.5 text-sm">
              Solo tomamos equipos {brand}. Si tenés otra marca,{" "}
              <span className="text-foreground">escribinos igual</span> y lo vemos.
            </p>
          )}
        </div>

        <div className="space-y-8 px-6 py-7 sm:px-8">
          <div>
            <StepTitle n={1}>Elegí tu modelo</StepTitle>
            <div className="mt-4">
              <Buscador
                opciones={opcionesModelo}
                valor={model}
                onChange={(id) => {
                  setModel(id);
                  setStorage("");
                }}
                etiqueta="Modelo de tu equipo"
                placeholder="Escribí el modelo: 13 Pro, 15, XR…"
                vacio="No tomamos ese modelo. Escribinos y lo vemos igual."
              />
            </div>
          </div>

          {/* La capacidad son dos o tres opciones: como fichas se eligen de un
              toque, sin abrir un desplegable. */}
          <div>
            <StepTitle n={2}>¿Qué capacidad tiene?</StepTitle>
            {model ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {storages.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStorage(s)}
                    className={cn(
                      "h-11 rounded-xl border px-5 text-[15px] font-medium transition-colors",
                      storage === s
                        ? "border-purple bg-purple/8 text-foreground"
                        : "border-line text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground mt-3 text-sm">
                Elegí primero el modelo.
              </p>
            )}
          </div>

          <div>
            <StepTitle n={3}>¿En qué estado está?</StepTitle>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {GRADES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    grade === c
                      ? "border-purple bg-purple/8"
                      : "border-line hover:border-foreground/30"
                  )}
                >
                  <span className="text-foreground block text-sm font-medium">
                    {GRADE_LABELS[c]}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                    {`${GRADE_SPECS[c].cosmetic} ${GRADE_SPECS[c].battery}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {wantedOptions.length > 0 && (
            <div className="border-line border-t pt-7">
              <StepTitle n={4}>
                ¿Qué te querés llevar?{" "}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </StepTitle>
              {/* Acá sí entra cualquier equipo del catálogo, no solo Apple:
                  lo que se restringe es lo que tomamos, no lo que vendemos. */}
              <p className="text-muted-foreground mt-2 text-sm">
                Cualquier equipo del catálogo. Buscalo y te decimos la diferencia.
              </p>
              <div className="mt-4">
                <Buscador
                  opciones={wantedOptions.map((o) => ({
                    id: o.id,
                    label: o.label,
                    detalle: formatARS(o.priceArs),
                  }))}
                  valor={wantedId}
                  onChange={setWantedId}
                  etiqueta="Equipo que te querés llevar"
                  placeholder="Buscá el equipo que querés"
                  vacio="No tenemos ese equipo hoy."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resultado: pegajoso en desktop para que el número acompañe mientras se elige. */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="border-line bg-surface overflow-hidden rounded-2xl border shadow-sm">
          {!ready ? (
            <div className="px-6 py-12 text-center sm:px-8">
              <span className="border-purple/25 bg-purple/8 text-purple mx-auto flex size-12 items-center justify-center rounded-2xl border">
                <Calculator className="size-5" />
              </span>
              <p className="text-foreground mt-5 font-medium">
                Tu cotización aparece acá
              </p>
              <p className="text-muted-foreground mx-auto mt-2 max-w-xs text-sm leading-relaxed">
                Elegí modelo, capacidad y estado, y te mostramos al instante cuánto te
                tomamos por tu equipo.
              </p>
            </div>
          ) : (
            <>
              {/* El número va sobre tinta: es el dato por el que se entra a
                  esta página y tiene que ganarle a todo lo demás. */}
              <div className="bg-ink px-6 py-7 text-white sm:px-8">
                <p className="text-sm text-white/60">Te tomamos tu equipo por</p>
                <p className="tnum mt-1 text-4xl font-semibold sm:text-5xl">
                  {formatARS(estimateArs ?? 0)}
                </p>
                <p className="tnum mt-1 text-sm text-white/50">
                  ≈ {formatUSD(estimateUsd ?? 0)}
                </p>

                {wanted && difference !== null && (
                  <div className="mt-6 border-t border-white/15 pt-5">
                    <p className="text-sm text-white/60">
                      Llevándote un {wanted.label}, ponés
                    </p>
                    <p className="tnum mt-1 text-3xl font-semibold">
                      {formatARS(difference)}
                    </p>
                  </div>
                )}
              </div>

              <div className="px-6 py-6 sm:px-8">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Es una estimación según lo que nos contaste. El valor final lo
                  confirmamos al ver el equipo — si está como lo describiste, lo
                  respetamos.
                </p>

                {sent ? (
                  <div className="mt-6">
                    <p className="text-foreground text-sm font-medium">
                      Listo, ya tenemos tu consulta.
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Te escribimos en el día. Si querés, seguimos ahora por WhatsApp.
                    </p>
                    <WhatsAppLink
                      number={whatsappNumber}
                      message={waMessage}
                      className="mt-4 w-full"
                    >
                      Seguir por WhatsApp
                    </WhatsAppLink>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      autoComplete="name"
                      required
                      className={cn(fieldClass, "bg-elevated")}
                    />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Tu teléfono"
                      type="tel"
                      autoComplete="tel"
                      required
                      className={cn(fieldClass, "bg-elevated")}
                    />

                    {error && <p className="text-destructive text-sm">{error}</p>}

                    <button
                      type="submit"
                      disabled={pending}
                      className="bg-ink hover:bg-ink/85 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-white transition-colors disabled:opacity-60"
                    >
                      {pending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          Quiero coordinar
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </button>

                    <WhatsAppLink
                      number={whatsappNumber}
                      message={waMessage}
                      variant="outline"
                      className="w-full"
                    >
                      Prefiero escribir directo
                    </WhatsAppLink>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Título de paso, con el número en un círculo para que la secuencia se lea. */
function StepTitle({
  n,
  children,
  className,
}: {
  n: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-foreground flex items-center gap-3 text-lg font-semibold",
        className
      )}
    >
      <span className="border-purple text-purple flex size-7 shrink-0 items-center justify-center rounded-full border bg-white text-sm font-semibold">
        {n}
      </span>
      {children}
    </h2>
  );
}
