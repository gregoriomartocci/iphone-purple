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
    // Ocupa la pantalla entera: al entrar se ve solo la foto. El -mt-16 la mete
    // por debajo del header, que arranca transparente sobre ella.
    <section
      data-hero
      className="bg-ink relative isolate -mt-16 flex min-h-svh items-center overflow-hidden"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/hero-poster.jpg"
        aria-hidden
        tabIndex={-1}
        className="respira absolute inset-0 -z-10 size-full object-cover object-center"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/*
        Dos capas de oscurecimiento, calibradas para que el titular se lea
        sobre CUALQUIER foto, también una clara como un escritorio junto a una
        ventana: un velo parejo que baja el brillo general, y encima un
        degradé más fuerte desde abajo, que es donde apoya el texto.
      */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/45" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/40 to-transparent"
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
        <p className="eyebrow rise-in text-white/60">Equipos Apple · La Plata</p>

        {/*
          Peso liviano y tracking cerrado: a este tamaño un semibold se vuelve
          macizo, y la geométrica de la marca luce mejor abierta y fina.
        */}
        <h1
          style={{ "--delay": "80ms" } as React.CSSProperties}
          className="rise-in mt-5 max-w-4xl text-5xl leading-[0.98] font-normal tracking-[-0.03em] text-white sm:text-7xl"
        >
          El iPhone que buscás,
          <br />
          <span className="font-medium">con garantía y sin vueltas.</span>
        </h1>

        <p
          style={{ "--delay": "160ms" } as React.CSSProperties}
          className="rise-in mt-7 max-w-lg text-lg leading-relaxed text-white/70"
        >
          Mirá el stock real, cotizá tu equipo usado en dos minutos y escribinos.
        </p>

        <div
          style={{ "--delay": "240ms" } as React.CSSProperties}
          className="rise-in mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/catalogo"
            className="text-ink inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-8 text-[15px] font-medium transition-transform duration-200 hover:scale-[1.03]"
          >
            Ver catálogo
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/plan-canje"
            className="inline-flex h-13 items-center justify-center rounded-full border border-white/25 bg-white/5 px-8 text-[15px] font-medium text-white backdrop-blur-sm transition-colors duration-200 hover:border-white/50 hover:bg-white/10"
          >
            Cotizar mi equipo
          </Link>
        </div>
      </div>
    </section>
  );
}
