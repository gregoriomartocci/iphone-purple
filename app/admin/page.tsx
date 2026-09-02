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
    <div className="border-line rounded-xl border p-5">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="tnum text-foreground mt-1.5 text-2xl font-semibold">{value}</p>
      {hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
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
        <h1 className="text-2xl font-semibold">Resumen</h1>
        <p className="text-muted-foreground mt-1.5">
          Cómo viene el stock y las ventas del mes.
        </p>
      </header>

      {!ready && (
        <div className="mb-8 flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-5 sm:flex-row sm:items-center">
          <Database className="size-5 shrink-0 text-amber-700" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              Supabase todavía no está conectado
            </p>
            <p className="mt-0.5 text-sm text-amber-800">
              Estás viendo el catálogo de demostración. Cargá las claves en{" "}
              <code className="rounded bg-amber-100 px-1">.env.local</code> y aplicá{" "}
              <code className="rounded bg-amber-100 px-1">lib/supabase/schema.sql</code>{" "}
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
        <section className="border-line rounded-xl border">
          <div className="border-line flex items-center justify-between border-b p-5">
            <h2 className="font-medium">Poco stock</h2>
            <Link
              href="/admin/productos"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
            >
              Ver productos
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {stats.lowStock.length === 0 ? (
            <p className="text-muted-foreground p-5 text-sm">
              Nada por reponer con urgencia.
            </p>
          ) : (
            <ul className="divide-line divide-y">
              {stats.lowStock.map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm">{item.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {item.variant}
                    </p>
                  </div>
                  <span className="text-purple inline-flex shrink-0 items-center gap-1.5 text-sm font-medium">
                    <AlertTriangle className="size-3.5" />
                    {item.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border-line rounded-xl border">
          <div className="border-line flex items-center justify-between border-b p-5">
            <h2 className="font-medium">Últimas ventas</h2>
            <Link
              href="/admin/ventas"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
            >
              Ver todas
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {sales.length === 0 ? (
            <p className="text-muted-foreground p-5 text-sm">
              Todavía no registraste ninguna venta.
            </p>
          ) : (
            <ul className="divide-line divide-y">
              {sales.map((sale) => (
                <li key={sale.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm">{sale.productName}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {sale.customerName} · {sale.saleNumber}
                    </p>
                  </div>
                  <span className="tnum text-foreground shrink-0 text-sm font-medium">
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
          className="border-line mt-6 flex items-center justify-between gap-4 rounded-xl border p-5 transition-colors hover:border-white/25"
        >
          <div>
            <p className="text-foreground font-medium">
              {stats.pendingLeads}{" "}
              {stats.pendingLeads === 1
                ? "consulta de Plan Canje sin responder"
                : "consultas de Plan Canje sin responder"}
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Cuanto antes las contestes, más chances de cerrar.
            </p>
          </div>
          <ArrowRight className="text-muted-foreground size-4 shrink-0" />
        </Link>
      )}
    </div>
  );
}
