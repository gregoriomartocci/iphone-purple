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
              className="group border-line hover:border-ink/25 rounded-2xl border p-6 transition-colors"
            >
              <Icon className="text-purple size-5" />
              <h2 className="text-ink mt-4 font-medium">{title}</h2>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                {text}
              </p>
              <span className="text-ink mt-4 inline-flex items-center gap-1.5 text-sm">
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
              className="text-ink hover:text-purple hidden shrink-0 items-center gap-1.5 text-sm sm:inline-flex"
            >
              Ver todo
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Link
            href="/catalogo"
            className="border-line text-ink hover:border-ink mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border text-sm font-medium transition-colors sm:hidden"
          >
            Ver todo el catálogo
            <ArrowRight className="size-3.5" />
          </Link>
        </section>
      )}

      <section className="border-line bg-surface border-y">
        <div className="shell py-16">
          <div className="grid gap-8 sm:grid-cols-3">
            {TRUST.map((item) => (
              <div key={item.title}>
                <ShieldCheck className="text-purple size-5" />
                <h3 className="text-ink mt-3 font-medium">{item.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
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
              className="text-ink hover:text-purple inline-flex shrink-0 items-center gap-1.5 text-sm"
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
                <h3 className="text-ink mt-4 leading-snug font-medium">{post.title}</h3>
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
