"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="text-[120px] font-black text-[#F0F0F0] leading-none select-none">500</p>
      <h1 className="text-2xl font-bold text-[#111] -mt-4">Algo salió mal</h1>
      <p className="text-[#666] text-sm mt-2 mb-8 max-w-xs">
        Ocurrió un error inesperado. Podés intentarlo de nuevo o volver al inicio.
      </p>
      {error.digest && (
        <p className="text-[#999] text-xs mb-6 font-mono">ID: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-[#7B2FBE] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#6D28D9] transition-colors"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="border border-[#E8E8E8] text-[#111] px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#F7F7F7] transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
