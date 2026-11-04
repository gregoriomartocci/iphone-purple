"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

export function CopiarTexto({ texto }: { texto: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          toast.success("Texto copiado.");
        } catch {
          toast.error("No se pudo copiar.");
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] px-2.5 py-1.5 text-xs text-white/70 transition-colors hover:border-white/25 hover:text-white"
    >
      <Copy className="size-3.5" />
      Copiar texto
    </button>
  );
}
