"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "iPhone",
    slug: "iphone",
    imageSrc:
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80",
  },
  {
    name: "Samsung",
    slug: "samsung",
    imageSrc:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80",
  },
  {
    name: "Accesorios",
    slug: "accesorios",
    imageSrc:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80",
  },
  {
    name: "Auriculares",
    slug: "auriculares",
    imageSrc:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
  },
  {
    name: "Fundas",
    slug: "fundas",
    imageSrc:
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&q=80",
  },
  {
    name: "Cargadores",
    slug: "cargadores",
    imageSrc:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
  },
];

export function CategoriesSection() {
  return (
    <section className="bg-[#F7F7F7] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <p className="text-[10px] font-semibold tracking-[0.2em] text-[#7B2FBE] uppercase mb-2">
          EXPLORAR
        </p>
        <h2 className="text-3xl font-bold text-[#111] tracking-tight">
          Encontrá lo que buscás
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-10">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalogo?categoria=${cat.slug}`}
              className="bg-white rounded-xl overflow-hidden cursor-pointer group border border-transparent hover:border-[#E8E8E8] transition-all"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={cat.imageSrc}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#111]">
                  {cat.name}
                </span>
                <ArrowRight className="w-4 h-4 text-[#999] group-hover:text-[#7B2FBE] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
