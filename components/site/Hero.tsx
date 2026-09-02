import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Hero con video de fondo.
 *
 * Degrada en dos escalones: si el navegador no reproduce, queda el `poster`; si
 * tampoco existe el poster, queda el fondo tinta del `<section>`. En los tres
 * casos el texto se lee, que es lo único que no puede fallar.
 *
 * Para activarlo, dejá `public/hero.mp4` y `public/hero-poster.jpg`.
 */
export function Hero() {
  return (
    // Centrado en vez de anclado abajo: así compone bien con video de fondo y
    // también sin él, que es como arranca el proyecto hasta que cargues el tuyo.
    <section className="bg-ink relative isolate -mt-16 flex min-h-[88svh] items-center overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/hero-poster.jpg"
        aria-hidden
        tabIndex={-1}
        className="absolute inset-0 -z-10 size-full object-cover"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Oscurece el video lo justo para que el texto tenga contraste real.
          El halo violeta le da profundidad al fondo cuando todavía no hay video. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/45 to-black/25"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 15%, rgba(123,47,190,0.28), transparent 65%)",
        }}
      />

      <div className="shell w-full pt-32 pb-20 sm:pb-24">
        <p className="eyebrow text-white/70">Equipos Apple · La Plata</p>

        <h1 className="mt-4 max-w-3xl text-4xl leading-[1.05] font-semibold text-white sm:text-6xl">
          El iPhone que buscás,
          <br />
          con garantía y sin vueltas.
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
          Mirá el stock real, cotizá tu equipo usado en dos minutos y escribinos. Precios
          claros, sin letra chica.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/catalogo"
            className="text-ink inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-medium transition-colors hover:bg-white/90"
          >
            Ver catálogo
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/plan-canje"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-7 text-sm font-medium text-white transition-colors hover:border-white/70"
          >
            Cotizar mi equipo
          </Link>
        </div>
      </div>
    </section>
  );
}
