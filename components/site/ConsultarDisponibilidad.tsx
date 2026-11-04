"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { WhatsAppLink } from "./WhatsAppLink";
import { Calendario } from "./Calendario";
import { fechaLarga } from "@/lib/turnos";
import { cn } from "@/lib/utils";

/**
 * En la web no se compra ni se paga: se consulta. El stock sale de las listas
 * de los proveedores y hay que confirmarlo antes de vender, así que todo
 * termina en una conversación de WhatsApp, donde se acuerda el pago.
 *
 * El turno tampoco se reserva acá: se pide. Sin una persona que lo confirme,
 * dos clientes podrían elegir el mismo horario para el último equipo.
 */
export function ConsultarDisponibilidad({
  whatsappNumber,
  equipo,
  hayStock,
}: {
  whatsappNumber: string;
  /** "iPhone 16 128GB · Sellado · Negro" */
  equipo: string;
  hayStock: boolean;
}) {
  const [agendando, setAgendando] = useState(false);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  if (!hayStock) {
    return (
      <WhatsAppLink
        number={whatsappNumber}
        message={`¡Hola! Me interesa el ${equipo}. ¿Me avisan cuando entre?`}
        className="w-full"
      >
        Avisame cuando entre
      </WhatsAppLink>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <WhatsAppLink
        number={whatsappNumber}
        message={`¡Hola! Quería consultar disponibilidad del ${equipo} que vi en la web.`}
        className="w-full"
      >
        Consultar disponibilidad
      </WhatsAppLink>

      <button
        type="button"
        onClick={() => setAgendando((a) => !a)}
        aria-expanded={agendando}
        className="border-line text-foreground hover:border-foreground/35 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium transition-colors"
      >
        <CalendarDays className="size-4" />
        Agendar retiro en el local
      </button>

      {agendando && (
        <div className="border-line mt-2 rounded-2xl border p-4">
          <Calendario
            fecha={fecha}
            hora={hora}
            onFecha={(f) => {
              setFecha(f);
              setHora("");
            }}
            onHora={setHora}
          />
          <WhatsAppLink
            number={whatsappNumber}
            message={`¡Hola! Quiero pasar a retirar el ${equipo} el ${fechaLarga(fecha)} a las ${hora}. ¿Me confirman disponibilidad?`}
            className={cn(
              "mt-5 w-full",
              !(fecha && hora) && "pointer-events-none opacity-40"
            )}
          >
            {fecha && hora
              ? `Pedir turno: ${fechaLarga(fecha)}, ${hora}`
              : "Elegí día y horario"}
          </WhatsAppLink>
          <p className="text-muted-foreground mt-2 text-center text-xs">
            Te confirmamos por WhatsApp. El pago se coordina ahí, no en la web.
          </p>
        </div>
      )}
    </div>
  );
}
