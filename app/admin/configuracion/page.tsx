import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings, isSupabaseConfigured } from "@/lib/data";

export const metadata: Metadata = { title: "Configuración" };

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-muted-foreground mt-1.5">
          Estos valores se usan en todo el sitio público. Cambiarlos acá los actualiza en
          el header, el footer y cada botón de WhatsApp.
        </p>
      </header>

      <SettingsForm settings={settings} supabaseReady={isSupabaseConfigured()} />
    </div>
  );
}
