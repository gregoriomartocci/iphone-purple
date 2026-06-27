"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import type { Product } from "@/types";
import { formatARS } from "@/utils/format";
import { useCartStore } from "@/stores/cart";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  showBadge?: "bestseller" | "featured" | "sale" | "new";
}

export function ProductCard({ product, showBadge }: ProductCardProps) {
  const [wished, setWished] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const primaryVariant = product.variants?.[0];
  const primaryImage =
    product.images?.find((i) => i.is_primary)?.url ?? product.images?.[0]?.url;
  const hasDiscount =
    primaryVariant?.compare_price_ars &&
    primaryVariant.compare_price_ars > primaryVariant.price_ars;
  const discountPct = hasDiscount
    ? Math.round(
        ((primaryVariant!.compare_price_ars! - primaryVariant!.price_ars) /
          primaryVariant!.compare_price_ars!) *
          100
      )
    : 0;

  const isOutOfStock = primaryVariant?.stock === 0;
  const isLowStock =
    primaryVariant &&
    primaryVariant.stock > 0 &&
    primaryVariant.stock <= primaryVariant.low_stock_threshold;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!primaryVariant) return;
    addItem({
      variantId: primaryVariant.id,
      productId: product.id,
      productName: product.name,
      variantName: primaryVariant.name,
      productImage: primaryImage ?? null,
      price: primaryVariant.price_ars,
      quantity: 1,
      stock: primaryVariant.stock,
      slug: product.slug,
    });
    toast.success(`${product.name} agregado al carrito`, {
      icon: "🛒",
    });
  };

  return (
    <Link href={`/catalogo/${product.slug}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden cursor-pointer border border-transparent hover:border-[#F0F0F0] transition-all duration-300">
        {/* Image container */}
        <div className="relative aspect-square bg-[#F5F5F5] overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-[#CCC]" />
            </div>
          )}

          {/* Top-left badge: out-of-stock or discount */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isOutOfStock ? (
              <span className="bg-[#F5F5F5] text-[#999] text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                Agotado
              </span>
            ) : hasDiscount ? (
              <span className="bg-[#7B2FBE] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                -{discountPct}%
              </span>
            ) : null}

            {/* Prop-driven badge overrides */}
            {showBadge === "bestseller" && (
              <span className="bg-[#FFD700] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                Más vendido
              </span>
            )}
            {showBadge === "new" && (
              <span className="bg-[#22C55E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                Nuevo
              </span>
            )}
            {showBadge === "featured" && (
              <span className="bg-[#7B2FBE] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                Destacado
              </span>
            )}

            {/* Low stock warning */}
            {isLowStock && (
              <span className="bg-[#FFF3CD] text-[#856404] text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                ¡Últimas unidades!
              </span>
            )}
          </div>

          {/* Wishlist heart — top-right */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setWished(!wished);
              toast.success(
                wished ? "Eliminado de favoritos" : "Guardado en favoritos",
                { icon: wished ? "💔" : "❤️" }
              );
            }}
            className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                wished
                  ? "fill-[#7B2FBE] text-[#7B2FBE]"
                  : "text-[#999] hover:text-[#7B2FBE]"
              }`}
            />
          </button>

          {/* Add to cart overlay — slides up from bottom */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || !primaryVariant}
              className="w-full bg-[#111] text-white text-xs font-semibold py-2.5 rounded-b-xl flex items-center justify-center gap-2 hover:bg-[#222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {isOutOfStock ? "Sin stock" : "Agregar al carrito"}
            </button>
          </div>
        </div>

        {/* Info section */}
        <div className="pt-3 pb-4 px-1">
          {/* Brand */}
          {product.brand?.name && (
            <p className="text-xs text-[#999] uppercase tracking-wide mb-0.5">
              {product.brand.name}
            </p>
          )}

          {/* Name */}
          <h3 className="text-sm font-semibold text-[#111] line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Color swatches / storage chips */}
          {product.variants && product.variants.length > 1 && (
            <div className="flex items-center gap-1 mt-1.5">
              {product.variants.slice(0, 5).map((v) => {
                const colorHex = v.attributes?.color_hex;
                const storage = v.attributes?.storage;
                return colorHex ? (
                  <div
                    key={v.id}
                    title={v.name}
                    className="w-3.5 h-3.5 rounded-full border border-[#E0E0E0]"
                    style={{ backgroundColor: colorHex }}
                  />
                ) : storage ? (
                  <span
                    key={v.id}
                    className="text-[10px] text-[#777] bg-[#F5F5F5] px-1.5 py-0.5 rounded"
                  >
                    {storage}
                  </span>
                ) : null;
              })}
              {product.variants.length > 5 && (
                <span className="text-[10px] text-[#999]">
                  +{product.variants.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Price row */}
          <div className="mt-1.5">
            <span className="text-base font-bold text-[#111]">
              {primaryVariant ? formatARS(primaryVariant.price_ars) : "—"}
            </span>
            {hasDiscount && (
              <span className="text-sm text-[#999] line-through ml-1.5 inline">
                {formatARS(primaryVariant!.compare_price_ars!)}
              </span>
            )}
          </div>

          {/* Cuotas */}
          {primaryVariant && primaryVariant.price_ars >= 50000 && (
            <p className="text-[11px] text-[#999] mt-0.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#7B2FBE]" />
              12x sin interés
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
