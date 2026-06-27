"use client";

import { Zap, Shield, CreditCard, CheckCircle } from "lucide-react";

const benefits = [
  { icon: <Zap className="w-4 h-4" />, text: "Envío express 24hs" },
  { icon: <Shield className="w-4 h-4" />, text: "Garantía oficial" },
  { icon: <CreditCard className="w-4 h-4" />, text: "Hasta 18 cuotas" },
  { icon: <CheckCircle className="w-4 h-4" />, text: "Stock garantizado" },
  { icon: <Zap className="w-4 h-4" />, text: "Envío express 24hs" },
  { icon: <Shield className="w-4 h-4" />, text: "Garantía oficial" },
  { icon: <CreditCard className="w-4 h-4" />, text: "Hasta 18 cuotas" },
  { icon: <CheckCircle className="w-4 h-4" />, text: "Stock garantizado" },
];

export function BenefitsStrip() {
  return (
    <div className="relative py-4 overflow-hidden bg-gradient-to-r from-[#7B2FBE]/20 via-[#12121A] to-[#7B2FBE]/20 border-y border-white/8">
      <div className="flex items-center">
        <div className="flex animate-marquee items-center gap-0 whitespace-nowrap">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-center">
              <div className="flex items-center gap-2 px-6 text-[#A0A0B8] text-sm font-medium">
                <span className="text-[#7B2FBE]">{b.icon}</span>
                {b.text}
              </div>
              <div className="w-px h-4 bg-white/15" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
