"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  MessageSquareText,
  Package,
  Receipt,
  RefreshCcw,
  Truck,
  Wrench,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/importar", label: "Importar lista", icon: MessageSquareText },
  { href: "/admin/productos", label: "Productos", icon: Package },
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
      <div className="border-line border-b px-5 py-5">
        <Link href="/" aria-label="iPhone Purple — inicio">
          <Logo className="text-[13px]" />
        </Link>
        <p className="text-muted-foreground mt-0.5 text-xs">Panel interno</p>
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
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-purple font-medium text-white"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
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
          className="text-muted-foreground hover:bg-surface hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
        >
          Ver la tienda
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );

  return (
    <div className="bg-background flex min-h-dvh">
      <aside className="border-line hidden w-60 shrink-0 border-r lg:block">{nav}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="border-line bg-background absolute inset-y-0 left-0 w-64 border-r">
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-line flex h-14 items-center gap-3 border-b px-5 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="text-foreground hover:bg-surface rounded-lg p-2"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-sm font-medium">
            {NAV.find((i) => i.href === pathname)?.label ?? "Panel"}
          </span>
        </header>

        <main className="flex-1 overflow-x-hidden p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
