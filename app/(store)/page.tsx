import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, RefreshCcw, Wrench } from "lucide-react";
import { Hero } from "@/components/site/Hero";
import { ProductCard } from "@/components/site/ProductCard";
import { getFeaturedProducts, getPosts } from "@/lib/data";

export const metadata: Metadata = {
  title: "iPhone Purple — Equipos Apple con garantía en Argentina",
  description:
    "Mirá el stock real de iPhone, iPad y Mac. Cotizá tu equipo usado con el Plan Canje y consultá por WhatsApp.",
};

export const revalidate = 600;

const SHORTCUTS = [
  {
    href: "/catalogo",
    icon: ArrowRight,
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
 * Foto de la banda de Plan Canje. Va sobre fondo negro, así que tiene que ser
 * una imagen oscura: una clara abre un agujero de luz y arruina el corte.
 * Reemplazable por una del local.
 */
const TRADE_IN_PHOTO =
  "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80";

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
  const [featured, posts] = await Promise.all([getFeaturedProducts(6), getPosts()]);
  const latestPosts = posts.slice(0, 3);

  return (
    <>
      <Hero />

      {/* Tres accesos: el 90 % de las visitas viene por una de estas tres puertas. */}
      <section className="shell border-line border-b py-14">
        <div className="grid gap-3 sm:grid-cols-3">
          {SHORTCUTS.map(({ href, icon: Icon, title, text }) => (
            <Link
              key={href}
              href={href}
              className="group border-line hover:border-foreground/25 rounded-2xl border p-6 transition-colors"
            >
              <Icon className="text-purple size-5" />
              <h2 className="text-foreground mt-4 font-medium">{title}</h2>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                {text}
              </p>
              <span className="text-foreground mt-4 inline-flex items-center gap-1.5 text-sm">
                Entrar
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="shell band">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold sm:text-4xl">Disponibles ahora</h2>
              <p className="text-muted-foreground mt-2">
                Equipos con stock confirmado, listos para retirar.
              </p>
            </div>
            <Link
              href="/catalogo"
              className="text-foreground hover:text-purple hidden shrink-0 items-center gap-1.5 text-sm sm:inline-flex"
            >
              Ver todo
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-3">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          <Link
            href="/catalogo"
            className="border-line text-foreground hover:border-foreground/35 mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border text-sm font-medium transition-colors sm:hidden"
          >
            Ver todo el catálogo
            <ArrowRight className="size-3.5" />
          </Link>
        </section>
      )}

      {/* Banda oscura: corta el blanco de la página y le da respiro visual al
          medio, además de empujar el canje, que es lo que más consultas trae. */}
      <section className="bg-ink text-white">
        <div className="shell py-20 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="eyebrow text-purple-light">Plan Canje</p>
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

            <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
              <Image
                src={TRADE_IN_PHOTO}
                alt="Cotización de un equipo usado en el local"
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
              />
            </div>
          </div>

          <div className="mt-20 grid gap-8 border-t border-white/10 pt-12 sm:grid-cols-3">
            {TRUST.map((item) => (
              <div key={item.title}>
                <ShieldCheck className="text-purple-light size-5" />
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
            <h2 className="text-3xl font-semibold sm:text-4xl">Notas</h2>
            <Link
              href="/blog"
              className="text-foreground hover:text-purple inline-flex shrink-0 items-center gap-1.5 text-sm"
            >
              Ver todas
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
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
    </>
  );
}
