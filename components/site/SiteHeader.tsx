"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { WhatsAppLink } from "./WhatsAppLink";
import { Logo } from "./Logo";
import { GENERAL_MESSAGE } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/**
 * Vistas que abren con una foto de portada oscura.
 *
 * Solo ahí el header puede ser transparente: sobre contenido claro el texto
 * blanco sería ilegible. Las fichas de producto y de nota no están porque
 * arrancan directamente con contenido.
 */
const HERO_ROUTES = new Set([
  "/",
  "/catalogo",
  "/plan-canje",
  "/reparaciones",
  "/blog",
  "/contacto",
]);

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
   * El header arranca transparente sobre la portada y se arma al bajar.
   * Es una suscripción a un evento del navegador, no un cálculo derivado del
   * render: por eso vive en un efecto y no en el cuerpo del componente.
   */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll(); // Cubre el caso de entrar con la página ya scrolleada.
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Con el menú móvil abierto el fondo es obligatorio: si no, los links
  // quedarían flotando sobre la foto.
  const transparent = HERO_ROUTES.has(pathname) && !scrolled && !open;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        transparent
          ? "border-transparent bg-transparent"
          : "bg-ink/90 border-white/10 backdrop-blur-xl"
      )}
    >
      <div className="shell flex h-16 items-center justify-between gap-4">
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
                  "rounded-full px-3.5 py-2 text-sm transition-colors",
                  active ? "font-medium text-white" : "text-white/65 hover:text-white"
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
        <div className="bg-ink border-t border-white/10 md:hidden">
          <nav className="shell flex flex-col py-2">
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
