"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface BestsellersSectionProps {
  products: Product[];
}

const TABS = ["Todos", "iPhone", "Samsung", "Accesorios"] as const;
type Tab = (typeof TABS)[number];

export function BestsellersSection({ products }: BestsellersSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Todos");

  const filtered =
    activeTab === "Todos"
      ? products
      : products.filter(
          (p) =>
            p.category?.name?.toLowerCase() === activeTab.toLowerCase() ||
            (p as unknown as { brand?: { name?: string } }).brand?.name?.toLowerCase() ===
              activeTab.toLowerCase()
        );

  const displayProducts = filtered.slice(0, 8);

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <p className="text-[10px] font-semibold tracking-[0.2em] text-[#7B2FBE] uppercase mb-2">
          MÁS VENDIDOS
        </p>
        <h2 className="text-3xl font-bold text-[#111] tracking-tight">
          Los favoritos de nuestros clientes
        </h2>

        {/* Category tabs */}
        <div className="flex items-center gap-2 mt-8 mb-10 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                tab === activeTab
                  ? "bg-[#111] text-white text-sm font-medium px-4 py-2 rounded-full"
                  : "text-[#666] text-sm font-medium px-4 py-2 rounded-full hover:text-[#111] transition-colors"
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showBadge="bestseller"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* CTA */}
        <Link
          href="/catalogo?sort=bestseller"
          className="block w-fit mx-auto mt-10 text-sm font-medium text-[#7B2FBE] hover:underline underline-offset-4"
        >
          Ver todos los productos
        </Link>
      </div>
    </section>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden">
      <div className="aspect-square bg-[#F5F5F5] animate-pulse rounded-xl" />
      <div className="mt-3 space-y-2">
        <div className="h-3 bg-[#EBEBEB] rounded w-3/4" />
        <div className="h-3 bg-[#EBEBEB] rounded w-1/2" />
      </div>
    </div>
  );
}
