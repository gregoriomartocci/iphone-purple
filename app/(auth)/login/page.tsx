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

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: redirect })}
            className="mt-7 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-white/12 bg-white/[0.05] text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/[0.09]"
          >
            <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/12" />
            <span className="text-xs text-white/30">o</span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/12" />
          </div>

          {error && (
            <p className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
