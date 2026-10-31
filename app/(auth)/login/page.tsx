"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/site/Logo";

const loginSchema = z.object({
  email: z.email("Ese email no parece válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

/**
 * Acceso al panel. No hay cuentas de cliente: el sitio público es anónimo, así
 * que este login es solo para quien administra la tienda.
 */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/admin";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) setError("Email o contraseña incorrectos");
    else router.push(redirect);
  }

  const fieldClass =
    "h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[15px] text-white outline-none transition-all placeholder:text-white/30 " +
    "focus-visible:border-[#8b5cf6]/70 focus-visible:bg-white/[0.07] focus-visible:ring-4 focus-visible:ring-[#5e16eb]/25";

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#07070a] px-5 py-10">
      {/*
        El fondo, en cuatro capas.

        La foto es del stock real y va casi apagada: a plena luz le compite al
        formulario, y lo que tiene que aportar es textura para que el vidrio
        tenga algo que difuminar. Sin nada detrás, un `backdrop-filter` no se
        distingue de un fondo gris.
      */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/*
          El equipo va inclinado y saliéndose por la derecha, no centrado.

          Centrado se transparentaba la manzana justo detrás del formulario: el
          vidrio deja pasar la silueta y quedaba el logo de otra marca atrás del
          de la nuestra. Corrido a un costado aporta la textura que el
          `backdrop-filter` necesita sin competir con lo que hay que leer.
        */}
        <div className="absolute top-1/2 -right-[8%] hidden h-[150vh] w-[62vw] -translate-y-1/2 rotate-[14deg] lg:block">
          <Image
            // Imagen propia de esta pantalla, no del catálogo: es la misma
            // foto de fondo negro que se descartó como producto —acá no
            // corresponde ningún fondo negro— pero funciona distinto como
            // textura decorativa detrás de un vidrio, donde nadie la lee
            // como la ficha de un equipo.
            src="/panel-fondo.jpg"
            alt=""
            fill
            priority
            sizes="60vw"
            className="object-contain opacity-[0.5]"
          />
        </div>

        <div
          className="aurora aurora-1 -top-[18%] left-[-12%] h-[70vh] w-[70vh]"
          style={{ background: "radial-gradient(circle, #5e16eb 0%, transparent 66%)" }}
        />
        <div
          className="aurora aurora-2 right-[-6%] bottom-[-24%] h-[64vh] w-[64vh] opacity-70"
          style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 68%)" }}
        />

        {/* Viñeta: apaga los bordes y empuja la mirada al centro. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_18%,#07070a_88%)]" />
        {/* Y una banda vertical detrás de la tarjeta, para que ninguna forma del
            fondo se lea a través del vidrio. */}
        <div className="absolute inset-y-0 left-1/2 w-[46rem] max-w-[92vw] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(7,7,10,0.82)_22%,rgba(7,7,10,0.82)_78%,transparent)]" />
        <div className="grano absolute inset-0 opacity-[0.18] mix-blend-overlay" />
      </div>

      <div className="entra-vidrio relative w-full max-w-[26rem]">
        <Link
          href="/"
          className="flex justify-center transition-opacity hover:opacity-80"
          aria-label="iPhone Purple — inicio"
        >
          {/* En blanco, que es la versión que corresponde sobre fondo oscuro:
              antes se servía la misma sobre blanco y el texto desaparecía. */}
          <Logo className="h-9" />
        </Link>

        <div className="vidrio mt-7 rounded-3xl p-8">
          <h1 className="text-[1.35rem] font-semibold tracking-[-0.01em] text-white">
            Panel de administración
          </h1>
          <p className="mt-1.5 text-sm text-white/45">
            Ingresá con tu cuenta para gestionar el stock.
          </p>

          {error && (
            <p className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm text-white/70">
                Email
              </label>
              <input
                id="email"
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="vos@email.com"
                className={fieldClass}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-300">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm text-white/70">
                Contraseña
              </label>
              <input
                id="password"
                {...register("password")}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={fieldClass}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-300">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#5e16eb] text-sm font-semibold text-white shadow-[0_10px_34px_-10px_#5e16eb] transition-all hover:bg-[#6d28f0] hover:shadow-[0_14px_44px_-10px_#5e16eb] active:scale-[0.985] disabled:opacity-60 disabled:shadow-none"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        </div>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-white/35 transition-colors hover:text-white/70"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
