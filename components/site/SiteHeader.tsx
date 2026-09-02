"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { WhatsAppLink } from "./WhatsAppLink";
import { Logo } from "./Logo";
import { GENERAL_MESSAGE } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/plan-canje", label: "Plan Canje" },
  { href: "/reparaciones", label: "Reparaciones" },
  { href: "/blog", label: "Notas" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader({ whatsappNumber }: { whatsappNumber: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /**
   * Suscripción al scroll para saber si el header ya despegó de la portada.
   * Es un evento del navegador, no un cálculo derivado del render: por eso va
   * en un efecto.
   */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll(); // Cubre el caso de entrar con la página ya scrolleada.
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * Transparente solo en la portada de inicio, que ocupa la pantalla entera:
   * ahí el header flota sobre la foto y se arma al bajar. En el resto de las
   * vistas arranca sólido, porque el contenido claro empieza enseguida y el
   * texto blanco no se leería.
   */
  const flotante = pathname === "/" && !scrolled && !open;

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
      className={cn(
        "sticky top-0 z-50 h-16 transition-colors duration-500",
        flotante
          ? "bg-transparent"
          : "bg-ink/80 shadow-[inset_0_-1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl backdrop-saturate-150"
      )}
    >
      <div className="shell-wide flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label="iPhone Purple — inicio">
          <Logo className="h-7" />
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
                    ? "bg-white/10 text-white"
                    : "text-white/75 hover:bg-white/5 hover:text-white"
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
            className="rounded-full p-2.5 text-white/70 transition-colors hover:text-white md:hidden"
          >
            <Search className="size-5" />
          </Link>

          <WhatsAppLink
            number={whatsappNumber}
            message={GENERAL_MESSAGE}
            className="hidden h-10 px-5 sm:inline-flex"
          >
            Escribinos
          </WhatsAppLink>

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
            <WhatsAppLink
              number={whatsappNumber}
              message={GENERAL_MESSAGE}
              onClick={() => setOpen(false)}
              className="my-4 w-full sm:hidden"
            >
              Escribinos por WhatsApp
            </WhatsAppLink>
          </nav>
        </div>
      )}
    </header>
  );
}
