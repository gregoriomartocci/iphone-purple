"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, Smartphone } from "lucide-react";
import { pedirQrAction, reanudarLectorAction } from "@/app/admin/whatsapp/acciones";

/**
 * Vincular la línea desde el panel, en vez de ir a buscar el QR a una terminal.
 *
 * Se repregunta sola cada pocos segundos por dos razones distintas: el QR de
 * WhatsApp caduca a los veinte segundos y el lector dibuja uno nuevo, y cuando
 * alguien por fin escanea, nada avisa —hay que preguntar para enterarse—.
 *
 * El SVG se mete en un `<img>` como data URI y no con `dangerouslySetInnerHTML`:
 * un SVG inline puede traer scripts y una imagen no los ejecuta. El contenido es
 * nuestro y viene autenticado, pero no hay razón para elegir la versión
 * peligrosa cuando la segura cuesta lo mismo.
 */
const CADA_MS = 9_000;

export function VincularWhatsapp({
  numero,
  enPausa = false,
}: {
  numero?: string;
  enPausa?: boolean;
}) {
  const [svg, setSvg] = useState<string | null>(null);
  const [pidiendo, setPidiendo] = useState(false);
  const [vinculado, setVinculado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    /*
     * `vivo` evita escribir estado sobre un componente desmontado: la petición
     * puede volver después de que alguien cambió de pantalla.
     *
     * Y la primera consulta sale por un timeout de cero y no como llamada
     * directa: invocarla en el cuerpo del efecto dispara renders en cascada, y
     * el compilador de React lo marca con razón.
     */
    let vivo = true;

    async function traer() {
      const r = await pedirQrAction();
      if (!vivo) return;
      setCargando(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setError(null);
      setSvg(r.data.svg);
      setVinculado(r.data.vinculado);
    }

    const primera = setTimeout(traer, 0);
    const repetir = setInterval(traer, CADA_MS);
    return () => {
      vivo = false;
      clearTimeout(primera);
      clearInterval(repetir);
    };
  }, []);

  // Vinculada: la pantalla de al lado ya puede leer mensajes, así que se recarga.
  useEffect(() => {
    if (!vinculado) return;
    const id = setTimeout(() => window.location.reload(), 1200);
    return () => clearTimeout(id);
  }, [vinculado]);

  /*
   * En pausa no se muestra ni código ni QR, a propósito: mostrarlos invitaría
   * a quedarse esperando a que aparezca algo, cuando lo que hay que hacer es
   * avisarle al lector que ahora sí hay alguien mirando.
   */
  if (enPausa) {
    return (
      <div className="vidrio-sutil rounded-2xl p-6">
        <h2 className="font-medium text-white">El lector se puso en pausa</h2>
        <p className="mt-1.5 max-w-xl text-sm text-white/45">
          Dejó de pedir vinculaciones porque nadie escaneaba. No es un error: un lector
          encendido y olvidado pide un código cada veinte segundos, y WhatsApp termina
          frenando la línea por eso.
        </p>
        <p className="mt-2 max-w-xl text-sm text-white/45">
          Tené el teléfono en la mano antes de apretar, así no se vuelve a pausar.
        </p>
        <button
          type="button"
          onClick={async () => {
            setPidiendo(true);
            const r = await reanudarLectorAction();
            setPidiendo(false);
            if (!r.ok) setError(r.error);
            else window.location.reload();
          }}
          disabled={pidiendo}
          className="bg-primary text-primary-foreground hover:bg-primary/85 mt-5 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-[0_10px_30px_-12px_#5e16eb] transition-all active:scale-[0.985] disabled:opacity-60"
        >
          {pidiendo ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Estoy acá, pedí el código
        </button>
        {error && <p className="mt-3 text-sm text-amber-200/80">{error}</p>}
      </div>
    );
  }

  if (vinculado) {
    return (
      <div className="vidrio-sutil flex items-center gap-3 rounded-2xl p-5">
        <CheckCircle2 className="size-5 shrink-0 text-emerald-300" />
        <p className="text-sm text-white">Línea vinculada. Cargando los mensajes…</p>
      </div>
    );
  }

  return (
    <div className="vidrio-sutil rounded-2xl p-6">
      <div className="flex items-start gap-3">
        <Smartphone className="mt-0.5 size-5 shrink-0 text-white/50" />
        <div>
          <h2 className="font-medium text-white">Vinculá la línea</h2>
          <p className="mt-1 text-sm text-white/45">
            En el teléfono de{" "}
            <strong className="font-medium text-white/70">
              {numero ?? "la línea del negocio"}
            </strong>
            : WhatsApp → Ajustes → Dispositivos vinculados → Vincular un dispositivo.
            Después escaneá este código.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        {cargando ? (
          <div className="flex h-[280px] w-[280px] items-center justify-center rounded-2xl border border-white/[0.07]">
            <Loader2 className="size-6 animate-spin text-white/30" />
          </div>
        ) : error ? (
          <div className="w-full rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-4 text-sm text-amber-100">
            {error}
          </div>
        ) : svg ? (
          <>
            {/* Fondo blanco: un QR sobre casi negro no lo lee ninguna cámara. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- es un data URI, no hay nada que optimizar. */}
            <img
              src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
              alt="Código QR para vincular WhatsApp"
              width={280}
              height={280}
              className="rounded-2xl bg-white p-3"
            />
            <p className="flex items-center gap-1.5 text-center text-xs text-white/35">
              <RefreshCw className="size-3 shrink-0" />
              Se renueva solo cada pocos segundos. Escaneá el que esté en pantalla.
            </p>
          </>
        ) : (
          <div className="w-full rounded-xl border border-white/[0.07] p-4 text-center text-sm text-white/45">
            El lector todavía no generó ningún código. Si tarda, prendelo de nuevo.
          </div>
        )}
      </div>
    </div>
  );
}
