"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Image,
  Ticket,
  RefreshCcw,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
  { href: "/admin/productos", label: "Productos", icon: <Package className="w-4.5 h-4.5" /> },
  { href: "/admin/pedidos", label: "Pedidos", icon: <ShoppingBag className="w-4.5 h-4.5" /> },
  { href: "/admin/clientes", label: "Clientes", icon: <Users className="w-4.5 h-4.5" /> },
  { href: "/admin/categorias", label: "Categorías", icon: <Tag className="w-4.5 h-4.5" /> },
  { href: "/admin/banners", label: "Banners", icon: <Image className="w-4.5 h-4.5" /> },
  { href: "/admin/cupones", label: "Cupones", icon: <Ticket className="w-4.5 h-4.5" /> },
  { href: "/admin/plan-canje", label: "Plan Canje", icon: <RefreshCcw className="w-4.5 h-4.5" /> },
  { href: "/admin/reportes", label: "Reportes", icon: <BarChart2 className="w-4.5 h-4.5" /> },
  { href: "/admin/configuracion", label: "Configuración", icon: <Settings className="w-4.5 h-4.5" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NavContent = () => (
    <nav className="flex flex-col h-full">
      <div className="p-5 border-b border-white/8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-purple rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">IP</span>
          </div>
          <div>
            <span className="text-white font-bold text-sm">iPhone<span className="text-gradient-purple">Purple</span></span>
            <span className="block text-[#6B6B80] text-[10px]">Panel Admin</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "gradient-purple text-white"
                  : "text-[#A0A0B8] hover:text-white hover:bg-white/8"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-white/8">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#A0A0B8] hover:text-red-400 hover:bg-red-400/10 transition-all w-full"
        >
          <LogOut className="w-4.5 h-4.5" />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0F]">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-white/8" style={{ background: "#12121A" }}>
        <NavContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 border-r border-white/8 flex flex-col" style={{ background: "#12121A" }}>
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-white/8" style={{ background: "#12121A" }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-[#A0A0B8] hover:text-white rounded-lg hover:bg-white/8 transition-all"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
          <h1 className="text-white font-semibold text-sm">
            {NAV_ITEMS.find((i) => i.href === pathname)?.label ?? "Admin"}
          </h1>
          <Link href="/" className="text-[#6B6B80] text-xs hover:text-white transition-colors">
            Ver tienda →
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
