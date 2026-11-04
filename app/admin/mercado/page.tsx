import type { Metadata } from "next";
import { MercadoPanel } from "@/components/admin/MercadoPanel";
import { getSettings } from "@/lib/data";
import { getUltimasListas } from "@/lib/data/admin";
import { armarMercado } from "@/lib/whatsapp/mercado";

export const metadata: Metadata = { title: "Mercado" };

export const dynamic = "force-dynamic";

export default async function AdminMercadoPage() {
  const [listas, settings] = await Promise.all([getUltimasListas(), getSettings()]);
  const equipos = armarMercado(listas, settings.dollarRate);

  return (
    <div className="max-w-4xl">
      <header className="mb-6">
        <h1 className="text-[1.75rem] font-semibold tracking-[-0.02em] text-white">
          Mercado
        </h1>
        <p className="mt-1.5 text-white/45">
          Qué ofrece cada proveedor según su última lista importada. Consultá el stock
          antes de vender: las listas casi nunca dicen cuántas unidades quedan.
        </p>
      </header>
      <MercadoPanel equipos={equipos} />
    </div>
  );
}
