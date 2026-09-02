import type { Metadata } from "next";
import { SuppliersManager } from "@/components/admin/SuppliersManager";
import { getSuppliers } from "@/lib/data/admin";
import { isSupabaseConfigured } from "@/lib/data";

export const metadata: Metadata = { title: "Proveedores" };

export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Proveedores</h1>
        <p className="text-muted-foreground mt-1.5">
          El margen por defecto de cada uno se precarga al importar su lista.
        </p>
      </header>

      <SuppliersManager suppliers={suppliers} supabaseReady={isSupabaseConfigured()} />
    </div>
  );
}
