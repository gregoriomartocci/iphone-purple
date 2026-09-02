"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="shell flex min-h-[70svh] flex-col items-center justify-center py-20 text-center">
      <p className="text-muted-foreground text-sm">Algo falló</p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Se nos rompió algo</h1>
      <p className="text-muted-foreground mt-3 max-w-sm leading-relaxed">
        No pudimos cargar esta página. Probá de nuevo; si sigue pasando, escribinos y lo
        vemos.
      </p>
      {error.digest && (
        <p className="text-muted-foreground mt-4 font-mono text-xs">ID: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="bg-ink hover:bg-ink/85 inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-medium text-white transition-colors"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="border-line text-foreground hover:border-foreground/35 inline-flex h-12 items-center justify-center rounded-full border px-7 text-sm font-medium transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
