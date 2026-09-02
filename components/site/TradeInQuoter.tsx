"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { WhatsAppLink } from "./WhatsAppLink";
import { submitTradeIn } from "@/app/(store)/plan-canje/actions";
import { tradeInMessage } from "@/lib/whatsapp";
import { formatARS, formatUSD } from "@/utils/format";
import { CONDITION_LABELS, CONDITIONS, type Condition, type TradeInPrice } from "@/types";
import { cn } from "@/lib/utils";

type WantedOption = { id: string; label: string; priceArs: number };

const CONDITION_HELP: Record<Condition, string> = {
  nuevo: "Sellado, sin abrir.",
  "como-nuevo": "Sin marcas de uso. Batería sobre 95 %.",
  "muy-bueno": "Micromarcas que no se ven de frente. Batería sobre 88 %.",
  bueno: "Rayas visibles o batería entre 80 y 88 %.",
};

/**
 * Cotizador del Plan Canje.
 *
 * Muestra el mismo cálculo que publicamos: valor base del modelo por el ajuste
 * de estado. Es una estimación, no una oferta cerrada — el número final sale de
 * ver el equipo, y eso se dice en pantalla en lugar de esconderlo.
 */
export function TradeInQuoter({
  prices,
  conditionMultipliers,
  wantedOptions,
  dollarRate,
  whatsappNumber,
}: {
  prices: TradeInPrice[];
  conditionMultipliers: Record<Condition, number>;
  wantedOptions: WantedOption[];
  dollarRate: number;
  whatsappNumber: string;
}) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState("");
  const [condition, setCondition] = useState<Condition | "">("");
  const [wantedId, setWantedId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const brands = useMemo(() => [...new Set(prices.map((p) => p.brand))].sort(), [prices]);

  const models = useMemo(
    () => [...new Set(prices.filter((p) => p.brand === brand).map((p) => p.model))],
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
    match && condition
      ? Math.round((match.baseValue * conditionMultipliers[condition]) / 5) * 5
      : null;

  const estimateArs = estimateUsd === null ? null : estimateUsd * dollarRate;

  const wanted = wantedOptions.find((o) => o.id === wantedId);
  const difference =
    wanted && estimateArs !== null ? Math.max(0, wanted.priceArs - estimateArs) : null;

  const ready = Boolean(match && condition && estimateUsd !== null);

  const waMessage =
    ready && estimateArs !== null
      ? tradeInMessage(
          `${brand} ${model} ${storage}`,
          CONDITION_LABELS[condition as Condition],
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
        condition: condition as Condition,
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
    "h-12 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-ink outline-none transition-colors focus-visible:border-purple disabled:bg-surface disabled:text-muted-foreground";

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      <div>
        <h2 className="text-ink text-sm font-medium">1. Contanos qué equipo tenés</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <select
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setModel("");
              setStorage("");
            }}
            aria-label="Marca"
            className={fieldClass}
          >
            <option value="">Marca</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setStorage("");
            }}
            disabled={!brand}
            aria-label="Modelo"
            className={fieldClass}
          >
            <option value="">Modelo</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={storage}
            onChange={(e) => setStorage(e.target.value)}
            disabled={!model}
            aria-label="Capacidad"
            className={fieldClass}
          >
            <option value="">Capacidad</option>
            {storages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <h2 className="text-ink mt-10 text-sm font-medium">2. ¿En qué estado está?</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCondition(c)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                condition === c
                  ? "border-ink bg-surface"
                  : "border-line hover:border-ink/40"
              )}
            >
              <span className="text-ink block text-sm font-medium">
                {CONDITION_LABELS[c]}
              </span>
              <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                {CONDITION_HELP[c]}
              </span>
            </button>
          ))}
        </div>

        {wantedOptions.length > 0 && (
          <>
            <h2 className="text-ink mt-10 text-sm font-medium">
              3. ¿Qué te querés llevar?{" "}
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </h2>
            <select
              value={wantedId}
              onChange={(e) => setWantedId(e.target.value)}
              aria-label="Equipo que te querés llevar"
              className={cn(fieldClass, "mt-4")}
            >
              <option value="">Todavía no sé</option>
              {wantedOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label} — {formatARS(o.priceArs)}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Resultado: pegajoso en desktop para que el número acompañe mientras se elige. */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
          {!ready ? (
            <div className="py-8 text-center">
              <p className="text-ink font-medium">Completá los datos de tu equipo</p>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                En cuanto elijas modelo, capacidad y estado te mostramos cuánto te tomamos
                por él.
              </p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground text-sm">Te tomamos tu equipo por</p>
              <p className="tnum text-ink mt-1 text-4xl font-semibold">
                {formatARS(estimateArs ?? 0)}
              </p>
              <p className="tnum text-muted-foreground mt-1 text-sm">
                ≈ {formatUSD(estimateUsd ?? 0)}
              </p>

              {wanted && difference !== null && (
                <div className="border-line mt-6 border-t pt-6">
                  <p className="text-muted-foreground text-sm">
                    Llevándote un {wanted.label}, ponés
                  </p>
                  <p className="tnum text-purple mt-1 text-3xl font-semibold">
                    {formatARS(difference)}
                  </p>
                </div>
              )}

              <p className="text-muted-foreground mt-6 text-xs leading-relaxed">
                Es una estimación según lo que nos contaste. El valor final lo confirmamos
                al ver el equipo — si está como lo describiste, lo respetamos.
              </p>

              {sent ? (
                <div className="mt-6">
                  <p className="text-ink text-sm font-medium">
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
                    className={cn(fieldClass, "bg-white")}
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Tu teléfono"
                    type="tel"
                    autoComplete="tel"
                    required
                    className={cn(fieldClass, "bg-white")}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
