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
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contacto" },
];

/**
 * Fondo del header.
 *
 * Arranca transparente sobre la foto de portada —ahí la imagen ocupa toda la
 * pantalla y cualquier barra la corta— y apenas se scrollea se materializa en
 * oscuro, porque sobre una foto en movimiento el texto blanco suelto deja de
 * leerse.
 *
 * No hay variante clara: el header oscuro es la constante de la marca en todo
 * el sitio, y cambiar de color a mitad del scroll hacía que la barra pareciera
 * otra en cada página.
 */
type Fondo = "transparente" | "oscuro";

/** Cuánto hay que bajar en la portada para que el header se materialice. */
const UMBRAL_TRANSPARENTE = 24;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();
  const [fondo, setFondo] = useState<Fondo>("transparente");

  useEffect(() => {
    const hay = () => Boolean(document.querySelector("[data-hero]"));
    const onScroll = () => {
      // Sin foto de portada detrás, transparente dejaría las letras blancas
      // sobre fondo claro: ahí va oscuro desde el arranque.
      setFondo(
        hay() && window.scrollY <= UMBRAL_TRANSPARENTE ? "transparente" : "oscuro"
      );
    };
    // La medición inicial se difiere un cuadro: hacerla en el cuerpo del
    // efecto dispararía un render en cascada apenas monta.
    const inicial = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(inicial);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  return (
    /**
     * En oscuro va con vidrio esmerilado: el fondo es semitransparente y
     * desenfoca lo que pasa por detrás, así se intuye la foto a través de la
     * barra en vez de cortarla con un bloque opaco. `saturate` compensa el
     * lavado de color que produce el desenfoque.
     */
    <header
      // El separador va como sombra interior y no como `border-b`: un borde
      // suma 1 px a la altura del header, y como el hero sube exactamente 64 px
      // para meterse debajo, ese píxel dejaba asomar una línea del fondo claro.
      className={cn(
        "sticky top-0 z-50 h-16 transition-colors duration-500",
        // El desenfoque también se apaga en transparente: si se deja, la foto
        // de portada se ve borroneada en la franja del header y se nota.
        fondo !== "transparente" && "backdrop-blur-2xl backdrop-saturate-150",
        fondo === "oscuro"
          ? "bg-[#101016]/88 shadow-[inset_0_-1px_0_rgba(255,255,255,0.14)]"
          : "bg-transparent"
      )}
    >
      <div className="shell-wide flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label="iPhone Purple — inicio">
          <Logo className="h-7" tone="onDark" />
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
                  active
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
            className="rounded-full p-2.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          >
            <User className="size-5" />
          </Link>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={count > 0 ? `Carrito, ${count} equipos` : "Carrito"}
            className="relative rounded-full p-2.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              // La `key` es el propio contador: al cambiar, React remonta el
              // globito y la animación de rebote vuelve a correr. Es el aviso
              // de que el equipo entró al carrito.
              <span
                key={count}
                className="bg-purple pop absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              >
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
