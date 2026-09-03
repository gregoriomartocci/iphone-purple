import type { Metadata } from "next";
import { TradeInQuoter } from "@/components/site/TradeInQuoter";
import { PageHero, PAGE_PHOTOS } from "@/components/site/PageHero";
import { getProducts, getSettings, getTradeInPrices } from "@/lib/data";
import { GRADE_MULTIPLIER, leadVariant } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Plan Canje: entregá tu iPhone usado",
  description:
    "Entregá tu iPhone usado como parte de pago. Cotizalo en dos minutos, te decimos cuánto te tomamos y cuánto ponés de diferencia por el equipo que elijas. Tomamos solo equipos Apple, en La Plata.",
  alternates: { canonical: "/plan-canje" },
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
        subtitle="Tomamos tu iPhone usado como parte de pago. Cotizalo acá en dos minutos y descontá ese valor del equipo que te quieras llevar."
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

        {/* Cada paso en su tarjeta: sueltos sobre el fondo gris se leían como
            párrafos y no como una secuencia de tres. */}
        <section className="mt-16 sm:mt-20">
          <h2 className="text-2xl font-semibold sm:text-3xl">Cómo funciona</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="border-line bg-surface rounded-2xl border p-6 shadow-sm"
              >
                <span className="tnum border-purple/25 bg-purple/8 text-purple inline-flex size-10 items-center justify-center rounded-xl border text-sm font-semibold">
                  {i + 1}
                </span>
                <h3 className="text-foreground mt-4 font-medium">{step.title}</h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16 sm:mt-20">
          <h2 className="text-2xl font-semibold sm:text-3xl">Lo que conviene saber</h2>
          <dl className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="border-line bg-surface rounded-2xl border p-6 shadow-sm">
              <dt className="text-foreground font-medium">
                ¿Recibís equipos con la pantalla rota?
              </dt>
              <dd className="text-muted-foreground mt-2 leading-relaxed">
                Sí, pero esos los cotizamos aparte porque el descuento depende del daño.
                Escribinos con una foto y te pasamos el número.
              </dd>
            </div>
            <div className="border-line bg-surface rounded-2xl border p-6 shadow-sm">
              <dt className="text-foreground font-medium">
                ¿Necesito la caja y los accesorios?
              </dt>
              <dd className="text-muted-foreground mt-2 leading-relaxed">
                No son obligatorios, pero suman al valor de toma. La factura original
                también ayuda.
              </dd>
            </div>
            <div className="border-line bg-surface rounded-2xl border p-6 shadow-sm">
              <dt className="text-foreground font-medium">
                ¿Qué pasa con mi cuenta de iCloud?
              </dt>
              <dd className="text-muted-foreground mt-2 leading-relaxed">
                Tenés que cerrar sesión y desactivar «Buscar mi iPhone» antes de
                entregarlo. Si no sabés cómo, lo hacemos juntos en el local.
              </dd>
            </div>
            <div className="border-line bg-surface rounded-2xl border p-6 shadow-sm">
              <dt className="text-foreground font-medium">¿Puedo canjear sin comprar?</dt>
              <dd className="text-muted-foreground mt-2 leading-relaxed">
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
