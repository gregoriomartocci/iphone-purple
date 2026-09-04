import type { Metadata } from "next";
import { MargenesPanel } from "@/components/admin/MargenesPanel";
import { getProducts, getSettings } from "@/lib/data";
import { getSuppliers } from "@/lib/data/admin";
import type { ReglasMargen } from "@/lib/margen";

export const metadata: Metadata = { title: "Margen y precios" };

export const dynamic = "force-dynamic";

export default async function AdminMargenesPage() {
  const [items, settings, proveedores] = await Promise.all([
    getProducts({}),
    getSettings(),
    getSuppliers(),
  ]);

  /**
   * El punto de partida son los ajustes que ya existen.
   *
   * El margen por defecto vivía suelto en la configuración y no se usaba para
   * nada después de importar una lista: los precios quedaban congelados en el
   * momento de la carga. Acá pasa a ser la regla general de una cascada, que es
   * lo que permite revisar si el catálogo entero sigue en su precio.
   */
  const reglas: ReglasMargen = {
    general: { tipo: "porcentaje", valor: settings.defaultMarginPct },
    porProveedor: Object.fromEntries(
      proveedores
        .filter((p) => p.defaultMarginPct !== settings.defaultMarginPct)
        .map((p) => [p.id, { tipo: "porcentaje" as const, valor: p.defaultMarginPct }])
    ),
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Margen y precios</h1>
        <p className="text-muted-foreground mt-1.5 max-w-2xl">
          Cuánto margen se está aplicando, de dónde sale ese número y qué equipos quedaron
          fuera de precio. Mové las reglas y la tabla se recalcula sobre el catálogo real
          antes de guardar nada.
        </p>
      </header>

      <MargenesPanel
        productos={items}
        proveedores={proveedores.map((p) => ({ id: p.id, name: p.name }))}
        dollarRate={settings.dollarRate}
        reglasIniciales={reglas}
      />
    </div>
  );
}
