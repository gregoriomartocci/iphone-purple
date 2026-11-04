"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { BadgeInfo, Check, ChevronDown, Loader2, Sparkles, UserPlus } from "lucide-react";
import { saveSupplierAction } from "@/app/admin/actions";
import { perfilDeContactoAction } from "@/app/admin/whatsapp/acciones";
import type { PerfilContacto } from "@/lib/whatsapp/servidor";
import type { AutorDetectado } from "@/lib/whatsapp/sincronizar";

/** El mismo que usa el alta manual de proveedores, para no tener dos verdades. */
const MARGEN_POR_DEFECTO = 18;

/**
 * Un identificador de WhatsApp no es un teléfono, y mostrarlo como si lo fuera
 * confunde.
 *
 * Desde que WhatsApp dejó de exponer el número real de los participantes de un
 * grupo, lo que llega es un identificador interno de quince dígitos. Sirve
 * igual para emparejar —es estable— pero decirle "teléfono" hace que alguien
 * lo compare con la agenda y no lo encuentre.
 */
function esTelefonoDeVerdad(valor: string): boolean {
  const d = valor.replace(/\D/g, "");
  return d.length <= 13 && (d.startsWith("54") || d.length <= 11);
}

/** De lo más confiable a lo más adivinado. */
function nombreDe(autor: AutorDetectado): string | null {
  return (
    autor.proveedor?.name ??
    autor.nombreDeLaLista ??
    autor.nombreDelGrupo ??
    autor.nombre ??
    null
  );
}

function fuenteDelNombre(autor: AutorDetectado): string | null {
  if (autor.nombreDeLaLista) return "según su lista";
  if (autor.nombreDelGrupo) return "según su grupo";
  return null;
}

function iniciales(nombre: string | null): string {
  if (!nombre) return "?";
  return nombre
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

function colorConfianza(puntos: number): string {
  if (puntos >= 75) return "bg-emerald-400/[0.10] text-emerald-300";
  if (puntos >= 50) return "bg-amber-400/[0.10] text-amber-200";
  return "bg-white/[0.06] text-white/45";
}

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
  const [verLista, setVerLista] = useState<string | null>(null);
  const [perfiles, setPerfiles] = useState<Record<string, PerfilContacto | string>>({});
  const [buscando, setBuscando] = useState<string | null>(null);

  /*
   * Una consulta por contacto y queda guardada, incluso si falla. Cada una es
   * una llamada a WhatsApp: repetirla cada vez que alguien abre la fila son
   * llamadas de más sobre la misma línea, que es lo que termina en bloqueo.
   */
  async function verQuienEs(autor: AutorDetectado) {
    if (perfiles[autor.comparable]) return;
    setBuscando(autor.comparable);
    const r = await perfilDeContactoAction(autor.telefono);
    setBuscando(null);
    setPerfiles((p) => ({ ...p, [autor.comparable]: r.ok ? r.data : r.error }));
  }
  const [nombre, setNombre] = useState("");
  const [margen, setMargen] = useState(MARGEN_POR_DEFECTO);
  const [pendiente, startTransition] = useTransition();

  function abrir(autor: AutorDetectado) {
    setAbierto(autor.comparable);
    /*
     * El orden va de lo más confiable a lo más adivinado: lo que el proveedor
     * escribe en su propia lista, después cómo está agendado, y recién al
     * final el chat donde apareció.
     */
    setNombre(nombreDe(autor) ?? autor.chats[0] ?? "");
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
    "h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring";

  if (autores.length === 0) {
    return (
      <p className="border-line text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
        El lector está conectado pero todavía no juntó mensajes. Esperá a que entre la
        próxima lista.
      </p>
    );
  }

  const fila = (autor: AutorDetectado) => {
    // Un proveedor desactivado ya existe: ofrecer cargarlo otra vez
    // duplicaría el teléfono. Se reactiva desde Proveedores.
    const pendienteDeCargar =
      autor.listas > 0 && !autor.proveedor && !autor.proveedorInactivo;

    return (
      <li key={autor.comparable} className="vidrio-sutil rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3.5">
            <span
              aria-hidden
              className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.06] text-sm font-semibold text-white"
            >
              {iniciales(nombreDe(autor))}
            </span>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-base font-semibold text-white">
                {nombreDe(autor) ?? <span className="text-white/60">Sin nombre</span>}
                {!autor.proveedor && fuenteDelNombre(autor) && (
                  <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-xs font-normal text-white/50">
                    {fuenteDelNombre(autor)}
                  </span>
                )}
                {autor.listas > 0 && !autor.proveedor && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-normal ${colorConfianza(autor.confianza)}`}
                  >
                    <Sparkles className="size-3" />
                    {autor.confianza}% proveedor
                  </span>
                )}
                {autor.proveedor && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/[0.07] px-2 py-0.5 text-xs font-normal text-emerald-300">
                    <Check className="size-3" />
                    Elegido
                  </span>
                )}
                {!autor.proveedor && autor.proveedorInactivo && (
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-normal text-white/50">
                    cargado pero desactivado
                  </span>
                )}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {esTelefonoDeVerdad(autor.telefono)
                  ? autor.telefono
                  : `id de WhatsApp ${autor.telefono}`}{" "}
                · {autor.chats.join(" · ")}
              </p>

              {autor.senales.length > 0 && autor.listas > 0 && (
                /* Las razones, no solo el número: un porcentaje solo no se
                     puede discutir, y acá la decisión la toma una persona. */
                <p className="mt-2 flex flex-wrap gap-1.5">
                  {autor.senales.map((senal) => (
                    <span
                      key={senal}
                      className="rounded-md bg-white/[0.05] px-2 py-0.5 text-xs text-white/50"
                    >
                      {senal}
                    </span>
                  ))}
                </p>
              )}
            </div>
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

        {autor.ultimoTexto && (
          /* Ver la lista es lo que permite reconocer al proveedor: el
                 identificador no dice nada, pero "iPhone 15 Pro Max 256 1150"
                 sí dice de quién es. */
          <div className="mt-3">
            <button
              type="button"
              onClick={() =>
                setVerLista(verLista === autor.comparable ? null : autor.comparable)
              }
              className="inline-flex items-center gap-1.5 text-xs text-white/45 transition-colors hover:text-white"
            >
              <ChevronDown
                className={`size-3.5 transition-transform ${verLista === autor.comparable ? "rotate-180" : ""}`}
              />
              {verLista === autor.comparable ? "Ocultar" : "Ver"} su última lista
              {autor.equiposEnUltima > 0 && ` (${autor.equiposEnUltima} equipos)`}
            </button>

            {verLista === autor.comparable && (
              <pre className="mt-2 max-h-72 overflow-auto rounded-xl border border-white/[0.07] bg-black/30 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-white/70">
                {autor.ultimoTexto}
              </pre>
            )}
          </div>
        )}

        {(() => {
          const perfil = perfiles[autor.comparable];
          const hayDatos =
            typeof perfil === "object" && Boolean(perfil.negocio || perfil.estado);

          return (
            <div className="mt-2">
              {perfil === undefined && (
                <button
                  type="button"
                  onClick={() => verQuienEs(autor)}
                  disabled={buscando === autor.comparable}
                  className="inline-flex items-center gap-1.5 text-xs text-white/45 transition-colors hover:text-white disabled:opacity-50"
                >
                  {buscando === autor.comparable ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <BadgeInfo className="size-3.5" />
                  )}
                  Averiguar quién es
                </button>
              )}

              {typeof perfil === "string" && (
                <p className="text-xs text-amber-200/70">{perfil}</p>
              )}

              {typeof perfil === "object" && !hayDatos && (
                /* Que no haya nada también es información: quiere decir
                       que el nombre lo va a tener que poner una persona. */
                <p className="text-xs text-white/35">
                  No tiene perfil de empresa ni estado visible.
                </p>
              )}

              {typeof perfil === "object" && hayDatos && (
                <div className="space-y-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-xs">
                  {perfil.negocio?.categoria && (
                    <p className="text-white/70">
                      Rubro:{" "}
                      <span className="text-white">{perfil.negocio.categoria}</span>
                    </p>
                  )}
                  {perfil.negocio?.descripcion && (
                    <p className="text-white/55">{perfil.negocio.descripcion}</p>
                  )}
                  {perfil.estado && (
                    <p className="text-white/55">Estado: {perfil.estado}</p>
                  )}
                  {perfil.negocio?.direccion && (
                    <p className="text-white/55">{perfil.negocio.direccion}</p>
                  )}
                  {perfil.negocio?.email && (
                    <p className="text-white/55">{perfil.negocio.email}</p>
                  )}
                  {perfil.negocio?.sitios.map((sitio) => (
                    <p key={sitio} className="text-white/55">
                      {sitio}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {pendienteDeCargar && abierto !== autor.comparable && (
          <button
            type="button"
            onClick={() => abrir(autor)}
            disabled={!supabaseReady}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.05] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/[0.10] disabled:opacity-50"
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
              El teléfono queda en {autor.telefono}. Es el dato con el que se reconocen
              sus listas: si lo cambiás, dejan de emparejar.
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => guardar(autor)}
                disabled={pendiente || nombre.trim().length === 0}
                className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
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
  };

  const cargados = autores.filter((a) => a.proveedor);
  const sugeridos = autores.filter((a) => !a.proveedor && a.listas > 0);
  const otros = autores.filter((a) => !a.proveedor && a.listas === 0);

  return (
    <div className="space-y-8">
      {cargados.length > 0 && (
        <section>
          <h2 className="mb-3 font-medium text-white">
            Tus proveedores <span className="text-white/40">({cargados.length})</span>
          </h2>
          <ul className="space-y-3">{cargados.map(fila)}</ul>
        </section>
      )}

      {sugeridos.length > 0 && (
        <section>
          <h2 className="font-medium text-white">
            Sugeridos <span className="text-white/40">({sugeridos.length})</span>
          </h2>
          <p className="mt-0.5 mb-3 text-sm text-white/45">
            Mandan listas pero todavía no los elegiste. Sus precios no entran al plan
            hasta que los cargues.
          </p>
          <ul className="space-y-3">{sugeridos.map(fila)}</ul>
        </section>
      )}

      {otros.length > 0 && (
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm text-white/45 transition-colors hover:text-white">
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
            Otras personas que escriben ({otros.length})
          </summary>
          <ul className="mt-3 space-y-3">{otros.map(fila)}</ul>
        </details>
      )}
    </div>
  );
}
