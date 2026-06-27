"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  Heart,
  Smartphone,
  Zap,
  RefreshCcw,
} from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { useCurrencyStore } from "@/stores/currency";

const navLinks = [
  { href: "/catalogo", label: "Catálogo" },
  {
    href: "/catalogo?categoria=iphone",
    label: "iPhone",
    icon: <Smartphone className="w-3.5 h-3.5" />,
  },
  {
    href: "/catalogo?categoria=samsung",
    label: "Samsung",
    icon: <Zap className="w-3.5 h-3.5" />,
  },
  {
    href: "/plan-canje",
    label: "Plan Canje",
    icon: <RefreshCcw className="w-3.5 h-3.5" />,
    highlight: true,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const { currency, setCurrency } = useCurrencyStore();

  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-0.5 shrink-0">
              <span className="text-[#111] font-black text-lg leading-none">
                iPhone
              </span>
              <span className="text-[#7B2FBE] font-black text-lg leading-none">
                Purple
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    link.highlight
                      ? "text-[#7B2FBE] font-semibold hover:text-[#5A1F8A]"
                      : "text-[#666] hover:text-[#111]"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1">
              {/* Currency toggle */}
              <button
                onClick={() => setCurrency(currency === "ARS" ? "USD" : "ARS")}
                className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-[#666] border border-[#E8E8E8] hover:border-[#7B2FBE] transition-colors"
              >
                <span className={currency === "ARS" ? "text-[#111] font-semibold" : ""}>
                  ARS
                </span>
                <span className="text-[#CCC]">|</span>
                <span className={currency === "USD" ? "text-[#111] font-semibold" : ""}>
                  USD
                </span>
              </button>

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-[#666] hover:text-[#111] rounded-lg transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/cuenta/wishlist"
                className="p-2 text-[#666] hover:text-[#111] rounded-lg transition-colors hidden sm:flex"
                aria-label="Wishlist"
              >
                <Heart className="w-4.5 h-4.5" />
              </Link>

              {/* User */}
              <Link
                href="/cuenta"
                className="p-2 text-[#666] hover:text-[#111] rounded-lg transition-colors"
                aria-label="Mi cuenta"
              >
                <User className="w-4.5 h-4.5" />
              </Link>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative p-2 text-[#111] rounded-lg transition-colors hover:text-[#7B2FBE]"
                aria-label="Carrito"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#7B2FBE] rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-[#111] rounded-lg transition-colors hover:text-[#7B2FBE]"
                aria-label="Menú"
              >
                {menuOpen ? (
                  <X className="w-4.5 h-4.5" />
                ) : (
                  <Menu className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-r border-[#E8E8E8] overflow-hidden"
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      link.highlight
                        ? "text-[#7B2FBE] font-semibold hover:text-[#5A1F8A]"
                        : "text-[#666] hover:text-[#111]"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
                <div className="mt-2 pt-2 border-t border-[#E8E8E8]">
                  <button
                    onClick={() =>
                      setCurrency(currency === "ARS" ? "USD" : "ARS")
                    }
                    className="w-full flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium text-[#666] border border-[#E8E8E8] hover:border-[#7B2FBE] transition-colors"
                  >
                    Mostrar en {currency === "ARS" ? "USD" : "ARS"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <div className="absolute inset-0 bg-black/30" />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="relative w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl p-4 border border-[#E8E8E8] shadow-lg">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-[#7B2FBE] shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Buscar iPhone 16, Samsung S25, AirPods..."
                    className="flex-1 bg-transparent text-[#111] placeholder:text-[#AAA] text-lg outline-none"
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="p-1.5 text-[#999] hover:text-[#111] rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-center text-[#999] text-sm mt-3">
                Presioná Enter para buscar en el catálogo
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
