"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateLeadStatusAction } from "@/app/admin/actions";
import { WhatsAppLink } from "@/components/site/WhatsAppLink";
import { formatUSD } from "@/utils/format";
import { GRADE_LABELS, type TradeInLead } from "@/types";
import { cn } from "@/lib/utils";

const STATUSES = [
  { value: "pending", label: "Pendiente" },
  { value: "contacted", label: "Contactado" },
  { value: "closed", label: "Cerrado" },
] as const;

type Status = (typeof STATUSES)[number]["value"];

export function LeadsList({
  leads,
  supabaseReady,
}: {
  leads: TradeInLead[];
  supabaseReady: boolean;
}) {
  // Estado local para que el chip cambie al toque; la acción confirma después.
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [, startTransition] = useTransition();

  function setStatus(lead: TradeInLead, status: Status) {
    if (!supabaseReady) {
      toast.error("Conectá Supabase para poder actualizar el estado.");
      return;
    }
    const previous = statuses[lead.id] ?? lead.status;
    setStatuses((s) => ({ ...s, [lead.id]: status }));

    startTransition(async () => {
      const result = await updateLeadStatusAction(lead.id, status);
      if (!result.ok) {
        setStatuses((s) => ({ ...s, [lead.id]: previous }));
        toast.error(result.error);
      }
    });
  }

  if (leads.length === 0) {
    return (
      <div className="border-line rounded-xl border border-dashed py-16 text-center">
        <p className="text-foreground font-medium">
          Todavía no hay consultas de Plan Canje
        </p>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Cuando alguien cotice su equipo en la web, la consulta aparece acá.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {leads.map((lead) => {
        const status = statuses[lead.id] ?? lead.status;
        return (
          <li key={lead.id} className="border-line rounded-xl border p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-foreground font-medium">
                  {lead.brand} {lead.model} {lead.storage}
                </p>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {GRADE_LABELS[lead.grade]} · estimado{" "}
                  <span className="tnum">{formatUSD(lead.estimatedValue)}</span>
                </p>
                <p className="text-foreground mt-2 text-sm">
                  {lead.contactName} — {lead.contactPhone}
                </p>
                {lead.notes && (
                  <p className="text-muted-foreground mt-1 text-sm">{lead.notes}</p>
                )}
                <p className="text-muted-foreground mt-2 text-xs">
                  {new Date(lead.createdAt).toLocaleString("es-AR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-3">
                <div className="bg-surface flex gap-1 rounded-full p-1">
                  {STATUSES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setStatus(lead, s.value)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs transition-colors",
                        status === s.value
                          ? "bg-ink font-medium text-white"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <WhatsAppLink
                  number={lead.contactPhone}
                  message={`¡Hola ${lead.contactName}! Te escribo de iPhone Purple por la cotización de tu ${lead.model}.`}
                  variant="outline"
                  className="h-9 px-4 text-xs"
                >
                  Escribirle
                </WhatsAppLink>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
