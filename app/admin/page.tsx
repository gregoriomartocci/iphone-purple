import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { formatARS } from "@/utils/format";

const KPI_DATA = [
  { label: "Ventas hoy", value: 3450000, prev: 2800000, prefix: "$", format: true },
  { label: "Órdenes hoy", value: 12, prev: 9, prefix: "" },
  { label: "Clientes nuevos", value: 47, prev: 52, prefix: "" },
  { label: "Ticket promedio", value: 287500, prev: 311000, prefix: "$", format: true },
];

const RECENT_ORDERS = [
  { id: "#IPP-2025-0012", customer: "Valentina M.", product: "iPhone 16 Pro 256GB", total: 2100000, status: "paid" },
  { id: "#IPP-2025-0011", customer: "Lucas G.", product: "Samsung S24 Ultra", total: 1850000, status: "processing" },
  { id: "#IPP-2025-0010", customer: "Sofía R.", product: "AirPods Pro 2", total: 320000, status: "shipped" },
  { id: "#IPP-2025-0009", customer: "Martín F.", product: "iPhone 15 128GB", total: 780000, status: "delivered" },
  { id: "#IPP-2025-0008", customer: "Carolina L.", product: "Funda MagSafe ×3", total: 45000, status: "paid" },
];

const STATUS_COLORS: Record<string, string> = {
  paid: "text-emerald-400 bg-emerald-400/10",
  processing: "text-blue-400 bg-blue-400/10",
  shipped: "text-sky-400 bg-sky-400/10",
  delivered: "text-[#A0A0B8] bg-white/8",
  pending: "text-yellow-400 bg-yellow-400/10",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Pagado",
  processing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregado",
  pending: "Pendiente",
};

const LOW_STOCK = [
  { name: "iPhone 16 Pro Max 512GB Titanio Negro", stock: 2 },
  { name: "Samsung S24 Ultra 256GB Gris Titanio", stock: 1 },
  { name: "AirPods Pro 2 USB-C", stock: 3 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">Dashboard</h1>
        <p className="text-[#6B6B80] text-sm mt-0.5">Resumen de hoy — viernes 27 de junio de 2025</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi) => {
          const change = ((kpi.value - kpi.prev) / kpi.prev) * 100;
          const isUp = change >= 0;
          return (
            <div key={kpi.label} className="glass rounded-2xl p-5 border border-white/8">
              <p className="text-[#6B6B80] text-xs mb-2">{kpi.label}</p>
              <p className="text-white font-black text-xl font-price">
                {kpi.format ? formatARS(kpi.value) : kpi.value.toLocaleString("es-AR")}
              </p>
              <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {Math.abs(change).toFixed(1)}% vs ayer
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent orders */}
        <div className="lg:col-span-2 glass rounded-2xl border border-white/8 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#7B2FBE]" />
              Últimos pedidos
            </h2>
            <a href="/admin/pedidos" className="text-[#9B59D0] text-xs hover:text-white transition-colors">
              Ver todos →
            </a>
          </div>
          <div className="divide-y divide-white/5">
            {RECENT_ORDERS.map((order) => (
              <div key={order.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-colors">
                <div className="w-8 h-8 gradient-purple rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs font-mono font-medium">{order.id}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="text-[#6B6B80] text-xs truncate">
                    {order.customer} — {order.product}
                  </p>
                </div>
                <span className="text-white text-sm font-bold font-price flex-shrink-0">
                  {formatARS(order.total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock alert */}
        <div className="glass rounded-2xl border border-orange-500/25 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-orange-500/20 bg-orange-500/5">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <h2 className="text-orange-300 font-semibold text-sm">Bajo stock</h2>
          </div>
          <div className="divide-y divide-white/5">
            {LOW_STOCK.map((item) => (
              <div key={item.name} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-white text-xs font-medium leading-snug line-clamp-2">{item.name}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                  item.stock <= 1 ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"
                }`}>
                  {item.stock} ud.
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-white/8">
            <a href="/admin/productos?filter=lowstock" className="text-[#9B59D0] text-xs hover:text-white transition-colors">
              Ver todos con bajo stock →
            </a>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/productos/nuevo", label: "Agregar producto", icon: <Package className="w-5 h-5" /> },
          { href: "/admin/pedidos?status=pending", label: "Pedidos pendientes", icon: <ShoppingBag className="w-5 h-5" /> },
          { href: "/admin/cupones/nuevo", label: "Crear cupón", icon: <DollarSign className="w-5 h-5" /> },
          { href: "/admin/reportes", label: "Ver reportes", icon: <TrendingUp className="w-5 h-5" /> },
        ].map((action) => (
          <a
            key={action.href}
            href={action.href}
            className="glass rounded-xl p-4 border border-white/8 hover:border-[#7B2FBE]/40 transition-all flex flex-col items-center gap-2 text-center group"
          >
            <div className="w-10 h-10 glass-purple rounded-xl flex items-center justify-center text-[#7B2FBE] group-hover:gradient-purple group-hover:text-white transition-all">
              {action.icon}
            </div>
            <span className="text-[#A0A0B8] group-hover:text-white text-xs font-medium transition-colors">
              {action.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
