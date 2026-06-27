"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Valentina M.",
    avatar: "VM",
    rating: 5,
    date: "hace 3 días",
    product: "iPhone 16 Pro 256GB",
    text: "Compré el iPhone 16 Pro y quedé fascinada. Llegó súper rápido (al otro día), impecable, con garantía oficial. El proceso fue muy simple y el seguimiento en tiempo real es un golazo. Definitivamente vuelvo a comprar acá.",
  },
  {
    id: 2,
    name: "Lucas G.",
    avatar: "LG",
    rating: 5,
    date: "hace 1 semana",
    product: "Samsung Galaxy S24 Ultra",
    text: "Me hicieron el Plan Canje de mi S22 y la experiencia fue 10 puntos. El valor que me dieron fue justo, sin vueltas. Me llevé el S24 Ultra con un descuento bárbaro. Los recomiendo 100%.",
  },
  {
    id: 3,
    name: "Sofía R.",
    avatar: "SR",
    rating: 5,
    date: "hace 2 semanas",
    product: "AirPods Pro 2",
    text: "Excelente atención, precios competitivos y envío rapidísimo. Compré los AirPods Pro 2 y llegaron perfectos con todo el packaging original. El chatbot me ayudó a resolver una duda al instante.",
  },
  {
    id: 4,
    name: "Martín F.",
    avatar: "MF",
    rating: 5,
    date: "hace 3 semanas",
    product: "iPhone 15 128GB",
    text: "Venía con miedo de comprar un iPhone online pero la experiencia fue increíble. La page es muy clara, el checkout simple, y el equipo llegó con el IMEI limpio y garantía. Total confianza.",
  },
];

export function ReviewsSection() {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i - 1 + reviews.length) % reviews.length);
  const next = () => setIndex((i) => (i + 1) % reviews.length);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-[#7B2FBE] text-sm font-semibold uppercase tracking-widest mb-2">
          Lo que dicen los clientes
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-white">
          Más de 500 compras verificadas
        </h2>
        <div className="flex items-center justify-center gap-1 mt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-[#FFD700] text-[#FFD700]" />
          ))}
          <span className="text-[#A0A0B8] ml-2 text-sm">4.9 de 5 estrellas</span>
        </div>
      </div>

      {/* Desktop: grid */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reviews.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5 border border-white/8 hover:border-[#7B2FBE]/30 transition-all"
          >
            <ReviewCard review={review} />
          </motion.div>
        ))}
      </div>

      {/* Mobile: carousel */}
      <div className="md:hidden">
        <div className="relative overflow-hidden rounded-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="glass p-5 border border-white/8 rounded-2xl"
            >
              <ReviewCard review={reviews[index]} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={prev}
            className="w-9 h-9 glass rounded-full flex items-center justify-center text-[#A0A0B8] hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === index ? "w-5 h-2 gradient-purple" : "w-2 h-2 bg-white/25"
              }`}
            />
          ))}
          <button
            onClick={next}
            className="w-9 h-9 glass rounded-full flex items-center justify-center text-[#A0A0B8] hover:text-white transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: (typeof reviews)[0] }) {
  return (
    <>
      <Quote className="w-6 h-6 text-[#7B2FBE] mb-3 opacity-60" />
      <p className="text-[#A0A0B8] text-sm leading-relaxed mb-4 line-clamp-4">{review.text}</p>
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-[#FFD700] text-[#FFD700]" />
        ))}
      </div>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 gradient-purple rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {review.avatar}
        </div>
        <div>
          <p className="text-white text-sm font-semibold">{review.name}</p>
          <p className="text-[#6B6B80] text-xs">{review.product}</p>
        </div>
        <span className="ml-auto text-[#6B6B80] text-[10px]">{review.date}</span>
      </div>
    </>
  );
}
