import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, RefreshCcw, ShieldCheck, Smartphone, Wrench } from "lucide-react";
import { Hero } from "@/components/site/Hero";
import { ProductRail } from "@/components/site/ProductRail";
import { Faq, faqJsonLd } from "@/components/site/Faq";
import { getBestsellers, getNewArrivals, getPosts } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  // La portada es la que compite por "iPhone La Plata", así que lleva el
  // título completo y no el de la plantilla.
  title: {
    absolute: "iPhone Purple — Comprar iPhone y productos Apple en La Plata",
  },
  description:
    "Venta de iPhone, iPad, Mac y Apple Watch en La Plata, con garantía escrita y factura. Stock real publicado, Plan Canje por tu usado y servicio técnico propio.",
  alternates: { canonical: "/" },
};

export const revalidate = 600;

const SHORTCUTS = [
  {
    href: "/catalogo",
    icon: Smartphone,
    title: "Ver el catálogo",
    text: "Todo lo que tenemos hoy, con precio y stock actualizado.",
  },
  {
    href: "/plan-canje",
    icon: RefreshCcw,
    title: "Plan Canje",
    text: "Cotizá tu equipo usado y descontalo del que te quieras llevar.",
  },
  {
    href: "/reparaciones",
    icon: Wrench,
    title: "Reparaciones",
    text: "Pantalla, batería, pin de carga. Diagnóstico sin cargo.",
  },
];

/**
 * Foto de la banda de Plan Canje.
 *
 * Cuenta el canje sin tener que explicarlo: a la izquierda el equipo que se
 * entrega —dorso rayado, pantalla partida—, a la derecha el que se lleva,
 * impecable. Antes eran dos renders del catálogo con una flecha en el medio;
 * decían lo mismo, pero sin el contraste de ver un equipo gastado al lado de
 * uno nuevo, que es todo el argumento del canje.
 */
const CANJE_FOTO = "/plan-canje.jpg";

const TRUST = [
  {
    title: "Garantía escrita",
    text: "Seis meses en todos los equipos, con comprobante. Si falla, lo resolvemos nosotros.",
  },
  {
    title: "Revisados uno por uno",
    text: "Chequeamos batería, piezas originales y bloqueo de iCloud antes de publicarlos.",
  },
  {
    title: "Precio sin sorpresas",
    text: "Lo que ves publicado es lo que pagás. Sin cargos ocultos al momento de cerrar.",
  },
];

export default async function HomePage() {
  const [masVendidos, nuevosIngresos, posts] = await Promise.all([
    getBestsellers(6),
    getNewArrivals(8),
    getPosts(),
  ]);
  const latestPosts = posts.slice(0, 3);

  return (
    <>
      {/* Las preguntas frecuentes también van en formato estructurado: es lo
          que habilita el desplegable de respuestas en el resultado de Google. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Hero />

      {/* Tres accesos: el 90 % de las visitas viene por una de estas tres puertas. */}
      <section className="shell py-12 sm:py-14">
        <div className="aparece-escalonado grid gap-5 sm:grid-cols-3">
          {SHORTCUTS.map(({ href, icon: Icon, title, text }, i) => (
            <Link
              key={href}
              href={href}
              style={{ "--delay": `${i * 70}ms` } as React.CSSProperties}
              className={cn(
                "group border-line bg-surface rise-in flex flex-col rounded-2xl border p-7 shadow-sm",
                "transition-[transform,box-shadow,border-color] duration-300 ease-out",
                "hover:-translate-y-1.5 hover:border-transparent",
                "hover:shadow-[0_22px_45px_-18px_rgba(16,16,22,0.35)]"
              )}
            >
              {/* El ícono se llena de violeta al pasar el mouse: da señal de
                  que la tarjeta entera es clickeable. */}
              <span className="border-line text-foreground group-hover:border-foreground/40 group-hover:bg-elevated flex size-12 items-center justify-center rounded-xl border bg-white transition-colors duration-300">
                <Icon className="size-5" />
              </span>

              <h2 className="text-foreground mt-5 text-xl font-semibold">{title}</h2>
              <p className="text-muted-foreground mt-2 leading-relaxed">{text}</p>

              <span className="text-foreground mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium">
                Entrar
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <ProductRail
        title="Los más vendidos"
        subtitle="Los equipos que más salen del mostrador."
        products={masVendidos}
        auto
      />

      <ProductRail
        title="Nuevos ingresos"
        subtitle="Lo último que entró y ya se puede llevar."
        products={nuevosIngresos}
        href="/catalogo?sort=nuevo"
        auto
      />

      {/* Banda oscura: corta el blanco de la página y le da respiro visual al
          medio, además de empujar el canje, que es lo que más consultas trae. */}
      <section className="bg-ink text-white">
        <div className="shell py-20 sm:py-24">
          <div className="aparece grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="eyebrow text-foreground">Plan Canje</p>
              <h2 className="mt-3 text-3xl leading-[1.1] font-semibold sm:text-4xl">
                Tu equipo usado vale más
                <br />
                de lo que pensás.
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-white/70">
                Cotizalo en dos minutos y descontá ese valor del que te quieras llevar. Te
                decimos el número en pantalla, sin vueltas ni letra chica.
              </p>
              <Link
                href="/plan-canje"
                className="text-ink mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-medium transition-colors hover:bg-white/90"
              >
                Cotizar mi equipo
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* La narración ya está adentro de la foto —gastado a la izquierda,
                nuevo a la derecha—, así que reemplaza a los dos renders y a la
                flecha que los separaba. El pie lo dice en palabras para quien
                no llega a leer el detalle de las pantallas. */}
            <figure className="m-0">
              <div className="relative aspect-3/2 overflow-hidden rounded-2xl ring-1 ring-white/10">
                <Image
                  src={CANJE_FOTO}
                  alt="Dos iPhone usados, con el dorso rayado y la pantalla partida, al lado de dos iPhone impecables"
                  fill
                  sizes="(min-width: 1024px) 46vw, 90vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-sm leading-relaxed text-white/50">
                Entregás el de la izquierda. Te llevás el de la derecha.
              </figcaption>
            </figure>
          </div>

          <div className="aparece-escalonado mt-20 grid gap-8 border-t border-white/10 pt-12 sm:grid-cols-3">
            {TRUST.map((item) => (
              <div key={item.title}>
                <ShieldCheck className="text-foreground size-5" />
                <h3 className="mt-3 font-medium">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {latestPosts.length > 0 && (
        <section className="shell band">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-3xl font-semibold sm:text-4xl">Blog</h2>
            <Link
              href="/blog"
              className="text-foreground subraya inline-flex shrink-0 items-center gap-1.5 text-sm"
            >
              Ver todas
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="aparece-escalonado mt-10 grid gap-6 sm:grid-cols-3">
            {latestPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <div className="bg-surface relative aspect-16/10 overflow-hidden rounded-xl">
                  {post.coverUrl && (
                    <Image
                      src={post.coverUrl}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 350px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <h3 className="text-foreground mt-4 leading-snug font-medium">
                  {post.title}
                </h3>
                <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-relaxed">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/*
        Cierre con el detalle de qué se vende y dónde.

        Está para dos lectores a la vez: quien llegó buscando "iPhone La
        Plata" y necesita confirmar en una línea que este es el lugar, y el
        buscador, que sin texto real en la página no tiene con qué asociar el
        sitio a la ciudad ni al rubro. Por eso es información concreta y no
        relleno de palabras clave.
      */}
      <section className="border-line border-t">
        <div className="shell py-16 sm:py-20">
          <div className="aparece grid gap-10 lg:grid-cols-3 lg:gap-14">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Venta de iPhone y productos Apple en La Plata
              </h2>
              <p className="text-muted-foreground prosa mt-4 leading-relaxed">
                Somos un local de La Plata dedicado a equipos Apple. Vendemos iPhone del
                11 al 17 —sellados y seminuevos—, iPad, MacBook, Apple Watch y AirPods,
                además de celulares Xiaomi y Motorola, consolas y accesorios. Todo con
                garantía escrita de seis meses y factura.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Cómo comprar</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Los precios y el stock del catálogo son los reales y se actualizan a
                medida que entran y salen equipos. Podés reservar por el carrito sin crear
                una cuenta, o escribirnos por WhatsApp con el modelo que te interesa.
                Retirás en La Plata o te lo enviamos a todo el país.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Canje y servicio técnico</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Tomamos tu iPhone usado como parte de pago: cotizalo en el sitio y pagás
                solo la diferencia. Y si lo que necesitás es arreglarlo, tenemos servicio
                técnico propio para pantalla, batería, pin de carga y cámara, con
                diagnóstico sin cargo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Faq />
    </>
  );
}
