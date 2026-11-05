import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import { getEstadoSincronizacion } from "@/lib/data/admin";
import type { EstadoProveedor } from "@/lib/whatsapp/estado-sincronizacion";

export const metadata: Metadata = { title: "Sincronización" };

export const dynamic = "force-dynamic";

const ESTADOS: Record<EstadoProveedor, { texto: string; clase: string }> = {
  "lista-nueva": { texto: "Lista nueva sin leer", clase: "text-amber-300" },
  borrador: { texto: "Borrador sin aprobar", clase: "text-sky-300" },
  "sin-listas": { texto: "Sin listas", clase: "text-white/45" },
  "al-dia": { texto: "Al día", clase: "text-emerald-300" },
};

function cuando(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export default async function AdminSincronizacionPage() {
  const settings = await getSettings();
  const e = await getEstadoSincronizacion();

  const tarjetas = [
    {
      titulo: "Lector de WhatsApp",
      valor: e.lector.conectado ? "Conectado" : "Sin conexión",
      detalle: e.lector.conectado
        ? `Lee de forma continua. Último mensaje guardado: ${cuando(e.lector.ultimoMensaje)}`
        : "No está leyendo. Corre en la Mac: tiene que estar prendido.",
      bien: e.lector.conectado,
    },
    {
      titulo: "Importación al catálogo",
      valor: cuando(e.ultimaImportacion),
      detalle: "Todavía es manual: se hace desde WhatsApp, con tu aprobación.",
      bien: Boolean(e.ultimaImportacion),
    },
    {
      titulo: "Dólar USDT",
      valor: cuando(settings.dollarRateUpdatedAt),
      detalle:
        "Se actualiza de lunes a viernes a las 10:00, y cada hora si el lector está prendido.",
      bien: true,
    },
  ];

  return (
    <div className="max-w-5xl">
      <header className="mb-6">
        <h1 className="text-[1.75rem] font-semibold tracking-[-0.02em] text-white">
          Sincronización
        </h1>
        <p className="mt-1.5 text-white/45">
          Qué se leyó de cada proveedor, cuándo y qué falta pasar al catálogo.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {tarjetas.map((t) => (
          <section key={t.titulo} className="vidrio-sutil rounded-2xl p-4">
            <h2 className="text-xs text-white/45">{t.titulo}</h2>
            <p
              className={`tnum mt-1 text-lg font-semibold ${t.bien ? "text-white" : "text-amber-300"}`}
            >
              {t.valor}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-white/45">{t.detalle}</p>
          </section>
        ))}
      </div>

      <section
        aria-labelledby="proveedores"
        className="vidrio-sutil mt-5 rounded-2xl p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="proveedores" className="font-semibold text-white">
            Proveedores
          </h2>
          <Link href="/admin/whatsapp" className="text-xs text-white/60 hover:text-white">
            Leer listas nuevas
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="text-left text-xs text-white/45">
              <tr>
                <th className="py-2 pr-3 font-normal">Proveedor</th>
                <th className="py-2 pr-3 font-normal">Estado</th>
                <th className="py-2 pr-3 font-normal">Última lista vista</th>
                <th className="py-2 pr-3 font-normal">Última importación</th>
                <th className="py-2 text-right font-normal">Equipos publicados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] border-t border-white/[0.07]">
              {e.filas.map((f) => (
                <tr key={f.proveedor.id} className="text-white">
                  <td className="py-2.5 pr-3 font-medium">{f.proveedor.name}</td>
                  <td className={`py-2.5 pr-3 ${ESTADOS[f.estado].clase}`}>
                    {ESTADOS[f.estado].texto}
                  </td>
                  <td className="tnum py-2.5 pr-3 text-white/70">
                    {cuando(f.ultimaLectura)}
                  </td>
                  <td className="tnum py-2.5 pr-3 text-white/70">
                    {cuando(f.ultimaImportacion)}
                  </td>
                  <td className="tnum py-2.5 text-right text-white/70">{f.publicados}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!e.lector.conectado && (
          <p className="mt-3 text-xs text-amber-300">
            Con el lector apagado, &quot;Última lista vista&quot; puede estar incompleta.
          </p>
        )}
      </section>

      <section
        aria-labelledby="historial"
        className="vidrio-sutil mt-5 rounded-2xl p-4 sm:p-5"
      >
        <h2 id="historial" className="font-semibold text-white">
          Últimas lecturas
        </h2>
        {e.historial.length === 0 ? (
          <p className="mt-3 text-sm text-white/45">Todavía no hay lecturas.</p>
        ) : (
          <ul className="mt-3 divide-y divide-white/[0.06] border-t border-white/[0.07] text-sm">
            {e.historial.map((h) => (
              <li
                key={`${h.proveedor}-${h.fecha}`}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-white"
              >
                <span>
                  {h.proveedor}
                  <span className="ml-2 text-xs text-white/45">
                    {h.estado === "approved" ? "Importada" : "Borrador"}
                  </span>
                </span>
                <span className="tnum text-xs text-white/60">
                  {h.publicados} {h.publicados === 1 ? "equipo" : "equipos"} ·{" "}
                  {cuando(h.fecha)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
