import type { Metadata } from "next";
import { LeadsList } from "@/components/admin/LeadsList";
import { getTradeInLeads } from "@/lib/data/admin";
import { isSupabaseConfigured } from "@/lib/data";

export const metadata: Metadata = { title: "Plan Canje" };

export const dynamic = "force-dynamic";

export default async function AdminTradeInsPage() {
  const leads = await getTradeInLeads();
  const pending = leads.filter((l) => l.status === "pending").length;

  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Plan Canje</h1>
        <p className="text-muted-foreground mt-1.5">
          {pending > 0
            ? `${pending} ${pending === 1 ? "consulta sin responder" : "consultas sin responder"}.`
            : "Consultas que llegaron desde el cotizador de la web."}
        </p>
      </header>

      <LeadsList leads={leads} supabaseReady={isSupabaseConfigured()} />
    </div>
  );
}
