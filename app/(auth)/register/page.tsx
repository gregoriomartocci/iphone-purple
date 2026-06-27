"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, User } from "lucide-react";

const registerSchema = z.object({
  full_name: z.string().min(2, "Ingresá tu nombre"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Las contraseñas no coinciden",
  path: ["confirm_password"],
});
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password, full_name: data.full_name }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Error al crear la cuenta");
        return;
      }
      await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      router.push("/");
    } catch {
      setError("Error inesperado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F7F7F7] min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-8 shadow-sm">
          {/* Logo */}
          <div className="mb-6 text-center">
            <Link href="/" className="inline-block">
              <span className="text-xl font-black text-[#111]">iPhone</span>
              <span className="text-xl font-black text-[#7B2FBE]">Purple</span>
            </Link>
          </div>

          <h1 className="text-xl font-bold text-[#111] text-center">Creá tu cuenta</h1>
          <p className="text-[#666] text-sm text-center mt-1 mb-6">Gratis y en menos de un minuto</p>

          {/* Google */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="flex items-center justify-center gap-2.5 w-full border border-[#E8E8E8] rounded-xl py-2.5 text-sm font-medium text-[#111] hover:bg-[#F7F7F7] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Registrarse con Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#F0F0F0]" />
            <span className="text-[#999] text-xs">o con email</span>
            <div className="flex-1 h-px bg-[#F0F0F0]" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-3 py-2 text-sm mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-[#666] text-xs font-medium mb-1 block">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CCC]" />
                <input
                  {...register("full_name")}
                  placeholder="Juan García"
                  className="border border-[#E8E8E8] bg-white rounded-xl h-10 px-3 pl-9 text-sm text-[#111] placeholder:text-[#CCC] focus:border-[#7B2FBE] focus:outline-none w-full"
                />
              </div>
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="text-[#666] text-xs font-medium mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CCC]" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="vos@email.com"
                  className="border border-[#E8E8E8] bg-white rounded-xl h-10 px-3 pl-9 text-sm text-[#111] placeholder:text-[#CCC] focus:border-[#7B2FBE] focus:outline-none w-full"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-[#666] text-xs font-medium mb-1 block">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CCC]" />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  className="border border-[#E8E8E8] bg-white rounded-xl h-10 px-3 pl-9 text-sm text-[#111] placeholder:text-[#CCC] focus:border-[#7B2FBE] focus:outline-none w-full"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-[#666] text-xs font-medium mb-1 block">Repetí la contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CCC]" />
                <input
                  {...register("confirm_password")}
                  type="password"
                  placeholder="••••••••"
                  className="border border-[#E8E8E8] bg-white rounded-xl h-10 px-3 pl-9 text-sm text-[#111] placeholder:text-[#CCC] focus:border-[#7B2FBE] focus:outline-none w-full"
                />
              </div>
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#7B2FBE] text-white w-full rounded-xl py-2.5 font-semibold text-sm hover:bg-[#6D28D9] transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
            </button>
          </form>

          <p className="text-center text-[#666] text-xs mt-5">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-[#7B2FBE] hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
