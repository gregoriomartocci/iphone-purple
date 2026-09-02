"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { WhatsAppLink } from "./WhatsAppLink";
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
    <header className="border-line sticky top-0 z-50 border-b bg-white/85 backdrop-blur-md">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight">
          iPhone <span className="text-purple">Purple</span>
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
                  active ? "text-ink font-medium" : "text-muted-foreground hover:text-ink"
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
            className="text-muted-foreground hover:text-ink rounded-full p-2.5 transition-colors md:hidden"
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
            className="text-ink hover:bg-surface rounded-full p-2.5 transition-colors md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-line border-t bg-white md:hidden">
          <nav className="shell flex flex-col py-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-line text-ink border-b py-3.5 text-[15px] last:border-0"
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
