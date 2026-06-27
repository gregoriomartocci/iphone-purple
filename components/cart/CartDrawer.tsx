"use client";

import { useCartStore } from "@/stores/cart";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { formatARS } from "@/utils/format";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-[80]"
            onClick={closeCart}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col z-[90]"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#E8E8E8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111]">Tu carrito</h2>
                {items.length > 0 && (
                  <span className="bg-[#7B2FBE] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {items.length}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="text-[#999] hover:text-[#111] transition-colors p-1"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.length === 0 ? (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center text-center h-full gap-3">
                  <ShoppingBag className="text-[#DDD] w-12 h-12 mb-3" />
                  <p className="text-[#666] text-sm">Tu carrito está vacío</p>
                  <Link
                    href="/catalogo"
                    onClick={closeCart}
                    className="bg-[#7B2FBE] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6D28D9] transition-colors"
                  >
                    Ver catálogo
                  </Link>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.variantId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-3"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 rounded-lg bg-[#F5F5F5] flex-shrink-0 overflow-hidden relative">
                        {item.productImage ? (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-[#999]" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#111] line-clamp-1">
                          {item.productName}
                        </p>
                        <p className="text-xs text-[#999] mt-0.5">{item.variantName}</p>
                        <p className="text-sm font-bold text-[#111] mt-1">
                          {formatARS(item.price)}
                        </p>
                      </div>

                      {/* Quantity stepper + delete */}
                      <div className="ml-auto flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg w-7 h-7 flex items-center justify-center text-[#111] hover:bg-[#E8E8E8] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium text-[#111] w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg w-7 h-7 flex items-center justify-center text-[#111] hover:bg-[#E8E8E8] transition-colors disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-[#CCC] hover:text-red-500 transition-colors p-0.5"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#E8E8E8] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#666] text-sm">Subtotal</span>
                  <span className="text-base font-bold text-[#111]">
                    {formatARS(total())}
                  </span>
                </div>
                <Link href="/checkout" onClick={closeCart} className="block">
                  <button className="bg-[#7B2FBE] text-white w-full py-3.5 rounded-xl font-semibold hover:bg-[#6D28D9] transition-colors">
                    Finalizar compra
                  </button>
                </Link>
                <Link
                  href="/carrito"
                  onClick={closeCart}
                  className="block text-center text-sm text-[#666] hover:text-[#111] transition-colors"
                >
                  Ver carrito completo
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
