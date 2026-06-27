"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Zap,
  Shield,
  Truck,
  Star,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { formatARS } from "@/utils/format";
import { toast } from "sonner";
import type { Product } from "@/types";

// Mock product for development — replace with Supabase fetch
const MOCK_PRODUCT: Product = {
  id: "1",
  name: "iPhone 16 Pro Max",
  slug: "iphone-16-pro-max",
  description:
    "El iPhone 16 Pro Max lleva la experiencia iPhone al siguiente nivel. Con el chip A18 Pro, el sistema de cámara Pro más avanzado de Apple y una pantalla Super Retina XDR de 6.9 pulgadas con ProMotion, cada momento queda capturado con claridad excepcional.",
  short_description: "El iPhone más avanzado. Chip A18 Pro. Cámara 48MP. Titanio.",
  brand_id: "apple",
  category_id: "iphone",
  sku: "IPH-16PM-256-BT",
  status: "active",
  is_featured: true,
  is_bestseller: true,
  tags: ["nuevo", "pro", "titanio"],
  specs: {
    display: '6.9" Super Retina XDR OLED, 2868x1320, 460ppi, 120Hz ProMotion',
    chip: "Apple A18 Pro — 6-core CPU, 6-core GPU, 16-core Neural Engine",
    camera: "Cámara principal 48MP f/1.78, Ultra Wide 48MP, Teleobjetivo 12MP 5x",
    battery: "4685 mAh — hasta 33hs reproducción de video",
    os: "iOS 18",
    connectivity: "5G, Wi-Fi 7, Bluetooth 5.3, Ultra Wideband, NFC",
    dimensions: "163.0 × 77.6 × 8.25 mm",
    weight: "227 g",
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  brand: { id: "apple", name: "Apple", slug: "apple", logo_url: null, is_active: true },
  variants: [
    {
      id: "v1",
      product_id: "1",
      name: "256GB - Titanio Negro",
      sku: "IPH-16PM-256-BT",
      price_ars: 2100000,
      price_usd: 2100,
      compare_price_ars: 2400000,
      cost_price: null,
      stock: 5,
      low_stock_threshold: 3,
      attributes: { storage: "256GB", color: "Titanio Negro", color_hex: "#1C1C1E" },
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "v2",
      product_id: "1",
      name: "512GB - Titanio Negro",
      sku: "IPH-16PM-512-BT",
      price_ars: 2550000,
      price_usd: 2550,
      compare_price_ars: null,
      cost_price: null,
      stock: 3,
      low_stock_threshold: 3,
      attributes: { storage: "512GB", color: "Titanio Negro", color_hex: "#1C1C1E" },
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "v3",
      product_id: "1",
      name: "256GB - Titanio Blanco",
      sku: "IPH-16PM-256-WT",
      price_ars: 2100000,
      price_usd: 2100,
      compare_price_ars: 2400000,
      cost_price: null,
      stock: 8,
      low_stock_threshold: 3,
      attributes: { storage: "256GB", color: "Titanio Blanco", color_hex: "#E8E3DC" },
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "v4",
      product_id: "1",
      name: "1TB - Titanio Natural",
      sku: "IPH-16PM-1TB-NT",
      price_ars: 3200000,
      price_usd: 3200,
      compare_price_ars: null,
      cost_price: null,
      stock: 2,
      low_stock_threshold: 3,
      attributes: { storage: "1TB", color: "Titanio Natural", color_hex: "#B5A49B" },
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ],
  images: [
    { id: "i1", product_id: "1", variant_id: null, url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80", alt: "iPhone 16 Pro Max frontal", sort_order: 0, is_primary: true },
    { id: "i2", product_id: "1", variant_id: null, url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80", alt: "iPhone 16 Pro Max lateral", sort_order: 1, is_primary: false },
    { id: "i3", product_id: "1", variant_id: null, url: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=800&q=80", alt: "iPhone 16 Pro Max cámara", sort_order: 2, is_primary: false },
    { id: "i4", product_id: "1", variant_id: null, url: "https://images.unsplash.com/photo-1613588718956-c2e80305bf61?w=800&q=80", alt: "iPhone 16 Pro Max packaging", sort_order: 3, is_primary: false },
  ],
  reviews_aggregate: { avg_rating: 4.9, count: 47 },
};

const MOCK_REVIEWS = [
  { id: "r1", name: "Valentina M.", rating: 5, date: "hace 3 días", text: "Increíble equipo, llegó en perfectas condiciones. La cámara es espectacular y la batería dura todo el día. Super recomendado.", verified: true },
  { id: "r2", name: "Lucas G.", rating: 5, date: "hace 1 semana", text: "Excelente atención y rapidez en el envío. El iPhone llegó con garantía oficial y packaging original.", verified: true },
  { id: "r3", name: "Sofía R.", rating: 4, date: "hace 2 semanas", text: "Muy buen equipo, el proceso de compra fue muy fácil. Lo recomiendo.", verified: false },
];

type TabValue = "descripcion" | "specs" | "reviews";

export default function ProductPage() {
  const product = MOCK_PRODUCT;
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants![0].id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [wished, setWished] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>("descripcion");
  const addItem = useCartStore((s) => s.addItem);

  const selectedVariant = product.variants!.find((v) => v.id === selectedVariantId)!;
  const images = product.images ?? [];
  const currentImage = images[currentImageIndex];

  const storages = [...new Set(product.variants!.map((v) => v.attributes?.storage).filter(Boolean))] as string[];
  const colors = [...new Set(product.variants!.map((v) => v.attributes?.color).filter(Boolean))] as string[];
  const selectedStorage = selectedVariant.attributes?.storage;
  const selectedColor = selectedVariant.attributes?.color;

  const handleAddToCart = () => {
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      variantName: selectedVariant.name,
      productImage: images[0]?.url ?? null,
      price: selectedVariant.price_ars,
      quantity: 1,
      stock: selectedVariant.stock,
      slug: product.slug,
    });
    toast.success("¡Agregado al carrito!", { icon: "🛒" });
  };

  const hasDiscount = selectedVariant.compare_price_ars && selectedVariant.compare_price_ars > selectedVariant.price_ars;
  const discountPct = hasDiscount
    ? Math.round(((selectedVariant.compare_price_ars! - selectedVariant.price_ars) / selectedVariant.compare_price_ars!) * 100)
    : 0;

  const tabs: { value: TabValue; label: string }[] = [
    { value: "descripcion", label: "Descripción" },
    { value: "specs", label: "Especificaciones" },
    { value: "reviews", label: `Reseñas (${product.reviews_aggregate?.count ?? 0})` },
  ];

  return (
    <div className="bg-white min-h-screen pt-14">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#999] mb-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#111] transition-colors">Inicio</Link>
          <span className="text-[#DDD]">/</span>
          <Link href="/catalogo" className="hover:text-[#111] transition-colors">Catálogo</Link>
          <span className="text-[#DDD]">/</span>
          <span className="text-[#111]">{product.name}</span>
        </nav>

        {/* 2-col layout */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Images column */}
          <div>
            {/* Main image */}
            <div className="relative bg-[#F7F7F7] rounded-2xl aspect-square flex items-center justify-center overflow-hidden p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage?.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {currentImage && (
                    <Image
                      src={currentImage.url}
                      alt={currentImage.alt ?? product.name}
                      fill
                      className="object-contain max-h-80"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white border border-[#E8E8E8] rounded-full w-9 h-9 flex items-center justify-center shadow-sm hover:border-[#999] text-[#666] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white border border-[#E8E8E8] rounded-full w-9 h-9 flex items-center justify-center shadow-sm hover:border-[#999] text-[#666] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.tags?.includes("nuevo") && (
                  <span className="bg-[#111] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    NUEVO
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-[#7B2FBE] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    -{discountPct}%
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails row */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-xl bg-[#F7F7F7] overflow-hidden p-2 cursor-pointer border-2 transition-colors ${
                    i === currentImageIndex
                      ? "border-[#7B2FBE]"
                      : "border-transparent hover:border-[#E8E8E8]"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? ""}
                    fill
                    className="object-contain p-2"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Info column */}
          <div>
            {/* Brand */}
            <p className="text-xs text-[#999] uppercase tracking-widest mb-1">
              {product.brand?.name}
            </p>

            {/* Name */}
            <h1 className="text-3xl font-bold text-[#111] leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviews_aggregate && product.reviews_aggregate.count > 0 && (
              <a href="#reviews" className="flex items-center gap-1 mt-2">
                <div className="flex items-center gap-0.5 text-[#F59E0B] text-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.reviews_aggregate!.avg_rating)
                          ? "fill-[#F59E0B] text-[#F59E0B]"
                          : "text-[#E8E8E8]"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#999]">
                  {product.reviews_aggregate.avg_rating.toFixed(1)} ({product.reviews_aggregate.count} reseñas)
                </span>
              </a>
            )}

            {/* Price block */}
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#111] font-price">
                {formatARS(selectedVariant.price_ars)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-[#999] line-through font-price">
                  {formatARS(selectedVariant.compare_price_ars!)}
                </span>
              )}
              {hasDiscount && (
                <span className="bg-[#F3EEFF] text-[#7B2FBE] text-xs font-semibold px-2 py-0.5 rounded-md">
                  -{discountPct}%
                </span>
              )}
            </div>

            {/* Cuotas */}
            <p className="text-sm text-[#666] mt-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#7B2FBE]" />
              12x {formatARS(Math.ceil(selectedVariant.price_ars / 12))} sin interés
            </p>

            {/* Stock warning */}
            {selectedVariant.stock > 0 && selectedVariant.stock <= selectedVariant.low_stock_threshold && (
              <p className="text-sm text-amber-600 font-medium mt-2">
                ¡Solo {selectedVariant.stock} {selectedVariant.stock === 1 ? "unidad disponible" : "unidades disponibles"}!
              </p>
            )}

            <hr className="border-t border-[#F0F0F0] my-5" />

            {/* Storage selector */}
            {storages.length > 1 && (
              <div>
                <p className="text-sm font-medium text-[#111] mb-2">
                  Almacenamiento: <span className="font-normal text-[#666]">{selectedStorage}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {storages.map((storage) => {
                    const variant = product.variants!.find(
                      (v) => v.attributes?.storage === storage && v.attributes?.color === selectedColor
                    );
                    const isSelected = selectedStorage === storage;
                    return (
                      <button
                        key={storage}
                        onClick={() => variant && setSelectedVariantId(variant.id)}
                        disabled={!variant || !variant.is_active}
                        className={`border rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                          isSelected
                            ? "border-[#7B2FBE] bg-[#F3EEFF] text-[#7B2FBE]"
                            : "border-[#E8E8E8] text-[#666] hover:border-[#999]"
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {storage}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color selector */}
            {colors.length > 1 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-[#111] mb-2">
                  Color: <span className="font-normal text-[#666]">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const variant = product.variants!.find(
                      (v) => v.attributes?.color === color && v.attributes?.storage === selectedStorage
                    );
                    const colorHex = product.variants!.find((v) => v.attributes?.color === color)?.attributes?.color_hex;
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => variant && setSelectedVariantId(variant.id)}
                        disabled={!variant || !variant.is_active}
                        title={color}
                        className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                          isSelected ? "border-[#7B2FBE] scale-110" : "border-[#E8E8E8] hover:border-[#999]"
                        } disabled:opacity-40`}
                        style={{ backgroundColor: colorHex ?? "#999" }}
                      >
                        {isSelected && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-2 h-2 bg-white rounded-full shadow-lg" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={selectedVariant.stock === 0}
              className="mt-6 bg-[#7B2FBE] text-white w-full py-4 rounded-2xl text-base font-bold hover:bg-[#6D28D9] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              {selectedVariant.stock === 0 ? "Sin stock" : "Agregar al carrito"}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => {
                setWished(!wished);
                toast.success(wished ? "Eliminado de favoritos" : "Guardado en favoritos");
              }}
              className={`mt-2 border border-[#E8E8E8] w-full py-3.5 rounded-2xl text-sm font-medium hover:border-[#999] flex items-center justify-center gap-2 transition-colors ${
                wished ? "text-red-500 border-red-200" : "text-[#666]"
              }`}
            >
              <Heart className={`w-4 h-4 ${wished ? "fill-red-500" : ""}`} />
              {wished ? "Guardado en favoritos" : "Agregar a favoritos"}
            </button>

            {/* Benefits row */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: <Truck className="w-4 h-4 text-[#7B2FBE]" />, text: "Envío 24hs" },
                { icon: <Shield className="w-4 h-4 text-[#7B2FBE]" />, text: "Garantía oficial" },
                { icon: <MessageCircle className="w-4 h-4 text-[#7B2FBE]" />, text: "Soporte 24/7" },
                { icon: <Zap className="w-4 h-4 text-[#7B2FBE]" />, text: "Pago en cuotas" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-2 text-xs text-[#666]">
                  {b.icon}
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <div className="mt-12" id="reviews">
          {/* Tab list */}
          <div className="border-b border-[#E8E8E8] flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === tab.value
                    ? "border-b-2 border-[#7B2FBE] text-[#111]"
                    : "text-[#999] hover:text-[#666]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="pt-6">
            {activeTab === "descripcion" && (
              <p className="text-sm text-[#666] leading-relaxed max-w-2xl">
                {product.description}
              </p>
            )}

            {activeTab === "specs" && product.specs && (
              <div className="max-w-2xl divide-y divide-[#F0F0F0]">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="py-3 flex justify-between gap-4">
                    <span className="text-[#999] text-sm capitalize w-28 flex-shrink-0">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-[#111] text-sm text-right">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                {/* Rating summary */}
                <div className="flex items-center gap-8 mb-8">
                  <div className="text-center">
                    <p className="text-5xl font-black text-[#111]">
                      {product.reviews_aggregate?.avg_rating.toFixed(1)}
                    </p>
                    <div className="flex items-center justify-center gap-0.5 my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                      ))}
                    </div>
                    <p className="text-[#999] text-sm">
                      {product.reviews_aggregate?.count} reseñas
                    </p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-[#999] text-xs w-2">{stars}</span>
                        <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                        <div className="flex-1 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#7B2FBE] rounded-full"
                            style={{ width: stars === 5 ? "78%" : stars === 4 ? "16%" : "4%" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review list */}
                <div className="space-y-4 max-w-2xl">
                  {MOCK_REVIEWS.map((review) => (
                    <div key={review.id} className="bg-[#F7F7F7] rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 bg-[#7B2FBE] rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {review.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[#111] text-sm font-semibold">{review.name}</p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                              ))}
                              {review.verified && (
                                <span className="ml-1 text-emerald-600 text-[10px] flex items-center gap-0.5">
                                  ✓ Compra verificada
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-[#999] text-xs">{review.date}</span>
                      </div>
                      <p className="text-[#666] text-sm leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
