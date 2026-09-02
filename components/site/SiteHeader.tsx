"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
      // Vidrio esmerilado claro: deja ver difuminado lo que pasa por detrás,
      // tanto la foto de la portada como el contenido al scrollear.
      // El separador va como sombra interior porque un `border-b` sumaría
      // 1 px a la altura y dejaría asomar una línea sobre la portada.
      className="sticky top-0 z-50 h-16 bg-white/70 shadow-[inset_0_-1px_0_rgba(16,16,22,0.1)] backdrop-blur-2xl backdrop-saturate-150"
    >
      <div className="shell-wide flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label="iPhone Purple — inicio">
          <Logo className="h-7" tone="onLight" />
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
                    ? "bg-foreground/8 text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
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
            className="text-muted-foreground hover:text-foreground rounded-full p-2.5 transition-colors md:hidden"
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
            className="text-foreground hover:bg-foreground/8 rounded-full p-2.5 transition-colors md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="bg-surface shadow-[inset_0_1px_0_rgba(16,16,22,0.1)] md:hidden">
          <nav className="shell-wide flex flex-col py-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-line text-foreground border-b py-3.5 text-[15px] last:border-0"
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
