"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, MessageCircle, Search, Trophy } from "lucide-react";
import { esTelefonoReal, mensajeDeStock } from "@/lib/whatsapp/consulta-stock";
import type { EquipoMercado, OfertaMercado } from "@/lib/whatsapp/mercado";
import type { ListaVista } from "@/lib/whatsapp/sincronizar";
import { waLink } from "@/lib/whatsapp";
import { formatARS } from "@/utils/format";

const GRADOS: Record<EquipoMercado["grado"], string> = {
  sellado: "Sellado",
  "a-plus": "A+",
  a: "A",
  "a-minus": "A-",
};

function iniciales(nombre: string): string {
  return nombre
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

/** Con zona fija: el servidor y el navegador tienen que escribir lo mismo. */
function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

/** El mensaje lo manda una persona: el lector de WhatsApp es solo de lectura. */
function ConsultarStock({
  equipo,
  oferta,
}: {
  equipo: EquipoMercado;
  oferta: OfertaMercado;
}) {
  const mensaje = mensajeDeStock(equipo, oferta);
  const clase =
    "inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] px-2.5 py-1.5 text-xs text-white/70 transition-colors hover:border-white/25 hover:text-white";

  if (oferta.telefono && esTelefonoReal(oferta.telefono)) {
    return (
      <a
        href={waLink(oferta.telefono, mensaje)}
        target="_blank"
        rel="noreferrer"
        className={clase}
      >
        <MessageCircle className="size-3.5" />
        Consultar stock
      </a>
    );
  }

  return (
    <button
      type="button"
      className={clase}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(mensaje);
          toast.success("Mensaje copiado. Pegalo en su chat.");
        } catch {
          toast.error(mensaje);
        }
      }}
    >
      <Copy className="size-3.5" />
      Copiar consulta
    </button>
  );
}

/** Lo que se pudo revisar de su chat justo antes de consultarle. */
function Verificacion({
  oferta,
  vistas,
}: {
  oferta: OfertaMercado;
  vistas: Record<string, ListaVista> | null;
}) {
  if (!vistas) {
    return <p className="text-xs text-white/35">Lector apagado: su chat no se revisó.</p>;
  }
  const vista = vistas[oferta.proveedorId];
  if (!vista) {
    return <p className="text-xs text-white/35">Sin mensajes recientes en sus chats.</p>;
  }
  return vista.fecha > oferta.fecha ? (
    <p className="text-xs text-amber-300">
      Hay una lista más nueva en {vista.chat} ({fechaCorta(vista.fecha)}): el precio puede
      haber cambiado.
    </p>
  ) : (
    <p className="text-xs text-white/35">Al día con {vista.chat}.</p>
  );
}

export function MercadoPanel({
  equipos,
  vistas,
}: {
  equipos: EquipoMercado[];
  vistas: Record<string, ListaVista> | null;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [proveedor, setProveedor] = useState<string | null>(null);

  const proveedores = useMemo(() => {
    const conteo = new Map<string, number>();
    for (const e of equipos) {
      for (const o of e.ofertas)
        conteo.set(o.proveedor, (conteo.get(o.proveedor) ?? 0) + 1);
    }
    return [...conteo].sort((a, b) => b[1] - a[1]);
  }, [equipos]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return equipos.filter(
      (e) =>
        (!proveedor || e.ofertas.some((o) => o.proveedor === proveedor)) &&
        (!q || `${e.modelo} ${e.capacidad}`.toLowerCase().includes(q))
    );
  }, [equipos, busqueda, proveedor]);

  if (equipos.length === 0) {
    return (
      <p className="vidrio-sutil rounded-2xl p-8 text-center text-sm text-white/45">
        Todavía no hay listas importadas.
      </p>
    );
  }

  const chip = (activo: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs transition-colors ${
      activo
        ? "border-primary bg-primary text-primary-foreground"
        : "border-white/[0.12] text-white/60 hover:border-white/25 hover:text-white"
    }`;

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Buscar equipo</span>
        <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar: iPhone 17 256"
          className="h-11 w-full rounded-xl border border-white/[0.12] bg-white/[0.04] pr-3 pl-10 text-sm text-white outline-none placeholder:text-white/35 focus-visible:border-white/30"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={chip(!proveedor)}
          onClick={() => setProveedor(null)}
        >
          Todos
        </button>
        {proveedores.map(([nombre, cantidad]) => (
          <button
            key={nombre}
            type="button"
            className={chip(proveedor === nombre)}
            onClick={() => setProveedor(nombre)}
          >
            {nombre} · {cantidad}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs text-white/35">{visibles.length} equipos</p>

      <ul className="mt-2 space-y-3">
        {visibles.map((e) => (
          <li key={e.clave} className="vidrio-sutil rounded-2xl p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-semibold text-white">
                  {e.modelo} {e.capacidad}
                </h2>
                <p className="mt-0.5 text-xs text-white/45">
                  {GRADOS[e.grado]}
                  {e.autenticidad === "replica" && " · Réplica"} · {e.ofertas.length}{" "}
                  {e.ofertas.length === 1 ? "proveedor" : "proveedores"}
                </p>
              </div>
              <div className="text-right">
                <p className="tnum font-semibold text-white">{formatARS(e.precioArs)}</p>
                <p className="tnum text-xs text-white/45">
                  USD {e.precioUsd} · tu precio
                </p>
              </div>
            </div>

            <ul className="mt-3 divide-y divide-white/[0.06] border-t border-white/[0.07]">
              {e.ofertas.map((o, i) => (
                <li
                  key={o.proveedorId}
                  className="flex flex-wrap items-center justify-between gap-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-xs font-semibold text-white"
                    >
                      {iniciales(o.proveedor)}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm text-white">
                        {o.proveedor}
                        {o.ingresando && (
                          <span className="rounded-full bg-amber-400/[0.10] px-2 py-0.5 text-xs text-amber-300">
                            Ingresando
                          </span>
                        )}
                        {i === 0 && e.ofertas.length > 1 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/[0.10] px-2 py-0.5 text-xs text-emerald-300">
                            <Trophy className="size-3" />
                            Más barato
                          </span>
                        )}
                      </p>
                      <p className="tnum text-xs text-white/45">
                        Costo {o.moneda} {o.costo} · lista del {fechaCorta(o.fecha)}
                        {i > 0 &&
                          ` · +USD ${Math.round(o.costoUsd - e.ofertas[0].costoUsd)}`}
                      </p>
                      <Verificacion oferta={o} vistas={vistas} />
                    </div>
                  </div>
                  <ConsultarStock equipo={e} oferta={o} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
