"use client";

import { useState } from "react";
import { WhatsAppLink } from "./WhatsAppLink";
import { cn } from "@/lib/utils";

const TOPICS = [
  "Comprar un equipo",
  "Plan Canje",
  "Una reparación",
  "Estado de mi pedido",
  "Otra cosa",
];

/**
 * Formulario de contacto.
 *
 * No manda mails ni guarda nada: arma el mensaje y abre WhatsApp, que es por donde
 * realmente se responde. Un formulario que promete respuesta por mail y nadie lee
 * es peor que no tenerlo.
 */
export function ContactForm({ whatsappNumber }: { whatsappNumber: string }) {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");

  const message = [
    `¡Hola! Soy ${name.trim() || "un cliente"}.`,
    `Quería consultar por: ${topic.toLowerCase()}.`,
    detail.trim() && `\n${detail.trim()}`,
  ]
    .filter(Boolean)
    .join(" ");

  const fieldClass =
    "w-full rounded-xl border border-line bg-surface px-4 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ink";

  return (
    <div className="border-line rounded-2xl border p-6 sm:p-8">
      <h2 className="text-lg font-semibold">Escribinos</h2>
      <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
        Completá esto y se abre WhatsApp con el mensaje listo. Respondemos dentro del
        horario de atención.
      </p>

      <div className="mt-6 space-y-3">
        <div>
          <label htmlFor="contact-name" className="text-foreground mb-1.5 block text-sm">
            Tu nombre
          </label>
          <input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Cómo te llamás"
            className={cn(fieldClass, "h-12")}
          />
        </div>

        <div>
          <label htmlFor="contact-topic" className="text-foreground mb-1.5 block text-sm">
            ¿Sobre qué querés consultar?
          </label>
          <select
            id="contact-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={cn(fieldClass, "h-12")}
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="contact-detail"
            className="text-foreground mb-1.5 block text-sm"
          >
            Contanos un poco más <span className="text-muted-foreground">(opcional)</span>
          </label>
          <textarea
            id="contact-detail"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={4}
            placeholder="Qué modelo buscás, qué le pasa a tu equipo, etc."
            className={cn(fieldClass, "resize-y py-3 leading-relaxed")}
          />
        </div>

        <WhatsAppLink number={whatsappNumber} message={message} className="mt-2 w-full">
          Abrir WhatsApp con este mensaje
        </WhatsAppLink>
      </div>
    </div>
  );
}
