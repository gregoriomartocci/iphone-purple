"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Package, Mail, Truck } from "lucide-react";
import { useCartStore } from "@/stores/cart";

export default function ConfirmationPage() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const ORDER_NUMBER = "IPP-2025-0001";

  return (
    <div className="bg-white min-h-screen pt-14 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Check circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, delay: 0.1 }}
          className="w-16 h-16 bg-[#F3EEFF] rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-8 h-8 text-[#7B2FBE]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-[#111]">¡Pedido confirmado!</h1>
          <p className="text-[#666] text-sm mt-1 mb-6">
            Número de pedido: <span className="font-semibold text-[#111]">#{ORDER_NUMBER}</span>
          </p>

          {/* Steps list */}
          <div className="text-left space-y-2 mb-8">
            {[
              {
                icon: <Mail className="w-3 h-3" />,
                title: "Email de confirmación",
                desc: "Te enviamos el detalle completo a tu correo.",
              },
              {
                icon: <Package className="w-3 h-3" />,
                title: "Preparando tu pedido",
                desc: "Tu equipo se preparará y enviará dentro de las próximas 24hs.",
              },
              {
                icon: <Truck className="w-3 h-3" />,
                title: "Tracking en tiempo real",
                desc: "Podrás rastrear tu pedido desde tu cuenta.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2 text-sm text-[#666]">
                <div className="bg-[#F3EEFF] text-[#7B2FBE] rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <span className="font-medium text-[#111]">{item.title}</span>
                  <span className="text-[#666]"> — {item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/cuenta/pedidos"
              className="bg-[#7B2FBE] text-white w-full py-2.5 rounded-xl font-semibold text-sm hover:bg-[#6D28D9] transition-colors flex items-center justify-center"
            >
              Ver mis pedidos
            </Link>
            <Link
              href="/catalogo"
              className="border border-[#E8E8E8] text-[#111] w-full py-2.5 rounded-xl font-semibold text-sm hover:bg-[#F7F7F7] transition-colors flex items-center justify-center"
            >
              Seguir comprando
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
