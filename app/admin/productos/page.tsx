"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye,
  Package, TrendingUp, AlertTriangle, CheckCircle, X, Upload,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

interface AdminProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compare_price: number | null;
  stock: number;
  status: StockStatus;
  image: string;
  variants: number;
  sales: number;
  featured: boolean;
}

const MOCK_PRODUCTS: AdminProduct[] = [
  { id: "1", name: "iPhone 16 Pro Max", brand: "Apple", category: "Smartphones", price: 2150000, compare_price: 2400000, stock: 12, status: "in_stock", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=80&q=80", variants: 4, sales: 87, featured: true },
  { id: "2", name: "iPhone 16 Pro", brand: "Apple", category: "Smartphones", price: 1850000, compare_price: null, stock: 8, status: "in_stock", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=80&q=80", variants: 3, sales: 54, featured: true },
  { id: "3", name: "iPhone 15", brand: "Apple", category: "Smartphones", price: 1400000, compare_price: 1600000, stock: 3, status: "low_stock", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=80&q=80", variants: 2, sales: 41, featured: false },
  { id: "4", name: "Samsung Galaxy S25 Ultra", brand: "Samsung", category: "Smartphones", price: 1950000, compare_price: null, stock: 0, status: "out_of_stock", image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=80&q=80", variants: 2, sales: 28, featured: false },
  { id: "5", name: "AirPods Pro 2", brand: "Apple", category: "Accesorios", price: 450000, compare_price: 520000, stock: 25, status: "in_stock", image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=80&q=80", variants: 1, sales: 112, featured: true },
  { id: "6", name: "Funda MagSafe iPhone 16", brand: "Apple", category: "Fundas", price: 85000, compare_price: null, stock: 42, status: "in_stock", image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=80&q=80", variants: 6, sales: 203, featured: false },
  { id: "7", name: "iPhone 14", brand: "Apple", category: "Smartphones", price: 1100000, compare_price: 1300000, stock: 2, status: "low_stock", image: "https://images.unsplash.com/photo-1664478546384-d57ffe74a78c?w=80&q=80", variants: 2, sales: 67, featured: false },
  { id: "8", name: "Cargador MagSafe 15W", brand: "Apple", category: "Accesorios", price: 95000, compare_price: null, stock: 18, status: "in_stock", image: "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=80&q=80", variants: 1, sales: 89, featured: false },
];

const STATUS_CONFIG: Record<StockStatus, { label: string; class: string }> = {
  in_stock: { label: "En stock", class: "bg-green-500/15 text-green-400 border-green-500/30" },
  low_stock: { label: "Stock bajo", class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  out_of_stock: { label: "Sin stock", class: "bg-red-500/15 text-red-400 border-red-500/30" },
};

const formatARS = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export default function AdminProductosPage() {
  const [products] = useState<AdminProduct[]>(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState<"all" | StockStatus>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;

  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "Todos" || p.category === categoryFilter;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((p) => p.id)));
    }
  };

  const handleDelete = (id: string) => {
    toast.success("Producto eliminado (demo)");
    setOpenMenu(null);
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.status === "in_stock").length,
    lowStock: products.filter((p) => p.status === "low_stock").length,
    outOfStock: products.filter((p) => p.status === "out_of_stock").length,
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Productos</h1>
          <p className="text-[#6B6B80] text-sm mt-0.5">{filtered.length} productos encontrados</p>
        </div>
        <Button className="gradient-purple text-white font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Nuevo producto
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Package, color: "text-[#9B59D0]" },
          { label: "En stock", value: stats.inStock, icon: CheckCircle, color: "text-green-400" },
          { label: "Stock bajo", value: stats.lowStock, icon: AlertTriangle, color: "text-yellow-400" },
          { label: "Sin stock", value: stats.outOfStock, icon: X, color: "text-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 border border-white/8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6B6B80] text-xs">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 border border-white/8 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B80]" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar productos..."
              className="pl-9 bg-white/5 border-white/15 text-white placeholder:text-[#6B6B80] focus:border-[#7B2FBE] h-10 rounded-xl text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#6B6B80] flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
              className="bg-white/5 border border-white/15 text-white rounded-xl px-3 h-10 text-sm focus:border-[#7B2FBE] outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="in_stock">En stock</option>
              <option value="low_stock">Stock bajo</option>
              <option value="out_of_stock">Sin stock</option>
            </select>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategoryFilter(cat); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? "gradient-purple text-white"
                  : "bg-white/5 text-[#A0A0B8] hover:bg-white/10 border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-purple rounded-xl px-4 py-3 border border-[#7B2FBE]/40 flex items-center gap-3"
          >
            <span className="text-white text-sm font-medium">{selected.size} seleccionados</span>
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 rounded-lg text-xs h-8 px-3"
                onClick={() => toast.success("Exportado (demo)")}
              >
                <Upload className="w-3 h-3 mr-1" /> Exportar
              </Button>
              <Button
                variant="outline"
                className="border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-lg text-xs h-8 px-3"
                onClick={() => { setSelected(new Set()); toast.success("Eliminados (demo)"); }}
              >
                <Trash2 className="w-3 h-3 mr-1" /> Eliminar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-[#6B6B80]">
                <th className="text-left px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === paginated.length && paginated.length > 0}
                    onChange={selectAll}
                    className="accent-[#7B2FBE] w-4 h-4 rounded cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium">Producto</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 font-medium">Precio</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Stock</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Ventas</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product, i) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`border-b border-white/5 hover:bg-white/3 transition-colors ${
                    selected.has(product.id) ? "bg-[#7B2FBE]/8" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="accent-[#7B2FBE] w-4 h-4 rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-white font-medium leading-tight">{product.name}</p>
                        <p className="text-[#6B6B80] text-xs">{product.brand} · {product.variants} variantes</p>
                      </div>
                      {product.featured && (
                        <TrendingUp className="w-3.5 h-3.5 text-[#9B59D0] flex-shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-[#A0A0B8] text-xs bg-white/5 px-2.5 py-1 rounded-lg">{product.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-semibold text-xs">{formatARS(product.price)}</p>
                      {product.compare_price && (
                        <p className="text-[#6B6B80] text-xs line-through">{formatARS(product.compare_price)}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-sm font-semibold ${
                      product.stock === 0 ? "text-red-400" :
                      product.stock <= 3 ? "text-yellow-400" : "text-white"
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-[#A0A0B8] text-xs">{product.sales}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs border ${STATUS_CONFIG[product.status].class}`}>
                      {STATUS_CONFIG[product.status].label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === product.id ? null : product.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-[#6B6B80] hover:text-white transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {openMenu === product.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -5 }}
                          className="absolute right-4 top-full mt-1 z-50 glass rounded-xl border border-white/15 py-1.5 w-36 shadow-xl"
                        >
                          <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors">
                            <Eye className="w-3.5 h-3.5 text-[#9B59D0]" /> Ver
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors">
                            <Edit2 className="w-3.5 h-3.5 text-blue-400" /> Editar
                          </button>
                          <div className="h-px bg-white/10 my-1" />
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-white/8 flex items-center justify-between">
            <span className="text-[#6B6B80] text-xs">
              Mostrando {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} de {filtered.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#6B6B80] hover:text-white transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    n === page ? "gradient-purple text-white" : "text-[#6B6B80] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#6B6B80] hover:text-white transition-colors disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Close menus on outside click */}
      {openMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}
