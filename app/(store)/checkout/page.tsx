"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/cart";
import { formatARS } from "@/utils/format";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  MapPin,
  CreditCard,
  CheckCircle,
  ChevronRight,
  Lock,
  Smartphone,
} from "lucide-react";
import Image from "next/image";

const STEPS = [
  { id: 1, label: "Identificación", icon: <User className="w-3.5 h-3.5" /> },
  { id: 2, label: "Envío", icon: <MapPin className="w-3.5 h-3.5" /> },
  { id: 3, label: "Pago", icon: <CreditCard className="w-3.5 h-3.5" /> },
];

const shippingSchema = z.object({
  full_name: z.string().min(2, "Ingresá tu nombre completo"),
  phone: z.string().min(8, "Ingresá un teléfono válido"),
  email: z.string().email("Email inválido"),
  street: z.string().min(3, "Ingresá la calle"),
  number: z.string().min(1, "Ingresá el número"),
  floor: z.string().optional(),
  city: z.string().min(2, "Ingresá la ciudad"),
  province: z.string().min(2, "Seleccioná la provincia"),
  zip: z.string().min(4, "Ingresá el código postal"),
});

type ShippingForm = z.infer<typeof shippingSchema>;

const inputCls = "border border-[#E8E8E8] bg-white rounded-xl h-10 px-3 text-sm text-[#111] placeholder:text-[#CCC] focus:border-[#7B2FBE] focus:outline-none w-full";
const labelCls = "text-[#666] text-xs font-medium mb-1 block";

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const { items, total } = useCartStore();
  const [guestMode, setGuestMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingForm>({ resolver: zodResolver(shippingSchema) });

  const onShippingSubmit = (_data: ShippingForm) => {
    setStep(3);
  };

  const SHIPPING_COST = total() >= 200000 ? 0 : 8500;
  const DISCOUNT = 0;
  const ORDER_TOTAL = total() + SHIPPING_COST - DISCOUNT;

  return (
    <div className="bg-[#F7F7F7] min-h-screen pt-14">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                    step === s.id
                      ? "bg-[#7B2FBE] text-white"
                      : step > s.id
                      ? "bg-[#111] text-white"
                      : "bg-white border border-[#E8E8E8] text-[#999]"
                  }`}
                >
                  {step > s.id ? <CheckCircle className="w-3.5 h-3.5" /> : s.id}
                </div>
                <span className={`text-xs ml-1 ${step === s.id ? "font-medium text-[#111]" : "text-[#666]"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px bg-[#E8E8E8] mx-3" />
              )}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-[1fr_360px] gap-8">
          {/* Main */}
          <div>
            <AnimatePresence mode="wait">
              {/* Step 1: Identification */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-[#E8E8E8] rounded-2xl p-6"
                >
                  <h2 className="text-[#111] font-bold text-lg mb-5 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#7B2FBE]" />
                    Identificación
                  </h2>
                  <div className="space-y-3">
                    <button className="flex items-center justify-center gap-2.5 w-full border border-[#E8E8E8] rounded-xl py-2.5 text-sm font-medium text-[#111] hover:bg-[#F7F7F7] transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continuar con Google
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-[#F0F0F0]" />
                      <span className="text-[#999] text-xs">o</span>
                      <div className="flex-1 h-px bg-[#F0F0F0]" />
                    </div>
                    <button
                      className="w-full border border-[#E8E8E8] bg-white text-[#111] hover:bg-[#F7F7F7] py-2.5 rounded-xl text-sm font-semibold transition-colors"
                      onClick={() => { setGuestMode(true); setStep(2); }}
                    >
                      Continuar como invitado
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Shipping */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-[#E8E8E8] rounded-2xl p-6"
                >
                  <h2 className="text-[#111] font-bold text-lg mb-5 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#7B2FBE]" />
                    Datos de envío
                  </h2>
                  <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Nombre completo *</label>
                        <input {...register("full_name")} placeholder="Juan García" className={inputCls} />
                        {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                      </div>
                      <div>
                        <label className={labelCls}>Teléfono *</label>
                        <input {...register("phone")} placeholder="+54 9 11 1234-5678" className={inputCls} />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Email *</label>
                      <input {...register("email")} type="email" placeholder="juan@email.com" className={inputCls} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className={labelCls}>Calle *</label>
                        <input {...register("street")} placeholder="Av. Corrientes" className={inputCls} />
                        {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                      </div>
                      <div>
                        <label className={labelCls}>Número *</label>
                        <input {...register("number")} placeholder="1234" className={inputCls} />
                        {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Piso / Dpto (opcional)</label>
                      <input {...register("floor")} placeholder="3° A" className={inputCls} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={labelCls}>Ciudad *</label>
                        <input {...register("city")} placeholder="CABA" className={inputCls} />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                      </div>
                      <div>
                        <label className={labelCls}>Provincia *</label>
                        <input {...register("province")} placeholder="Buenos Aires" className={inputCls} />
                        {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province.message}</p>}
                      </div>
                      <div>
                        <label className={labelCls}>Código postal *</label>
                        <input {...register("zip")} placeholder="1406" className={inputCls} />
                        {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip.message}</p>}
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-[#7B2FBE] text-white w-full py-3.5 rounded-xl font-semibold hover:bg-[#6D28D9] transition-colors mt-2 flex items-center justify-center gap-2"
                    >
                      Continuar al pago
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                    <h2 className="text-[#111] font-bold text-lg mb-5 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#7B2FBE]" />
                      Método de pago
                    </h2>
                    <div className="space-y-3">
                      {[
                        { id: "mp", label: "Mercado Pago", desc: "Tarjeta débito/crédito, MP, cuotas sin interés", badge: "Recomendado" },
                        { id: "stripe", label: "Tarjeta internacional", desc: "Visa, Mastercard, AMEX en USD" },
                      ].map((method) => (
                        <label key={method.id} className="flex items-center gap-3 bg-white border border-[#E8E8E8] rounded-xl p-4 cursor-pointer hover:border-[#7B2FBE] transition-colors">
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            defaultChecked={method.id === "mp"}
                            className="accent-[#7B2FBE] w-4 h-4"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[#111] font-semibold text-sm">{method.label}</span>
                              {method.badge && (
                                <span className="text-[10px] bg-[#7B2FBE] text-white px-2 py-0.5 rounded-full font-bold">
                                  {method.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[#666] text-xs mt-0.5">{method.desc}</p>
                          </div>
                          <Smartphone className="w-5 h-5 text-[#999]" />
                        </label>
                      ))}
                    </div>

                    {/* MP Brick placeholder */}
                    <div className="mt-4 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl p-4 text-center">
                      <p className="text-[#666] text-sm">
                        El formulario de pago de Mercado Pago se cargará aquí.
                        <br />
                        <span className="text-[#999]">
                          Requiere integración con las credenciales de MP.
                        </span>
                      </p>
                    </div>

                    <button className="bg-[#7B2FBE] text-white w-full py-3.5 rounded-xl font-semibold hover:bg-[#6D28D9] transition-colors mt-4 flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      Confirmar compra segura
                    </button>
                    <p className="text-[#999] text-xs text-center mt-2 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" />
                      Pago 100% seguro — tus datos están protegidos
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary sidebar */}
          <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 h-fit sticky top-20">
            <h3 className="text-base font-bold text-[#111] mb-4">Resumen del pedido</h3>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-[#F5F5F5] flex-shrink-0 relative overflow-hidden">
                    {item.productImage && (
                      <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="48px" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#111] text-xs font-medium truncate">{item.productName}</p>
                    <p className="text-[#666] text-xs">{item.variantName} × {item.quantity}</p>
                  </div>
                  <span className="text-[#111] text-sm font-medium flex-shrink-0">
                    {formatARS(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E8E8E8] pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-[#666]">
                <span>Subtotal</span>
                <span>{formatARS(total())}</span>
              </div>
              <div className="flex justify-between text-[#666]">
                <span>Envío</span>
                <span className={SHIPPING_COST === 0 ? "text-green-600 font-medium" : ""}>
                  {SHIPPING_COST === 0 ? "Gratis" : formatARS(SHIPPING_COST)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#111] pt-2 border-t border-[#E8E8E8]">
                <span>Total</span>
                <span>{formatARS(ORDER_TOTAL)}</span>
              </div>
            </div>
            {total() < 200000 && (
              <p className="text-[#999] text-xs mt-3 text-center">
                Agregá {formatARS(200000 - total())} más para envío gratis
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
