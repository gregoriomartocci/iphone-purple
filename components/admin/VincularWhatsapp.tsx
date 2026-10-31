"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, Smartphone } from "lucide-react";
import { pedirQrAction } from "@/app/admin/whatsapp/acciones";

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

export function VincularWhatsapp({ numero }: { numero?: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [codigo, setCodigo] = useState<string | null>(null);
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
      setCodigo(r.data.codigo);
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
            {codigo ? (
              <>
                En el teléfono de{" "}
                <strong className="font-medium text-white/70">
                  {numero ?? "la línea del negocio"}
                </strong>
                : WhatsApp → Ajustes → Dispositivos vinculados → Vincular un dispositivo →{" "}
                <em>Vincular con número de teléfono</em>. Después escribí este código.
              </>
            ) : (
              <>
                En el teléfono: WhatsApp → Ajustes → Dispositivos vinculados → Vincular un
                dispositivo. Después escaneá este código.
              </>
            )}
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
        ) : codigo ? (
          <>
            {/*
              El código es la vía preferida: WhatsApp solo lo acepta en el
              teléfono del número que el lector declaró, así que no hay manera
              de vincular otra cuenta por error. El QR, en cambio, lo escanea
              cualquiera con la cuenta que tenga a mano.
            */}
            <p className="tnum rounded-2xl border border-white/[0.09] bg-white/[0.04] px-7 py-5 text-center font-mono text-3xl font-semibold tracking-[0.3em] text-white">
              {codigo}
            </p>
            <p className="max-w-sm text-center text-xs text-white/35">
              Solo funciona en el teléfono de esa línea. Si el código vence, esperá: esta
              pantalla pide uno nuevo sola.
            </p>
          </>
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
            <p className="flex items-center gap-1.5 text-xs text-white/35">
              <RefreshCw className="size-3" />
              Se renueva solo: el código caduca a los pocos segundos.
            </p>
          </>
        ) : (
          <div className="w-full rounded-xl border border-white/[0.07] p-4 text-center text-sm text-white/45">
            El lector todavía no generó ningún código. Si tarda, reiniciá el servicio.
          </div>
        )}
      </div>
    </div>
  );
}
