import type { Metadata } from "next";
import { SaleForm } from "@/components/admin/SaleForm";
import { getSales } from "@/lib/data/admin";
import { getProducts, getSettings, isSupabaseConfigured } from "@/lib/data";
import { formatARS } from "@/utils/format";

export const metadata: Metadata = { title: "Ventas" };

export const dynamic = "force-dynamic";

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  canje: "Canje",
};

export default async function AdminSalesPage() {
  const [sales, products, settings] = await Promise.all([
    getSales(100),
    getProducts(),
    getSettings(),
  ]);

  const revenue = sales.reduce((sum, s) => sum + s.salePrice * s.quantity, 0);
  const margin = sales.reduce(
    (sum, s) => sum + (s.salePrice - (s.costPrice ?? 0)) * s.quantity,
    0
  );

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Ventas</h1>
        <p className="text-muted-foreground mt-1.5">
          Cada venta que registrás descuenta el stock automáticamente.
        </p>
      </header>

      <SaleForm
        products={products}
        dollarRate={settings.dollarRate}
        supabaseReady={isSupabaseConfigured()}
      />

      {sales.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="border-line rounded-xl border p-5">
            <p className="text-muted-foreground text-sm">Ventas registradas</p>
            <p className="tnum mt-1.5 text-2xl font-semibold">{sales.length}</p>
          </div>
          <div className="border-line rounded-xl border p-5">
            <p className="text-muted-foreground text-sm">Facturado</p>
            <p className="tnum mt-1.5 text-2xl font-semibold">{formatARS(revenue)}</p>
          </div>
          <div className="border-line rounded-xl border p-5">
            <p className="text-muted-foreground text-sm">Margen bruto</p>
            <p className="tnum mt-1.5 text-2xl font-semibold">{formatARS(margin)}</p>
          </div>
        </div>
      )}

      <div className="mt-8">
        {sales.length === 0 ? (
          <div className="border-line rounded-xl border border-dashed py-16 text-center">
            <p className="text-foreground font-medium">
              Todavía no hay ventas registradas
            </p>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Cuando registres la primera, vas a ver acá el historial y los totales.
            </p>
          </div>
        ) : (
          <div className="border-line overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-line text-muted-foreground border-b text-left text-xs">
                  <th className="p-3 font-medium">N°</th>
                  <th className="p-3 font-medium">Equipo</th>
                  <th className="p-3 font-medium">Cliente</th>
                  <th className="p-3 font-medium">Pago</th>
                  <th className="p-3 font-medium">Fecha</th>
                  <th className="p-3 text-right font-medium">Total</th>
                  <th className="p-3 text-right font-medium">Margen</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => {
                  const total = sale.salePrice * sale.quantity;
                  const saleMargin =
                    (sale.salePrice - (sale.costPrice ?? 0)) * sale.quantity;
                  return (
                    <tr key={sale.id} className="border-line border-b last:border-0">
                      <td className="tnum text-muted-foreground p-3 text-xs">
                        {sale.saleNumber}
                      </td>
                      <td className="p-3">
                        <p className="text-foreground">{sale.productName}</p>
                        <p className="text-muted-foreground text-xs">
                          {sale.variantLabel}
                        </p>
                      </td>
                      <td className="p-3">
                        <p className="text-foreground">{sale.customerName}</p>
                        {sale.customerPhone && (
                          <p className="text-muted-foreground text-xs">
                            {sale.customerPhone}
                          </p>
                        )}
                      </td>
                      <td className="text-muted-foreground p-3">
                        {PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod}
                      </td>
                      <td className="text-muted-foreground p-3">
                        {new Date(sale.soldAt).toLocaleDateString("es-AR")}
                      </td>
                      <td className="tnum text-foreground p-3 text-right font-medium">
                        {formatARS(total)}
                      </td>
                      <td className="tnum text-muted-foreground p-3 text-right">
                        {sale.costPrice === null ? "—" : formatARS(saleMargin)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
