"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Star,
  Package,
  Camera,
  DollarSign,
  User,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatARS } from "@/utils/format";

const DEVICE_BRANDS = ["Apple", "Samsung", "Motorola", "Xiaomi", "Huawei", "Otro"];
const IPHONE_MODELS = ["iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14", "iPhone 13", "iPhone 12", "iPhone SE", "Otro"];
const SAMSUNG_MODELS = ["Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy S23", "Galaxy A54", "Galaxy A34", "Otro"];
const STORAGES = ["64GB", "128GB", "256GB", "512GB", "1TB", "No sé"];

const CONDITIONS = [
  { value: "excelente", label: "Excelente", desc: "Sin rayones ni daños. Pantalla perfecta. Funciona al 100%.", color: "emerald" },
  { value: "bueno", label: "Bueno", desc: "Algún rayón leve. Pantalla sin fisuras. Funciona bien.", color: "blue" },
  { value: "regular", label: "Regular", desc: "Rayones visibles o daños menores. Funciona.", color: "orange" },
  { value: "roto", label: "Roto", desc: "Pantalla fisura o daño importante. Puede o no encender.", color: "red" },
];

const formSchema = z.object({
  brand: z.string().min(1, "Seleccioná la marca"),
  model: z.string().min(1, "Seleccioná el modelo"),
  storage: z.string().min(1, "Seleccioná el almacenamiento"),
  condition: z.string().min(1, "Seleccioná la condición"),
  contact_name: z.string().min(2, "Ingresá tu nombre"),
  contact_phone: z.string().min(8, "Ingresá tu teléfono"),
  contact_email: z.string().email("Email inválido"),
});

type TradeInForm = z.infer<typeof formSchema>;

const PRICE_TABLE = [
  { model: "iPhone 15 Pro Max 256GB", condition: "Excelente", min: 900000, max: 1050000 },
  { model: "iPhone 15 128GB", condition: "Excelente", min: 650000, max: 750000 },
  { model: "iPhone 14 256GB", condition: "Bueno", min: 480000, max: 560000 },
  { model: "iPhone 13 128GB", condition: "Regular", min: 280000, max: 350000 },
  { model: "iPhone 12 128GB", condition: "Excelente", min: 220000, max: 280000 },
  { model: "Samsung S24 Ultra 256GB", condition: "Excelente", min: 700000, max: 850000 },
  { model: "Samsung S23 128GB", condition: "Bueno", min: 380000, max: 450000 },
  { model: "Samsung A54 256GB", condition: "Excelente", min: 200000, max: 260000 },
];

const STEPS = [
  { id: 1, label: "Tu dispositivo", icon: <Smartphone className="w-4 h-4" /> },
  { id: 2, label: "Estado", icon: <Star className="w-4 h-4" /> },
  { id: 3, label: "Accesorios", icon: <Package className="w-4 h-4" /> },
  { id: 4, label: "Cotización", icon: <DollarSign className="w-4 h-4" /> },
  { id: 5, label: "Contacto", icon: <User className="w-4 h-4" /> },
];

export default function PlanCanjePage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [hasBox, setHasBox] = useState(false);
  const [hasCharger, setHasCharger] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TradeInForm>({
    resolver: zodResolver(formSchema),
  });

  const selectedBrand = watch("brand");
  const selectedCondition = watch("condition");

  const models = selectedBrand === "Apple" ? IPHONE_MODELS : selectedBrand === "Samsung" ? SAMSUNG_MODELS : ["Otro"];

  const estimatedValue = () => {
    const conditionMap: Record<string, number> = { excelente: 1, bueno: 0.75, regular: 0.5, roto: 0.25 };
    const base = 500000;
    return {
      min: Math.round(base * (conditionMap[selectedCondition] ?? 0.5) * 0.9),
      max: Math.round(base * (conditionMap[selectedCondition] ?? 0.5) * 1.1),
    };
  };

  const onSubmit = (data: TradeInForm) => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-24 h-24 gradient-purple rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">¡Cotización enviada!</h1>
          <p className="text-[#A0A0B8] mb-6">
            Recibimos tu solicitud. Te contactaremos en menos de 24hs con la oferta definitiva para tu equipo.
          </p>
          <a
            href="https://wa.me/5491100000000?text=Hola%2C+envié+una+solicitud+de+Plan+Canje"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-xl font-semibold transition-colors mb-4"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            Hablar con un asesor por WhatsApp
          </a>
          <br />
          <Button variant="outline" className="border-white/15 bg-white/5 text-white mt-2" onClick={() => { setSubmitted(false); setStep(1); }}>
            Cotizar otro equipo
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[#7B2FBE] text-sm font-semibold uppercase tracking-widest mb-2">Plan Canje</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Cotizá tu equipo <span className="text-gradient-purple">gratis</span>
          </h1>
          <p className="text-[#A0A0B8] max-w-lg mx-auto">
            Completá el formulario y recibís una cotización al instante. Sin compromiso.
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-shrink-0">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                step === s.id ? "gradient-purple text-white" :
                step > s.id ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                "glass text-[#6B6B80] border border-white/10"
              }`}>
                {step > s.id ? <CheckCircle className="w-3.5 h-3.5" /> : s.icon}
                <span className="hidden sm:block">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`w-4 h-px mx-1 ${step > s.id ? "bg-emerald-500/40" : "bg-white/15"}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6 border border-white/8">
              <AnimatePresence mode="wait">
                {/* Step 1: Device */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-white font-bold text-lg mb-5">¿Qué equipo querés canjear?</h2>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-[#A0A0B8] text-sm mb-2 block">Marca *</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {DEVICE_BRANDS.map((brand) => (
                            <button
                              key={brand}
                              type="button"
                              onClick={() => setValue("brand", brand)}
                              className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                                watch("brand") === brand
                                  ? "gradient-purple text-white border-[#7B2FBE]"
                                  : "glass text-[#A0A0B8] border-white/15 hover:text-white hover:border-white/30"
                              }`}
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      </div>
                      {selectedBrand && (
                        <div>
                          <Label className="text-[#A0A0B8] text-sm mb-2 block">Modelo *</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {models.map((model) => (
                              <button
                                key={model}
                                type="button"
                                onClick={() => setValue("model", model)}
                                className={`py-2.5 px-3 rounded-xl text-sm text-left font-medium transition-all border ${
                                  watch("model") === model
                                    ? "gradient-purple text-white border-[#7B2FBE]"
                                    : "glass text-[#A0A0B8] border-white/15 hover:text-white hover:border-white/30"
                                }`}
                              >
                                {model}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {watch("model") && (
                        <div>
                          <Label className="text-[#A0A0B8] text-sm mb-2 block">Almacenamiento *</Label>
                          <div className="flex flex-wrap gap-2">
                            {STORAGES.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setValue("storage", s)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                                  watch("storage") === s
                                    ? "gradient-purple text-white border-[#7B2FBE]"
                                    : "glass text-[#A0A0B8] border-white/15 hover:text-white"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => watch("brand") && watch("model") && watch("storage") && setStep(2)}
                      className="w-full gradient-purple text-white font-bold py-5 rounded-xl mt-6 hover:opacity-90 flex items-center justify-center gap-2"
                      disabled={!watch("brand") || !watch("model") || !watch("storage")}
                    >
                      Continuar <ChevronRight className="w-4.5 h-4.5" />
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Condition */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-white font-bold text-lg mb-5">¿En qué estado está?</h2>
                    <div className="space-y-3">
                      {CONDITIONS.map((c) => {
                        const isSelected = watch("condition") === c.value;
                        const colorMap: Record<string, string> = {
                          emerald: "border-emerald-500 bg-emerald-500/10",
                          blue: "border-blue-500 bg-blue-500/10",
                          orange: "border-orange-500 bg-orange-500/10",
                          red: "border-red-500 bg-red-500/10",
                        };
                        const textMap: Record<string, string> = {
                          emerald: "text-emerald-400",
                          blue: "text-blue-400",
                          orange: "text-orange-400",
                          red: "text-red-400",
                        };
                        return (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setValue("condition", c.value)}
                            className={`w-full flex items-center gap-3 p-4 rounded-xl text-left border transition-all ${
                              isSelected ? colorMap[c.color] : "glass border-white/10 hover:border-white/25"
                            }`}
                          >
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isSelected ? `bg-${c.color}-400` : "bg-white/20"}`} />
                            <div className="flex-1">
                              <p className={`font-semibold text-sm ${isSelected ? textMap[c.color] : "text-white"}`}>
                                {c.label}
                              </p>
                              <p className="text-[#6B6B80] text-xs mt-0.5">{c.desc}</p>
                            </div>
                            {isSelected && <CheckCircle className={`w-5 h-5 flex-shrink-0 text-${c.color}-400`} />}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" onClick={() => setStep(1)} className="border-white/15 bg-white/5 text-white flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" /> Volver
                      </Button>
                      <Button
                        onClick={() => watch("condition") && setStep(3)}
                        disabled={!watch("condition")}
                        className="flex-1 gradient-purple text-white font-bold py-5 rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
                      >
                        Continuar <ChevronRight className="w-4.5 h-4.5" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Accessories */}
                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-white font-bold text-lg mb-2">Accesorios incluidos</h2>
                    <p className="text-[#A0A0B8] text-sm mb-5">Los accesorios aumentan el valor de tu equipo.</p>
                    <div className="space-y-3">
                      {[
                        { checked: hasBox, setChecked: setHasBox, label: "Caja original", desc: "+5% en el valor" },
                        { checked: hasCharger, setChecked: setHasCharger, label: "Cargador original", desc: "+3% en el valor" },
                      ].map((acc) => (
                        <label key={acc.label} className="flex items-center gap-3 glass rounded-xl p-4 border border-white/10 cursor-pointer hover:border-white/25 transition-all">
                          <input
                            type="checkbox"
                            className="accent-[#7B2FBE] w-4 h-4"
                            checked={acc.checked}
                            onChange={(e) => acc.setChecked(e.target.checked)}
                          />
                          <div>
                            <p className="text-white text-sm font-medium">{acc.label}</p>
                            <p className="text-[#7B2FBE] text-xs">{acc.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" onClick={() => setStep(2)} className="border-white/15 bg-white/5 text-white flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" /> Volver
                      </Button>
                      <Button onClick={() => setStep(4)} className="flex-1 gradient-purple text-white font-bold py-5 rounded-xl hover:opacity-90 flex items-center justify-center gap-2">
                        Ver cotización <ArrowRight className="w-4.5 h-4.5" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Quote */}
                {step === 4 && (
                  <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <h2 className="text-white font-bold text-lg mb-5">Tu cotización estimada</h2>
                    <div className="glass-purple rounded-2xl p-6 border border-[#7B2FBE]/30 text-center mb-6">
                      <p className="text-[#A0A0B8] text-sm mb-2">
                        {watch("brand")} {watch("model")} — {watch("storage")} — {CONDITIONS.find(c => c.value === selectedCondition)?.label}
                      </p>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-[#A0A0B8] text-lg">Entre</span>
                        <span className="text-3xl font-black text-white font-price">{formatARS(estimatedValue().min)}</span>
                        <span className="text-[#A0A0B8] text-lg">y</span>
                        <span className="text-3xl font-black text-white font-price">{formatARS(estimatedValue().max)}</span>
                      </div>
                      <p className="text-[#6B6B80] text-xs">Valor orientativo — el precio definitivo se confirma tras evaluación</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(3)} className="border-white/15 bg-white/5 text-white flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" /> Volver
                      </Button>
                      <Button onClick={() => setStep(5)} className="flex-1 gradient-purple text-white font-bold py-5 rounded-xl hover:opacity-90 flex items-center justify-center gap-2">
                        Quiero la oferta definitiva <ArrowRight className="w-4.5 h-4.5" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Contact */}
                {step === 5 && (
                  <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-white font-bold text-lg mb-5">Tus datos de contacto</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <Label className="text-[#A0A0B8] text-sm mb-1 block">Nombre completo *</Label>
                        <Input {...register("contact_name")} placeholder="Juan García" className="bg-white/5 border-white/15 text-white placeholder:text-[#6B6B80] focus:border-[#7B2FBE] h-11 rounded-xl" />
                        {errors.contact_name && <p className="text-red-400 text-xs mt-1">{errors.contact_name.message}</p>}
                      </div>
                      <div>
                        <Label className="text-[#A0A0B8] text-sm mb-1 block">WhatsApp / Teléfono *</Label>
                        <Input {...register("contact_phone")} placeholder="+54 9 11 1234-5678" className="bg-white/5 border-white/15 text-white placeholder:text-[#6B6B80] focus:border-[#7B2FBE] h-11 rounded-xl" />
                        {errors.contact_phone && <p className="text-red-400 text-xs mt-1">{errors.contact_phone.message}</p>}
                      </div>
                      <div>
                        <Label className="text-[#A0A0B8] text-sm mb-1 block">Email *</Label>
                        <Input {...register("contact_email")} type="email" placeholder="juan@email.com" className="bg-white/5 border-white/15 text-white placeholder:text-[#6B6B80] focus:border-[#7B2FBE] h-11 rounded-xl" />
                        {errors.contact_email && <p className="text-red-400 text-xs mt-1">{errors.contact_email.message}</p>}
                      </div>
                      <div className="flex gap-3 mt-2">
                        <Button type="button" variant="outline" onClick={() => setStep(4)} className="border-white/15 bg-white/5 text-white flex items-center gap-2">
                          <ChevronLeft className="w-4 h-4" /> Volver
                        </Button>
                        <Button type="submit" className="flex-1 gradient-purple text-white font-bold py-5 rounded-xl hover:opacity-90 flex items-center justify-center gap-2">
                          <CheckCircle className="w-4.5 h-4.5" />
                          Enviar solicitud
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Price table */}
          <div className="glass rounded-2xl border border-white/8 overflow-hidden h-fit" id="precios">
            <div className="px-5 py-4 border-b border-white/8">
              <h3 className="text-white font-semibold text-sm">Precios de referencia</h3>
            </div>
            <div className="divide-y divide-white/8 max-h-96 overflow-y-auto">
              {PRICE_TABLE.map((row) => (
                <div key={row.model} className="flex items-center justify-between px-4 py-2.5 text-xs hover:bg-white/3 transition-colors">
                  <div>
                    <p className="text-white font-medium">{row.model}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      row.condition === "Excelente" ? "bg-emerald-500/20 text-emerald-400" :
                      row.condition === "Bueno" ? "bg-blue-500/20 text-blue-400" :
                      "bg-orange-500/20 text-orange-400"
                    }`}>
                      {row.condition}
                    </span>
                  </div>
                  <p className="text-[#7B2FBE] font-bold ml-2 text-right font-price">
                    ${Math.round(row.min / 1000)}k–${Math.round(row.max / 1000)}k
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
