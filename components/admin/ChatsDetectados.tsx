"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Loader2, UserPlus } from "lucide-react";
import { saveSupplierAction } from "@/app/admin/actions";
import type { AutorDetectado } from "@/lib/whatsapp/sincronizar";

/** El mismo que usa el alta manual de proveedores, para no tener dos verdades. */
const MARGEN_POR_DEFECTO = 18;

function cuando(iso: string | null): string {
  if (!iso) return "—";
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  return `hace ${dias} días`;
}

export function ChatsDetectados({
  autores,
  supabaseReady,
}: {
  autores: AutorDetectado[];
  supabaseReady: boolean;
}) {
  const [abierto, setAbierto] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [margen, setMargen] = useState(MARGEN_POR_DEFECTO);
  const [pendiente, startTransition] = useTransition();

  function abrir(autor: AutorDetectado) {
    setAbierto(autor.comparable);
    // El nombre que WhatsApp muestra es casi siempre el que el dueño usa para
    // referirse al proveedor; si no vino, queda el nombre del chat.
    setNombre(autor.nombre ?? autor.chats[0] ?? "");
    setMargen(MARGEN_POR_DEFECTO);
  }

  function guardar(autor: AutorDetectado) {
    startTransition(async () => {
      const r = await saveSupplierAction({
        id: null,
        name: nombre.trim(),
        phone: autor.telefono,
        defaultMarginPct: margen,
      });

      if (r.ok) {
        toast.success(`${nombre.trim()} quedó cargado como proveedor.`);
        setAbierto(null);
      } else {
        toast.error(r.error);
      }
    });
  }

  const campo =
    "h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ink";

  if (autores.length === 0) {
    return (
      <p className="border-line text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
        El lector está conectado pero todavía no juntó mensajes. Esperá a que entre la
        próxima lista.
      </p>
    );
  }

  return (
    <ul className="border-line divide-line divide-y rounded-xl border">
      {autores.map((autor) => {
        // Un proveedor desactivado ya existe: ofrecer cargarlo otra vez
        // duplicaría el teléfono. Se reactiva desde Proveedores.
        const pendienteDeCargar =
          autor.listas > 0 && !autor.proveedor && !autor.proveedorInactivo;

        return (
          <li key={autor.comparable} className="p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium">
                  {autor.nombre ?? autor.telefono}
                  {autor.proveedor && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-normal text-emerald-700">
                      <Check className="size-3" />
                      {autor.proveedor.name}
                    </span>
                  )}
                  {!autor.proveedor && autor.proveedorInactivo && (
                    <span className="text-muted-foreground bg-surface rounded-full px-2 py-0.5 text-xs font-normal">
                      cargado pero desactivado
                    </span>
                  )}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {autor.telefono} · {autor.chats.join(" · ")}
                </p>
              </div>

              <div className="text-muted-foreground shrink-0 text-right text-xs">
                <p>
                  <span className="text-foreground font-medium">{autor.listas}</span>{" "}
                  {autor.listas === 1 ? "lista" : "listas"} de {autor.mensajes}{" "}
                  {autor.mensajes === 1 ? "mensaje" : "mensajes"}
                </p>
                <p className="mt-0.5">última: {cuando(autor.ultimaLista)}</p>
              </div>
            </div>

            {pendienteDeCargar && abierto !== autor.comparable && (
              <button
                type="button"
                onClick={() => abrir(autor)}
                disabled={!supabaseReady}
                className="border-line hover:bg-surface mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-50"
              >
                <UserPlus className="size-4" />
                Cargar como proveedor
              </button>
            )}

            {abierto === autor.comparable && (
              <div className="border-line bg-surface mt-3 rounded-lg border p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
                  <label className="block">
                    <span className="text-muted-foreground mb-1.5 block text-xs">
                      Nombre del proveedor
                    </span>
                    <input
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className={campo}
                      autoFocus
                    />
                  </label>
                  <label className="block">
                    <span className="text-muted-foreground mb-1.5 block text-xs">
                      Margen %
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={margen}
                      onChange={(e) => setMargen(Number(e.target.value))}
                      className={campo}
                    />
                  </label>
                </div>

                <p className="text-muted-foreground mt-3 text-xs">
                  El teléfono queda en {autor.telefono}. Es el dato con el que se
                  reconocen sus listas: si lo cambiás, dejan de emparejar.
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => guardar(autor)}
                    disabled={pendiente || nombre.trim().length === 0}
                    className="bg-ink inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {pendiente && <Loader2 className="size-4 animate-spin" />}
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setAbierto(null)}
                    className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
