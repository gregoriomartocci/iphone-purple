"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";
import { formatARS } from "@/utils/format";

const ORDER_STATUS_CONFIG = {
  pending: { label: "Pendiente de pago", color: "text-yellow-700", bg: "bg-yellow-50 border border-yellow-200", icon: <Clock className="w-3.5 h-3.5" /> },
  confirmed: { label: "Confirmado", color: "text-blue-700", bg: "bg-blue-50 border border-blue-200", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  processing: { label: "En preparación", color: "text-purple-700", bg: "bg-purple-50 border border-purple-200", icon: <Package className="w-3.5 h-3.5" /> },
  shipped: { label: "Enviado", color: "text-blue-700", bg: "bg-blue-50 border border-blue-200", icon: <Truck className="w-3.5 h-3.5" /> },
  delivered: { label: "Entregado", color: "text-green-700", bg: "bg-green-50 border border-green-200", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: "Cancelado", color: "text-red-700", bg: "bg-red-50 border border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
  refunded: { label: "Reembolsado", color: "text-orange-700", bg: "bg-orange-50 border border-orange-200", icon: <RefreshCcw className="w-3.5 h-3.5" /> },
};

const MOCK_ORDERS = [
  { id: "o1", order_number: "IPP-2025-0001", status: "shipped", total: 2100000, date: "hace 2 días", items: [{ name: "iPhone 16 Pro Max 256GB", qty: 1 }] },
  { id: "o2", order_number: "IPP-2025-0002", status: "delivered", total: 850000, date: "hace 2 semanas", items: [{ name: "Samsung Galaxy S24 128GB", qty: 1 }] },
  { id: "o3", order_number: "IPP-2025-0003", status: "confirmed", total: 145000, date: "hace 1 hora", items: [{ name: "AirPods Pro 2", qty: 1 }, { name: "Funda MagSafe", qty: 2 }] },
];

export default function OrdersPage() {
  return (
    <div className="bg-white min-h-screen pt-14">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#111]">Mis pedidos</h1>
        <p className="text-[#666] text-sm mt-1 mb-8">{MOCK_ORDERS.length} pedidos</p>

        <div className="space-y-4">
          {MOCK_ORDERS.map((order, i) => {
            const config = ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG];
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={`/cuenta/pedidos/${order.order_number}`}
                  className="bg-white border border-[#E8E8E8] rounded-2xl p-5 hover:border-[#D0D0D0] transition-colors block"
                >
                  {/* Header row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#111] font-mono">#{order.order_number}</span>
                    <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                      {config.icon} {config.label}
                    </span>
                    <span className="text-xs text-[#999] ml-auto">{order.date}</span>
                  </div>

                  {/* Items summary */}
                  <p className="text-sm text-[#666] mt-2">
                    {order.items.map((item) => `${item.name} ×${item.qty}`).join(", ")}
                  </p>

                  {/* Total + CTA */}
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm font-bold text-[#111]">{formatARS(order.total)}</span>
                    <span className="text-xs text-[#7B2FBE] hover:underline flex items-center gap-1">
                      Ver detalles <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
