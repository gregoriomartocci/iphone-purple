"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    id: 1,
    tagline: "El poder de lo premium,",
    taglineAccent: "al precio justo.",
    description: "iPhone 16 Pro — chip A18 Pro, cámara 48MP, titanio de grado aeroespacial.",
    price: "Desde $1.299.000",
    ctaPrimary: { label: "Ver iPhone 16 Pro", href: "/catalogo?categoria=iphone" },
    ctaSecondary: { label: "Plan Canje", href: "/plan-canje" },
    badge: "Nuevo",
    imageSrc: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
    imageAlt: "iPhone 16 Pro",
  },
  {
    id: 2,
    tagline: "Samsung Galaxy S25 Ultra,",
    taglineAccent: "domina cada momento.",
    description: "IA avanzada, S Pen incluido, 200MP con zoom 100x. Redefiní la productividad.",
    price: "Desde $1.150.000",
    ctaPrimary: { label: "Ver Samsung S25", href: "/catalogo?categoria=samsung" },
    ctaSecondary: { label: "Comparar", href: "/catalogo" },
    badge: "Destacado",
    imageSrc: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80",
    imageAlt: "Samsung Galaxy S25 Ultra",
  },
  {
    id: 3,
    tagline: "Tu celular usado vale más",
    taglineAccent: "de lo que pensás.",
    description: "Cotizá tu equipo en el momento y canjealo por uno nuevo con descuento.",
    price: "Cotizá gratis",
    ctaPrimary: { label: "Cotizar ahora", href: "/plan-canje" },
    ctaSecondary: { label: "Ver tabla de precios", href: "/plan-canje#precios" },
    badge: "Plan Canje",
    imageSrc: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=800&q=80",
    imageAlt: "Celular en manos — Plan Canje",
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused]);

  const slide = slides[current];

  return (
    <section
      className="relative min-h-[90vh] flex items-center bg-white overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(90vh-5rem)] py-12">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className="inline-flex items-center border border-[#E8E8E8] text-[#666] text-xs rounded-full px-3 py-1 mb-6">
                  {slide.badge}
                </span>

                <h1 className="text-5xl md:text-7xl font-black text-[#111] tracking-tight leading-[0.92]">
                  {slide.tagline}
                  <br />
                  <span className="text-[#7B2FBE]">{slide.taglineAccent}</span>
                </h1>

                <p className="text-[#666] text-lg mt-4 mb-8 max-w-lg leading-relaxed">
                  {slide.description}
                </p>

                <p className="text-3xl font-bold text-[#111] mb-8">{slide.price}</p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href={slide.ctaPrimary.href}>
                    <Button
                      size="lg"
                      className="bg-[#7B2FBE] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-[#6D28D9] transition-colors flex items-center gap-2"
                    >
                      {slide.ctaPrimary.label}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={slide.ctaSecondary.href}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border border-[#E8E8E8] text-[#111] bg-white px-8 py-3.5 rounded-xl font-semibold hover:border-[#999] transition-colors flex items-center gap-2"
                    >
                      <RefreshCcw className="w-4 h-4 text-[#999]" />
                      {slide.ctaSecondary.label}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-72 h-72 sm:w-96 sm:h-96 lg:w-[480px] lg:h-[480px]"
              >
                <div className="relative w-full h-full rounded-3xl overflow-hidden">
                  <Image
                    src={slide.imageSrc}
                    alt={slide.imageAlt}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 640px) 288px, (max-width: 1024px) 384px, 480px"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-2 h-2 bg-[#7B2FBE]"
                  : "w-2 h-2 bg-[#E8E8E8] hover:bg-[#999]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}