import type { Metadata } from "next";
import { PageHero, PAGE_PHOTOS } from "@/components/site/PageHero";
import { PanelCuenta } from "@/components/cuenta/PanelCuenta";

export const metadata: Metadata = {
  title: "Mi cuenta",
  description:
    "Tus pedidos, favoritos, direcciones y datos de contacto en un solo lugar.",
  alternates: { canonical: "/cuenta" },
  // No tiene nada que indexar y cambia por persona.
  robots: { index: false, follow: true },
};

export default function CuentaPage() {
  return (
    <>
      <PageHero
        title="Mi cuenta"
        subtitle="Tus pedidos, lo que guardaste y tus datos para no volver a escribirlos."
        image={PAGE_PHOTOS.catalogo}
      />

      <div className="shell py-12 sm:py-16">
        <PanelCuenta />
      </div>
    </>
  );
}
