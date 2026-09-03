import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { pagoConfigurado } from "@/lib/mercadopago";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Finalizar compra",
  description: "Confirmá tu pedido. No hace falta crear una cuenta.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const settings = await getSettings();

  return (
    <div className="shell py-12 sm:py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">Finalizar compra</h1>
      <p className="text-muted-foreground mt-2">
        Dejanos tus datos y coordinamos la entrega. No hace falta crear una cuenta.
      </p>

      <div className="mt-10">
        <CheckoutForm
          whatsappNumber={settings.whatsappNumber}
          pagoDisponible={pagoConfigurado()}
        />
      </div>
    </div>
  );
}
