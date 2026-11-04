"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Package,
  Percent,
  Receipt,
  RefreshCcw,
  Settings,
  Smartphone,
  Store,
  Truck,
  Wrench,
} from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: Smartphone },
  { href: "/admin/importar", label: "Importar lista", icon: MessageSquareText },
  { href: "/admin/mercado", label: "Mercado", icon: Store },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/margenes", label: "Margen y precios", icon: Percent },
  { href: "/admin/ventas", label: "Ventas", icon: Receipt },
  { href: "/admin/plan-canje", label: "Plan Canje", icon: RefreshCcw },
  { href: "/admin/proveedores", label: "Proveedores", icon: Truck },
  { href: "/admin/reparaciones", label: "Reparaciones", icon: Wrench },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="border-line border-b px-5 py-6">
        <Link
          href="/"
          aria-label="iPhone Purple — inicio"
          className="inline-block transition-opacity hover:opacity-80"
        >
          {/* `onDark` explícito y no por omisión: el panel era claro, servía la
              marca en blanco sobre fondo claro y el logo se veía fantasma. */}
          <Logo tone="onDark" className="h-9" />
        </Link>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                active
                  ? // El resplandor es el mismo del botón "Ingresar" del login.
                    "bg-active text-active-foreground font-medium shadow-[0_8px_24px_-10px_#5e16eb]"
                  : "text-white/55 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="border-line border-t p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <Store className="size-4 shrink-0" />
          Ver la tienda
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="hover:text-destructive flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/55 transition-colors hover:bg-red-500/10"
        >
          <LogOut className="size-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );

  return (
    <div data-panel className="bg-background relative flex min-h-dvh">
      {/*
       * El fondo del login, traído tal cual: base casi negra, dos auroras que
       * derivan muy despacio y grano encima.
       *
       * Va `fixed` y no `absolute` porque acá el contenido scrollea: con
       * `absolute` las auroras se iban hacia arriba al bajar en una tabla
       * larga y el fondo quedaba liso justo donde hay más para leer.
       *
       * `pointer-events-none` porque es decoración: si intercepta clics, se
       * come el primero de cada interacción del panel.
       */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="aurora aurora-1 -top-[22%] left-[-14%] h-[64vh] w-[64vh] opacity-60"
          style={{ background: "radial-gradient(circle, #5e16eb 0%, transparent 66%)" }}
        />
        <div
          className="aurora aurora-2 right-[-10%] bottom-[-28%] h-[58vh] w-[58vh] opacity-45"
          style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 68%)" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_12%,#0f0f15_92%)]" />
        <div className="grano absolute inset-0 opacity-[0.16] mix-blend-overlay" />
      </div>

      <aside className="relative hidden w-60 shrink-0 border-r border-white/[0.07] bg-white/[0.02] backdrop-blur-xl lg:block">
        {nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-white/[0.07] bg-[#13131a]/95 backdrop-blur-xl">
            {nav}
          </aside>
        </div>
      )}

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-white/[0.07] px-5 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="rounded-xl p-2 text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-sm font-medium text-white">
            {NAV.find((i) => i.href === pathname)?.label ?? "Panel"}
          </span>
        </header>

        <main className="flex-1 overflow-x-hidden p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
