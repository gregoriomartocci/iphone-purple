"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

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
    "h-12 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-purple";

  return (
    <div className="bg-surface flex min-h-dvh items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center text-lg font-semibold tracking-tight">
          iPhone <span className="text-purple">Purple</span>
        </Link>

        <div className="border-line mt-6 rounded-2xl border bg-white p-8">
          <h1 className="text-xl font-semibold">Panel de administración</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Ingresá con tu cuenta para gestionar el stock.
          </p>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: redirect })}
            className="border-line text-ink hover:border-ink mt-6 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border text-sm font-medium transition-colors"
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

          <div className="my-5 flex items-center gap-3">
            <span className="bg-line h-px flex-1" />
            <span className="text-muted-foreground text-xs">o</span>
            <span className="bg-line h-px flex-1" />
          </div>

          {error && (
            <p className="bg-destructive/10 text-destructive mb-3 rounded-xl px-3 py-2.5 text-sm">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-ink mb-1.5 block text-sm">
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
                <p className="text-destructive mt-1.5 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-ink mb-1.5 block text-sm">
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
                <p className="text-destructive mt-1.5 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-ink hover:bg-ink/85 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-white transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        </div>

        <Link
          href="/"
          className="text-muted-foreground hover:text-ink mt-6 block text-center text-sm transition-colors"
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
