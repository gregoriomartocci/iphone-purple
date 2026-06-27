"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Grid2x2, List, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { FiltersSidebar } from "@/components/catalog/FiltersSidebar";
import { ProductCard } from "@/components/product/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/types";

const MOCK_PRODUCTS: Product[] = Array.from({ length: 12 }, (_, i) => ({
  id: `product-${i}`,
  name: i % 3 === 0 ? `iPhone 16 Pro ${i % 2 === 0 ? "256GB" : "512GB"}` : i % 3 === 1 ? `Samsung Galaxy S25 Ultra` : `iPhone 15 128GB`,
  slug: `producto-${i}`,
  description: null,
  short_description: "El smartphone más avanzado del mercado con el mejor procesador.",
  brand_id: null,
  category_id: null,
  sku: null,
  status: "active",
  is_featured: i < 4,
  is_bestseller: i % 2 === 0,
  tags: [],
  specs: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  brand: { id: "b1", name: i % 3 === 1 ? "Samsung" : "Apple", slug: i % 3 === 1 ? "samsung" : "apple", logo_url: null, is_active: true },
  variants: [
    {
      id: `variant-${i}`,
      product_id: `product-${i}`,
      name: "128GB - Negro Espacial",
      sku: null,
      price_ars: [1200000, 850000, 650000, 2100000, 780000][i % 5],
      price_usd: null,
      compare_price_ars: i % 3 === 0 ? [1400000, 950000, 750000, 2500000, 900000][i % 5] : null,
      cost_price: null,
      stock: i % 5 === 0 ? 0 : i % 4 === 0 ? 2 : 15,
      low_stock_threshold: 3,
      attributes: { storage: "128GB", color: "Negro" },
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ],
  images: [],
  reviews_aggregate: { avg_rating: 4.5 + (i % 5) * 0.1, count: 12 + i * 3 },
}));

type ViewMode = "grid3" | "grid2" | "list";

const TOTAL_PAGES = 8;

function CatalogContent() {
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid3");
  const [currentPage, setCurrentPage] = useState(1);

  const categoria = searchParams.get("categoria");

  const pageLabel = categoria
    ? categoria.charAt(0).toUpperCase() + categoria.slice(1)
    : "Todos los productos";

  return (
    <div className="bg-white min-h-screen">
      {/* Page header */}
      <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#111]">{pageLabel}</h1>
        <p className="text-[#666] text-sm mt-1">
          Mostrando {MOCK_PRODUCTS.length} de {MOCK_PRODUCTS.length} productos
        </p>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 pb-16 flex gap-8">
        {/* Left sidebar — desktop */}
        <aside className="w-56 flex-shrink-0 hidden md:block">
          <FiltersSidebar />
        </aside>

        {/* Right main */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <span className="text-sm text-[#666]">
              {MOCK_PRODUCTS.length} productos
            </span>

            <div className="flex items-center gap-2 ml-auto">
              {/* Sort */}
              <select
                defaultValue="relevancia"
                className="border border-[#E8E8E8] rounded-xl bg-white text-sm text-[#111] px-3 py-2 focus:border-[#7B2FBE] outline-none"
              >
                <option value="relevancia">Relevancia</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nuevo">Más nuevos</option>
                <option value="calificados">Mejor calificados</option>
                <option value="vendidos">Más vendidos</option>
              </select>

              {/* View toggle */}
              <div className="hidden sm:flex items-center gap-1">
                {(
                  [
                    { mode: "grid3", Icon: LayoutGrid },
                    { mode: "grid2", Icon: Grid2x2 },
                    { mode: "list", Icon: List },
                  ] as const
                ).map(({ mode, Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === mode
                        ? "text-[#111]"
                        : "text-[#CCC] hover:text-[#111]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>

              {/* Mobile filter button */}
              <button
                onClick={() => setFiltersOpen(true)}
                className="border border-[#E8E8E8] text-[#666] text-sm rounded-xl px-3 py-2 hover:border-[#999] md:hidden flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
              </button>
            </div>
          </div>

          {/* Product grid */}
          <motion.div
            layout
            className={`grid gap-4 ${
              viewMode === "grid3"
                ? "grid-cols-2 md:grid-cols-3"
                : viewMode === "grid2"
                ? "grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {MOCK_PRODUCTS.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ProductCard
                  product={product}
                  showBadge={product.is_bestseller ? "bestseller" : product.variants?.[0]?.compare_price_ars ? "sale" : undefined}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          <div className="mt-10 flex justify-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-xl text-sm flex items-center justify-center text-[#999] hover:text-[#111] disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-[#7B2FBE] text-white"
                    : "text-[#666] hover:bg-[#F5F5F5]"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))}
              disabled={currentPage === TOTAL_PAGES}
              className="w-9 h-9 rounded-xl text-sm flex items-center justify-center text-[#999] hover:text-[#111] disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[80] md:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-[90] md:hidden max-h-[85vh] overflow-y-auto bg-white rounded-t-2xl shadow-xl"
            >
              <div className="sticky top-0 flex justify-center pt-3 pb-1 bg-white">
                <div className="w-12 h-1 bg-[#E8E8E8] rounded-full" />
              </div>
              <div className="px-5 pb-8">
                <FiltersSidebar onClose={() => setFiltersOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white min-h-screen pt-20 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#7B2FBE] border-t-transparent animate-spin" />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
