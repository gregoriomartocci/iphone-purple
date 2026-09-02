import type { Metadata } from "next";
import { TradeInQuoter } from "@/components/site/TradeInQuoter";
import { PageHero, PAGE_PHOTOS } from "@/components/site/PageHero";
import { getProducts, getSettings, getTradeInPrices } from "@/lib/data";
import { GRADE_MULTIPLIER, leadVariant } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Plan Canje",
  description:
    "Cotizá tu equipo usado en dos minutos y descontalo del que te quieras llevar. Te decimos cuánto te tomamos y cuánto ponés de diferencia.",
};

export const revalidate = 600;

const STEPS = [
  {
    title: "Cotizás online",
    text: "Elegís modelo, capacidad y estado, y ves el número al instante.",
  },
  {
    title: "Lo revisamos juntos",
    text: "Traés el equipo al local y lo chequeamos delante tuyo, sin apuro.",
  },
  {
    title: "Te llevás el nuevo",
    text: "Descontamos la toma del equipo que elijas y pagás solo la diferencia.",
  },
];

export default async function TradeInPage() {
  const [prices, settings, products] = await Promise.all([
    getTradeInPrices(),
    getSettings(),
    getProducts({ sort: "precio-asc" }),
  ]);

  // Solo ofrecemos como destino lo que efectivamente se puede entregar hoy.
  const wantedOptions = products.flatMap((product) => {
    const lead = leadVariant(product);
    if (!lead || lead.stock === 0) return [];
    return [
      {
        id: product.id,
        label: `${product.name} ${lead.storage}`,
        priceArs: lead.priceArs,
      },
    ];
  });

  return (
    <>
      <PageHero
        title="Plan Canje"
        subtitle="Tu equipo usado vale plata. Cotizalo acá en dos minutos y descontá ese valor del que te quieras llevar."
        image={PAGE_PHOTOS.planCanje}
      />

      <div className="shell py-12 sm:py-16">
        <div>
          <TradeInQuoter
            prices={prices}
            gradeMultipliers={GRADE_MULTIPLIER}
            wantedOptions={wantedOptions}
            dollarRate={settings.dollarRate}
            whatsappNumber={settings.whatsappNumber}
          />
        </div>

        <section className="border-line mt-24 border-t pt-14">
          <h2 className="text-2xl font-semibold">Cómo funciona</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <span className="tnum bg-surface text-foreground inline-flex size-8 items-center justify-center rounded-full text-sm font-medium">
                  {i + 1}
                </span>
                <h3 className="text-foreground mt-4 font-medium">{step.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-surface mt-20 rounded-2xl p-8 sm:p-10">
          <h2 className="text-xl font-semibold">Lo que conviene saber</h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-foreground text-sm font-medium">
                ¿Recibís equipos con la pantalla rota?
              </dt>
              <dd className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                Sí, pero esos los cotizamos aparte porque el descuento depende del daño.
                Escribinos con una foto y te pasamos el número.
              </dd>
            </div>
            <div>
              <dt className="text-foreground text-sm font-medium">
                ¿Necesito la caja y los accesorios?
              </dt>
              <dd className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                No son obligatorios, pero suman al valor de toma. La factura original
                también ayuda.
              </dd>
            </div>
            <div>
              <dt className="text-foreground text-sm font-medium">
                ¿Qué pasa con mi cuenta de iCloud?
              </dt>
              <dd className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                Tenés que cerrar sesión y desactivar «Buscar mi iPhone» antes de
                entregarlo. Si no sabés cómo, lo hacemos juntos en el local.
              </dd>
            </div>
            <div>
              <dt className="text-foreground text-sm font-medium">
                ¿Puedo canjear sin comprar?
              </dt>
              <dd className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                Sí. También compramos equipos sueltos, aunque el valor de toma es un poco
                menor que canjeándolo por otro.
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </>
  );
}
