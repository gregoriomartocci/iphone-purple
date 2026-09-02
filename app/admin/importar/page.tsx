import type { Metadata } from "next";
import { ImportWizard } from "@/components/admin/ImportWizard";
import { getSuppliers } from "@/lib/data/admin";
import { getSettings, isSupabaseConfigured } from "@/lib/data";

export const metadata: Metadata = { title: "Importar lista" };

export default async function ImportPage() {
  const [suppliers, settings] = await Promise.all([getSuppliers(), getSettings()]);

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Importar lista de proveedor</h1>
        <p className="text-muted-foreground mt-1.5 max-w-2xl">
          Pegá el mensaje de WhatsApp tal como llegó. Lo interpretamos, le aplicamos tu
          margen y te lo mostramos para que lo revises antes de publicarlo.
        </p>
      </header>

      <ImportWizard
        suppliers={suppliers}
        defaultMarginPct={settings.defaultMarginPct}
        dollarRate={settings.dollarRate}
        supabaseReady={isSupabaseConfigured()}
      />
    </div>
  );
}
