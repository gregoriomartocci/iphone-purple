"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Smartphone, DollarSign, RefreshCcw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: <Smartphone className="w-6 h-6" />,
    number: "01",
    title: "Cotizá tu equipo",
    description: "Completá el formulario con los datos de tu celular. Obtenés una estimación al instante.",
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    number: "02",
    title: "Recibí la oferta",
    description: "En menos de 24 hs te contactamos con la oferta definitiva y cómo hacemos el canje.",
  },
  {
    icon: <RefreshCcw className="w-6 h-6" />,
    number: "03",
    title: "Canjeá por el nuevo",
    description: "El valor de tu equipo se descuenta directamente del precio del nuevo. Simple.",
  },
];

const tradeInPrices = [
  { model: "iPhone 15 128GB", condition: "Excelente", min: 650000, max: 750000 },
  { model: "iPhone 14 256GB", condition: "Bueno", min: 450000, max: 550000 },
  { model: "iPhone 13 128GB", condition: "Regular", min: 280000, max: 350000 },
  { model: "Samsung S24 256GB", condition: "Excelente", min: 550000, max: 650000 },
  { model: "Samsung A54 128GB", condition: "Bueno", min: 180000, max: 230000 },
];

const formatK = (n: number) => `$${Math.round(n / 1000)}k`;

export function TradeInSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero opacity-70" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7B2FBE] rounded-full blur-[150px] opacity-10" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: content */}
          <div>
            <p className="text-[#9B59D0] text-sm font-semibold uppercase tracking-widest mb-3">
              Plan Canje
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Tu celular usado vale más
              <span className="text-gradient-purple"> de lo que pensás</span>
            </h2>
            <p className="text-[#A0A0B8] leading-relaxed mb-8">
              Compramos tu equipo en cualquier condición. El valor se descuenta
              directamente del precio del celular nuevo que elijas.
            </p>

            {/* Steps */}
            <div className="space-y-5 mb-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 glass-purple rounded-xl flex items-center justify-center text-[#7B2FBE]">
                    {step.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#7B2FBE] text-xs font-bold">{step.number}</span>
                      <h3 className="text-white font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-[#6B6B80] text-sm">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link href="/plan-canje">
              <Button
                size="lg"
                className="gradient-purple text-white font-bold px-8 py-6 text-base rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                Cotizar mi equipo ahora
                <ArrowRight className="w-4.5 h-4.5" />
              </Button>
            </Link>
          </div>

          {/* Right: price table */}
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/8 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#7B2FBE]" />
              <h3 className="text-white font-semibold text-sm">
                Tabla de precios de referencia
              </h3>
            </div>
            <div className="divide-y divide-white/8">
              {tradeInPrices.map((row) => (
                <div
                  key={row.model}
                  className="flex items-center justify-between px-5 py-3 hover:bg-white/3 transition-colors"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{row.model}</p>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium inline-block mt-0.5 ${
                        row.condition === "Excelente"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : row.condition === "Bueno"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-orange-500/20 text-orange-400"
                      }`}
                    >
                      {row.condition}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[#7B2FBE] font-bold text-sm font-price">
                      {formatK(row.min)} – {formatK(row.max)}
                    </p>
                    <p className="text-[#6B6B80] text-[10px]">estimado</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-[#7B2FBE]/10 border-t border-[#7B2FBE]/20">
              <p className="text-[#A0A0B8] text-xs flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                Los valores finales se confirman tras la evaluación del equipo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
