"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/plan-canje", label: "Plan Canje" },
  { href: "/reparaciones", label: "Reparaciones" },
  { href: "/blog", label: "Notas" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();
  const [pasoElHero, setPasoElHero] = useState(false);

  /**
   * Cuando la foto de portada sale de pantalla, el header cambia a vidrio
   * claro: sobre la foto necesita ser oscuro para que el texto blanco se lea,
   * pero sobre el contenido claro de abajo un bloque oscuro pesa de más.
   */
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    if (!hero) {
      // Sin portada el header va claro desde el arranque, pero se difiere
      // igual para no encadenar renders al montar.
      const id = requestAnimationFrame(() => setPasoElHero(true));
      return () => cancelAnimationFrame(id);
    }
    const onScroll = () => setPasoElHero(window.scrollY > hero.offsetHeight - 64);
    // La medición inicial se difiere un cuadro: hacerla en el cuerpo del
    // efecto dispararía un render en cascada apenas monta.
    const inicial = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(inicial);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  const claro = pasoElHero;

  return (
    /**
     * Oscuro desde el arranque, con vidrio esmerilado: el fondo es
     * semitransparente y desenfoca lo que pasa por detrás. Sobre la foto de
     * portada se ve la imagen difuminada a través de la barra, y sobre el
     * contenido claro sigue leyéndose como una barra oscura sólida.
     *
     * `saturate` compensa el lavado de color que produce el desenfoque.
     */
    <header
      // El separador va como sombra interior y no como `border-b`: un borde
      // suma 1 px a la altura del header, y como el hero sube exactamente 64 px
      // para meterse debajo, ese píxel dejaba asomar una línea del fondo claro.
      // Vidrio esmerilado en las dos variantes. El separador va como sombra
      // interior porque un `border-b` sumaría 1 px a la altura del header y
      // dejaría asomar una línea clara sobre la portada.
      className={cn(
        "sticky top-0 z-50 h-16 backdrop-blur-2xl backdrop-saturate-150",
        "transition-colors duration-500",
        claro
          ? "bg-white/72 shadow-[inset_0_-1px_0_rgba(16,16,22,0.1)]"
          : "bg-[#101016]/88 shadow-[inset_0_-1px_0_rgba(255,255,255,0.14)]"
      )}
    >
      <div className="shell-wide flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label="iPhone Purple — inicio">
          <Logo className="h-7" tone={claro ? "onLight" : "onDark"} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[15px] font-medium transition-all duration-200",
                  claro
                    ? active
                      ? "bg-foreground/8 text-foreground"
                      : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                    : active
                      ? "bg-white/12 text-white"
                      : "text-white/75 hover:bg-white/8 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/catalogo"
            aria-label="Buscar en el catálogo"
            className="rounded-full p-2.5 text-white/75 transition-colors hover:text-white md:hidden"
          >
            <Search className="size-5" />
          </Link>

          <Link
            href="/cuenta"
            aria-label="Mi cuenta"
            className={cn(
              "rounded-full p-2.5 transition-colors",
              claro
                ? "text-muted-foreground hover:bg-foreground/8 hover:text-foreground"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            )}
          >
            <User className="size-5" />
          </Link>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={count > 0 ? `Carrito, ${count} equipos` : "Carrito"}
            className={cn(
              "relative rounded-full p-2.5 transition-colors",
              claro
                ? "text-muted-foreground hover:bg-foreground/8 hover:text-foreground"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            )}
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="bg-purple absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            className="rounded-full p-2.5 text-white transition-colors hover:bg-white/10 md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="bg-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] md:hidden">
          <nav className="shell-wide flex flex-col py-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-3.5 text-[15px] text-white last:border-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
