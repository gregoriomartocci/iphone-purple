"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Power } from "lucide-react";
import { arrancarLectorAction } from "@/app/admin/whatsapp/acciones";

/**
 * Prender el lector sin abrir una terminal.
 *
 * El proceso que levanta sobrevive al sitio, así que una vez prendido sigue
 * andando aunque el servidor de desarrollo se reinicie. No hay que volver a
 * tocar el botón hasta que se apague la máquina.
 *
 * En producción no aparece: allá el lector vive en su propio servicio y está
 * prendido siempre.
 */
export function PrenderLector() {
  const [prendiendo, setPrendiendo] = useState(false);

  async function prender() {
    setPrendiendo(true);
    const r = await arrancarLectorAction();
    if (!r.ok) {
      setPrendiendo(false);
      toast.error(r.error);
      return;
    }
    toast.success(r.data.yaEstaba ? "Ya estaba andando" : "Lector prendido");
    // Recargar y no cambiar estado acá: la pantalla entera depende de que el
    // lector conteste, y ahora contesta.
    window.location.reload();
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={prender}
        disabled={prendiendo}
        className="bg-primary text-primary-foreground hover:bg-primary/85 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-[0_10px_30px_-12px_#5e16eb] transition-all active:scale-[0.985] disabled:opacity-60 disabled:shadow-none"
      >
        {prendiendo ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Power className="size-4" />
        )}
        {prendiendo ? "Prendiendo…" : "Prender el lector"}
      </button>
      <p className="mt-2 text-xs text-white/35">
        Tarda unos segundos. Queda andando por su cuenta: no hace falta volver a apretarlo
        aunque reinicies el sitio.
      </p>
    </div>
  );
}
