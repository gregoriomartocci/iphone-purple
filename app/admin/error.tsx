"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Copy,
  LayoutDashboard,
  RefreshCw,
  Store,
} from "lucide-react";

/**
 * Error dentro del panel.
 *
 * Vive en este segmento para renderizarse dentro del layout: el menú lateral
 * sigue ahí y un fallo en una pantalla no saca a nadie del panel.
 *
 * Se usa `retry` y no `reset` porque vuelve a pedir los datos al servidor. Con
 * `reset`, un error de un Server Component se repite sin consultar nada nuevo.
 */
export default function ErrorDelPanel({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const pathname = usePathname();
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  // En producción, el mensaje de un error del servidor es genérico y en inglés.
  const mensaje =
    !error.digest || process.env.NODE_ENV === "development" ? error.message : null;

  async function copiar() {
    if (!error.digest) return;
    try {
      await navigator.clipboard.writeText(error.digest);
      setCopiado(true);
    } catch {
      // Sin permiso de portapapeles, el código sigue visible para copiarlo a mano.
    }
  }

  const secundaria =
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.14] bg-white/[0.05] px-5 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/[0.10]";

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div role="alert" className="vidrio entra-vidrio w-full max-w-lg rounded-3xl p-8">
        <span className="flex size-11 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/[0.07]">
          <AlertTriangle className="size-5 text-amber-300" />
        </span>

        <h1 className="mt-5 text-[1.35rem] font-semibold tracking-[-0.01em] text-white">
          Esta pantalla no se pudo cargar
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Puede ser algo pasajero, así que conviene reintentar. Mientras tanto, podés
          seguir usando las otras secciones desde el menú.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => retry()}
            className="bg-primary text-primary-foreground hover:bg-primary/85 inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-[0_10px_30px_-12px_#5e16eb] transition-all active:scale-[0.985]"
          >
            <RefreshCw className="size-4" />
            Reintentar
          </button>

          {pathname === "/admin" ? (
            <Link href="/" className={secundaria}>
              <Store className="size-4" />
              Ver la tienda
            </Link>
          ) : (
            <Link href="/admin" className={secundaria}>
              <LayoutDashboard className="size-4" />
              Ir al resumen
            </Link>
          )}
        </div>

        {(mensaje || error.digest) && (
          <details className="group mt-6 border-t border-white/[0.07] pt-4 text-xs">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 text-white/45 transition-colors hover:text-white">
              <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
              Detalle técnico
            </summary>
            {mensaje && (
              <p className="mt-3 font-mono leading-relaxed break-words text-white/55">
                {mensaje}
              </p>
            )}
            {error.digest && (
              <div className="mt-3 flex items-center gap-3">
                <span className="font-mono text-white/55">Código: {error.digest}</span>
                <button
                  type="button"
                  onClick={copiar}
                  className="inline-flex items-center gap-1 text-white/45 transition-colors hover:text-white"
                >
                  {copiado ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {copiado ? "Copiado" : "Copiar"}
                </button>
              </div>
            )}
          </details>
        )}
      </div>
    </div>
  );
}
