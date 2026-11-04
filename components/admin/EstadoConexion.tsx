import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  PauseCircle,
  QrCode,
  ScanLine,
  Unplug,
  WifiOff,
} from "lucide-react";
import type { EventoConexion, SaludServidor } from "@/lib/whatsapp/servidor";

/**
 * Qué está pasando con la conexión a WhatsApp, en una sola mirada.
 *
 * Hasta ahora esto era una caja negra. La pantalla mostraba un QR o un cartel
 * genérico, y todo lo demás —cuántos códigos se ofrecieron, si WhatsApp venía
 * rechazando, hacía cuánto— vivía solo en el log del proceso. Cada tropiezo
 * parecía un misterio nuevo porque no había forma de ver el historial.
 *
 * El estado solo no alcanza: "esperando que escanees" significa cosas muy
 * distintas si el lector recién arrancó o si viene rechazado cinco veces en la
 * última hora. Por eso va acompañado de los últimos eventos.
 */

const PINTA: Record<
  EventoConexion["tipo"],
  { icono: typeof QrCode; color: string; texto: string }
> = {
  qr: { icono: QrCode, color: "text-white/40", texto: "Código nuevo" },
  escaneado: { icono: ScanLine, color: "text-sky-300", texto: "Escaneado" },
  conectado: { icono: CheckCircle2, color: "text-emerald-300", texto: "Conectado" },
  rechazado: { icono: AlertTriangle, color: "text-amber-300", texto: "Rechazado" },
  caida: { icono: WifiOff, color: "text-white/40", texto: "Conexión caída" },
  pausa: { icono: PauseCircle, color: "text-white/40", texto: "En pausa" },
  reanudado: { icono: QrCode, color: "text-white/40", texto: "Reanudado" },
};

function hace(iso: string, ahora: number): string {
  const s = Math.max(0, Math.round((ahora - Date.parse(iso)) / 1000));
  if (s < 60) return `hace ${s} s`;
  if (s < 3600) return `hace ${Math.round(s / 60)} min`;
  if (s < 86400) return `hace ${Math.round(s / 3600)} h`;
  return `hace ${Math.round(s / 86400)} días`;
}

function resumen(salud: SaludServidor): {
  titulo: string;
  detalle: string;
  color: string;
  icono: typeof QrCode;
} {
  if (salud.vinculado) {
    return {
      titulo: "Conectado",
      detalle: salud.numero ? `Línea ${salud.numero}` : "Recibiendo mensajes",
      color: "text-emerald-300",
      icono: CheckCircle2,
    };
  }
  if (salud.lineaIncorrecta) {
    return {
      titulo: "Línea equivocada",
      detalle: "Se desvinculó solo y no sirve ningún mensaje",
      color: "text-amber-300",
      icono: AlertTriangle,
    };
  }
  if (salud.conexion === "desvinculado") {
    return {
      titulo: "Sin vincular",
      detalle: "WhatsApp no aceptó la sesión guardada",
      color: "text-amber-300",
      icono: Unplug,
    };
  }
  if (salud.enPausa) {
    return {
      titulo: "En pausa",
      detalle: "Dejó de ofrecer códigos porque nadie escaneaba",
      color: "text-white/60",
      icono: PauseCircle,
    };
  }
  if (salud.faltaVincular) {
    return {
      titulo: "Esperando que escanees",
      detalle:
        salud.intentosMaximos > 0
          ? `Código ${salud.intentos} de ${salud.intentosMaximos} antes de pausar`
          : "Escaneá el código desde el teléfono",
      color: "text-sky-300",
      icono: ScanLine,
    };
  }
  return {
    titulo: "Conectando",
    detalle: "Hablando con WhatsApp",
    color: "text-white/60",
    icono: Clock,
  };
}

export function EstadoConexion({ salud }: { salud: SaludServidor }) {
  /*
   * La hora sale de la respuesta del lector, no de `Date.now()`.
   *
   * Dos razones. Leer el reloj en el cuerpo de un componente lo vuelve impuro
   * —dos renders del mismo estado darían resultados distintos— y el compilador
   * de React lo marca con razón. Y los eventos vienen sellados con el reloj del
   * lector, así que compararlos contra ese mismo reloj es lo correcto incluso
   * si las dos máquinas no están en hora.
   */
  const ahora = Date.parse(salud.ahora);
  const { titulo, detalle, color, icono: Icono } = resumen(salud);

  const haceUnaHora = ahora - 3_600_000;
  const rechazosRecientes = salud.eventos.filter(
    (e) => e.tipo === "rechazado" && Date.parse(e.cuando) > haceUnaHora
  ).length;

  const ultimos = [...salud.eventos].reverse().slice(0, 8);

  return (
    <section className="vidrio-sutil rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Icono className={`mt-0.5 size-5 shrink-0 ${color}`} />
          <div>
            <p className={`font-medium ${color}`}>{titulo}</p>
            <p className="mt-0.5 text-sm text-white/45">{detalle}</p>
          </div>
        </div>

        <div className="text-right text-xs text-white/35">
          <p>
            {salud.chats} {salud.chats === 1 ? "chat" : "chats"} · {salud.mensajes}{" "}
            {salud.mensajes === 1 ? "mensaje" : "mensajes"}
          </p>
          <p className="mt-0.5">
            {salud.ultimoMensaje
              ? `último ${hace(salud.ultimoMensaje, ahora)}`
              : "sin mensajes todavía"}
          </p>
        </div>
      </div>

      {rechazosRecientes > 0 && (
        <p className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 text-sm text-amber-100">
          WhatsApp rechazó la conexión{" "}
          {rechazosRecientes === 1 ? "una vez" : `${rechazosRecientes} veces`} en la
          última hora.
        </p>
      )}

      {ultimos.length > 0 && (
        <ol className="mt-4 space-y-1.5 border-t border-white/[0.07] pt-4">
          {ultimos.map((e, i) => {
            const pinta = PINTA[e.tipo];
            const EventoIcono = pinta.icono;
            return (
              <li key={i} className="flex items-center gap-2.5 text-xs">
                <EventoIcono className={`size-3.5 shrink-0 ${pinta.color}`} />
                <span className="text-white/60">{pinta.texto}</span>
                {e.detalle && (
                  <span className="min-w-0 truncate text-white/35">{e.detalle}</span>
                )}
                <span className="ml-auto shrink-0 text-white/25">
                  {hace(e.cuando, ahora)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
