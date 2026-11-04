import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Database } from "lucide-react";
import { getDashboardStats, getSales } from "@/lib/data/admin";
import { getSettings, isSupabaseConfigured } from "@/lib/data";
import { formatARS } from "@/utils/format";

export const metadata: Metadata = { title: "Resumen" };

export const dynamic = "force-dynamic";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="vidrio-sutil rounded-2xl p-5">
      <p className="text-sm text-white/45">{label}</p>
      {/* El número es lo único que se mira de reojo, así que carga el peso. */}
      <p className="tnum mt-2 text-[2rem] leading-none font-semibold tracking-[-0.02em] text-white">
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-white/35">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboard() {
  const settings = await getSettings();
  const [stats, sales] = await Promise.all([
    getDashboardStats(settings.dollarRate),
    getSales(6),
  ]);

  const ready = isSupabaseConfigured();

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <h1 className="text-[1.75rem] font-semibold tracking-[-0.02em] text-white">
          Resumen
        </h1>
        <p className="mt-1.5 text-white/45">Cómo viene el stock y las ventas del mes.</p>
      </header>

      {!ready && (
        <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-5 sm:flex-row sm:items-center">
          <Database className="size-5 shrink-0 text-amber-300" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-100">
              Supabase todavía no está conectado
            </p>
            <p className="mt-0.5 text-sm text-amber-200/70">
              Estás viendo el catálogo de demostración. Cargá las claves en{" "}
              <code className="rounded bg-amber-400/15 px-1 text-amber-100">
                .env.local
              </code>{" "}
              y aplicá{" "}
              <code className="rounded bg-amber-400/15 px-1 text-amber-100">
                lib/supabase/schema.sql
              </code>{" "}
              para empezar a guardar datos reales.
            </p>
          </div>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Unidades en stock"
          value={String(stats.unitsInStock)}
          hint={`${stats.productCount} productos publicados`}
        />
        <Stat
          label="Stock valorizado"
          value={formatARS(stats.stockValueArs)}
          hint="A precio de venta"
        />
        <Stat
          label="Margen potencial"
          value={formatARS(stats.potentialMarginArs)}
          hint="Si se vendiera todo el stock"
        />
        <Stat
          label="Ventas del mes"
          value={String(stats.salesThisMonth)}
          hint={
            stats.salesThisMonth > 0
              ? `${formatARS(stats.revenueThisMonth)} facturados`
              : "Todavía sin ventas este mes"
          }
        />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="vidrio-sutil overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
            <h2 className="font-medium text-white">Poco stock</h2>
            <Link
              href="/admin/productos"
              className="inline-flex items-center gap-1 text-sm text-white/45 transition-colors hover:text-white"
            >
              Ver productos
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {stats.lowStock.length === 0 ? (
            <p className="p-5 text-sm text-white/35">Nada por reponer con urgencia.</p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {stats.lowStock.map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">{item.name}</p>
                    <p className="truncate text-xs text-white/40">{item.variant}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-amber-300">
                    <AlertTriangle className="size-3.5" />
                    {item.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="vidrio-sutil overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
            <h2 className="font-medium text-white">Últimas ventas</h2>
            <Link
              href="/admin/ventas"
              className="inline-flex items-center gap-1 text-sm text-white/45 transition-colors hover:text-white"
            >
              Ver todas
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {sales.length === 0 ? (
            <p className="p-5 text-sm text-white/35">
              Todavía no registraste ninguna venta.
            </p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {sales.map((sale) => (
                <li key={sale.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">{sale.productName}</p>
                    <p className="truncate text-xs text-white/40">
                      {sale.customerName} · {sale.saleNumber}
                    </p>
                  </div>
                  <span className="tnum shrink-0 text-sm font-medium text-white">
                    {formatARS(sale.salePrice * sale.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {stats.pendingLeads > 0 && (
        <Link
          href="/admin/plan-canje"
          className="vidrio-sutil vidrio-sutil-hover mt-6 flex items-center justify-between gap-4 rounded-2xl p-5"
        >
          <div>
            <p className="font-medium text-white">
              {stats.pendingLeads}{" "}
              {stats.pendingLeads === 1
                ? "consulta de Plan Canje sin responder"
                : "consultas de Plan Canje sin responder"}
            </p>
            <p className="mt-0.5 text-sm text-white/45">
              Cuanto antes las contestes, más chances de cerrar.
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-white/40" />
        </Link>
      )}
    </div>
  );
}
