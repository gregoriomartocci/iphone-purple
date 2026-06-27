"use client";

import { useState } from "react";
import { Mail, MessageCircle, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="glass-purple rounded-3xl p-8 sm:p-12 border border-[#7B2FBE]/30 text-center relative overflow-hidden">
        {/* BG orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#7B2FBE] rounded-full blur-[120px] opacity-20 pointer-events-none" />

        <div className="relative">
          <p className="text-[#9B59D0] text-sm font-semibold uppercase tracking-widest mb-2">
            Ofertas exclusivas
          </p>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">
            Recibí las mejores ofertas antes que nadie
          </h2>
          <p className="text-[#A0A0B8] max-w-md mx-auto mb-8">
            Subscríbite y recibí descuentos exclusivos, alertas de stock y las mejores promos directamente en tu correo.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <p className="font-semibold">¡Listo! Te vas a enterar de todo primero.</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white/8 border-white/15 text-white placeholder:text-[#6B6B80] focus:border-[#7B2FBE] focus:ring-[#7B2FBE]/30 h-12 rounded-xl"
              />
              <Button
                type="submit"
                className="gradient-purple text-white font-semibold px-6 h-12 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 flex-shrink-0"
              >
                Subscribirme
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-px flex-1 max-w-20 bg-white/15" />
            <span className="text-[#6B6B80] text-sm">o</span>
            <div className="h-px flex-1 max-w-20 bg-white/15" />
          </div>

          <a
            href="https://wa.me/5491100000000?text=Hola%21+Quiero+recibir+ofertas+de+iPhone+Purple"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold text-sm transition-colors"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            Recibir ofertas por WhatsApp
          </a>

          <p className="text-[#6B6B80] text-xs mt-4">
            Sin spam. Podés cancelar cuando quieras.
          </p>
        </div>
      </div>
    </section>
  );
}
