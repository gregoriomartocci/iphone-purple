"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, Plus } from "lucide-react";
import { saveSupplierAction } from "@/app/admin/actions";
import { WhatsAppLink } from "@/components/site/WhatsAppLink";
import type { Supplier } from "@/types";

const EMPTY = { id: null as string | null, name: "", phone: "", defaultMarginPct: 18 };

export function SuppliersManager({
  suppliers,
  supabaseReady,
}: {
  suppliers: Supplier[];
  supabaseReady: boolean;
}) {
  const [draft, setDraft] = useState<typeof EMPTY | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;

    startTransition(async () => {
      const result = await saveSupplierAction({
        id: draft.id,
        name: draft.name.trim(),
        phone: draft.phone.trim() || null,
        defaultMarginPct: draft.defaultMarginPct,
      });

      if (result.ok) {
        toast.success(draft.id ? "Proveedor actualizado." : "Proveedor agregado.");
        setDraft(null);
      } else {
        toast.error(result.error);
      }
    });
  }

  const fieldClass =
    "h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-purple";

  return (
    <div>
      {draft ? (
        <form onSubmit={submit} className="border-line rounded-xl border p-5">
          <h2 className="font-medium">
            {draft.id ? "Editar proveedor" : "Nuevo proveedor"}
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-muted-foreground mb-1.5 block text-xs">Nombre</span>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="text-muted-foreground mb-1.5 block text-xs">
                WhatsApp <span className="text-muted-foreground">(opcional)</span>
              </span>
              <input
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                placeholder="+54 9 11 …"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="text-muted-foreground mb-1.5 block text-xs">
                Margen por defecto (%)
              </span>
              <input
                type="number"
                min={0}
                max={300}
                value={draft.defaultMarginPct}
                onChange={(e) =>
                  setDraft({ ...draft, defaultMarginPct: Number(e.target.value) })
                }
                className={fieldClass}
              />
            </label>
          </div>

          {!supabaseReady && (
            <p className="mt-4 text-sm text-amber-700">
              Conectá Supabase para poder guardar proveedores.
            </p>
          )}

          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              disabled={pending || !supabaseReady}
              className="bg-ink hover:bg-ink/85 inline-flex h-10 items-center gap-2 rounded-full px-6 text-sm font-medium text-white transition-colors disabled:opacity-50"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="border-line text-foreground hover:border-foreground/35 inline-flex h-10 items-center rounded-full border px-5 text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setDraft({ ...EMPTY })}
          className="bg-ink hover:bg-ink/85 inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium text-white transition-colors"
        >
          <Plus className="size-4" />
          Agregar proveedor
        </button>
      )}

      <ul className="mt-8 space-y-3">
        {suppliers.map((supplier) => (
          <li
            key={supplier.id}
            className="border-line flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5"
          >
            <div className="min-w-0">
              <p className="text-foreground font-medium">{supplier.name}</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Margen por defecto {supplier.defaultMarginPct}%
                {supplier.phone && ` · ${supplier.phone}`}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {supplier.phone && (
                <WhatsAppLink
                  number={supplier.phone}
                  message="¡Hola! ¿Me pasás la lista de hoy?"
                  variant="outline"
                  className="h-9 px-4 text-xs"
                >
                  Pedir lista
                </WhatsAppLink>
              )}
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    id: supplier.id,
                    name: supplier.name,
                    phone: supplier.phone ?? "",
                    defaultMarginPct: supplier.defaultMarginPct,
                  })
                }
                aria-label={`Editar ${supplier.name}`}
                className="text-muted-foreground hover:bg-surface hover:text-foreground rounded-lg p-2 transition-colors"
              >
                <Pencil className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
