import Link from "next/link";
import { Mail, MapPin, Clock } from "lucide-react";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "./BrandIcons";
import { Logo } from "./Logo";
import { waLink, GENERAL_MESSAGE } from "@/lib/whatsapp";
import type { StoreSettings } from "@/types";

const COLUMNS = [
  {
    title: "Tienda",
    links: [
      { href: "/catalogo", label: "Catálogo" },
      { href: "/catalogo?grade=nuevo", label: "Equipos nuevos" },
      { href: "/catalogo?sort=precio-asc", label: "Los más accesibles" },
    ],
  },
  {
    title: "Servicios",
    links: [
      { href: "/plan-canje", label: "Plan Canje" },
      { href: "/reparaciones", label: "Reparaciones" },
      { href: "/blog", label: "Notas" },
    ],
  },
  {
    title: "Nosotros",
    links: [
      { href: "/contacto", label: "Contacto" },
      { href: "/contacto#local", label: "Dónde estamos" },
    ],
  },
];

export function SiteFooter({ settings }: { settings: StoreSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink mt-auto text-white">
      <div className="shell-wide py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" aria-label="iPhone Purple — inicio">
              <Logo className="h-9" />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              Equipos Apple con garantía escrita, Plan Canje y servicio técnico propio.
              Atendemos en CABA y enviamos a todo el país.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <a
                href={waLink(settings.whatsappNumber, GENERAL_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="rounded-full border border-white/15 p-2.5 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <WhatsAppIcon className="size-4" />
              </a>
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-full border border-white/15 p-2.5 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href={settings.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="rounded-full border border-white/15 p-2.5 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <TikTokIcon className="size-4" />
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-medium text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/60 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            {settings.address}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="size-4 shrink-0" />
            {settings.hours}
          </span>
          <a
            href={`mailto:${settings.email}`}
            className="inline-flex items-center gap-2 transition-colors hover:text-white"
          >
            <Mail className="size-4 shrink-0" />
            {settings.email}
          </a>
        </div>

        <p className="mt-8 text-xs text-white/40">
          © {year} iPhone Purple. Todos los precios incluyen IVA.
        </p>
      </div>
    </footer>
  );
}
