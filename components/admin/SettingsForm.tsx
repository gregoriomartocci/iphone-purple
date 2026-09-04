"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { saveSettingsAction } from "@/app/admin/actions";
import type { StoreSettings } from "@/types";

const FIELDS: {
  key: keyof StoreSettings;
  label: string;
  hint?: string;
  type?: "text" | "number";
}[] = [
  {
    key: "dollarRate",
    label: "Cotización del dólar (ARS)",
    hint: "Se usa para pasar costos y precios de USD a pesos en todo el sitio.",
    type: "number",
  },
  {
    key: "defaultMarginPct",
    label: "Margen por defecto (%)",
    hint: "El que se propone al importar una lista sin proveedor asignado.",
    type: "number",
  },
  {
    key: "whatsappNumber",
    label: "WhatsApp (solo números)",
    hint: "Con código de país y sin signos: 5491123456789.",
  },
  { key: "whatsappDisplay", label: "WhatsApp como se muestra" },
  { key: "email", label: "Email de contacto" },
  { key: "address", label: "Dirección del local" },
  { key: "hours", label: "Horarios de atención" },
  { key: "mapsUrl", label: "Link a Google Maps" },
  { key: "instagram", label: "Instagram (URL)" },
  { key: "tiktok", label: "TikTok (URL)" },
];

/**
 * Ajustes de la tienda.
 *
 * Todo lo que cambia sin tocar código: cotización, márgenes, contacto y redes.
 * Se leen desde el sitio público, así que guardar acá revalida todas las páginas.
 */
export function SettingsForm({
  settings,
  supabaseReady,
}: {
  settings: StoreSettings;
  supabaseReady: boolean;
}) {
  const [values, setValues] = useState<StoreSettings>(settings);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveSettingsAction({
        ...values,
        dollarRate: Number(values.dollarRate),
        defaultMarginPct: Number(values.defaultMarginPct),
      });

      if (result.ok) toast.success("Ajustes guardados.");
      else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={submit} className="max-w-2xl">
      <div className="border-line space-y-5 rounded-xl border p-6">
        {FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className="text-foreground mb-1.5 block text-sm">{field.label}</span>
            <input
              type={field.type ?? "text"}
              value={String(values[field.key] ?? "")}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  [field.key]:
                    field.type === "number" ? Number(e.target.value) : e.target.value,
                }))
              }
              className="border-line text-foreground focus-visible:border-ink bg-surface h-10 w-full rounded-lg border px-3 text-sm transition-colors outline-none"
            />
            {field.hint && (
              <span className="text-muted-foreground mt-1 block text-xs">
                {field.hint}
              </span>
            )}
          </label>
        ))}
      </div>

      {!supabaseReady && (
        <p className="mt-4 text-sm text-amber-700">
          Conectá Supabase para poder guardar los ajustes. Mientras tanto, el sitio usa
          los valores de <code className="bg-surface rounded px-1">lib/data/seed.ts</code>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !supabaseReady}
        className="bg-ink hover:bg-ink/85 mt-6 inline-flex h-10 items-center gap-2 rounded-full px-6 text-sm font-medium text-white transition-colors disabled:opacity-50"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Guardar ajustes
      </button>
    </form>
  );
}
