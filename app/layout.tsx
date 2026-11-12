import type { Metadata, Viewport } from "next";
import { Jost, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

/**
 * Una sola familia para todo el sitio.
 *
 * Jost es una geométrica inspirada en Futura, que es la que usan las piezas de
 * Instagram de la marca. Mantener la misma tipografía entre el feed y la web
 * hace que se reconozcan como lo mismo.
 */
const jost = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Monoespaciada solo para el textarea donde se pegan las listas de proveedor:
// ahí alinear columnas ayuda a leer, en el resto del sitio no hace falta.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://iphonepurple.com.ar";

/**
 * Metadatos del sitio, orientados a búsqueda local.
 *
 * El negocio compite en La Plata, no en todo el país: quien busca "iPhone La
 * Plata" está a un mensaje de comprar, y quien busca "iPhone" a secas está
 * comparando contra Mercado Libre y Frávega, que siempre van a salir primero.
 * Por eso la ciudad aparece en el título, en la descripción y en los datos
 * estructurados, que es lo que Google usa para el paquete local del mapa.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "iPhone Purple — iPhone y productos Apple en La Plata",
    template: "%s | iPhone Purple La Plata",
  },
  description:
    "Venta de iPhone, iPad, Mac, Apple Watch y celulares en La Plata, con garantía escrita y factura. Stock real publicado, Plan Canje por tu equipo usado, servicio técnico propio y envíos a todo el país.",
  // Van del término más específico al más general: primero cómo busca alguien
  // de la zona, después el modelo concreto, y al final la categoría amplia.
  keywords: [
    "iPhone La Plata",
    "celulares La Plata",
    "Apple La Plata",
    "comprar iPhone La Plata",
    "iPhone usado La Plata",
    "reparación de iPhone La Plata",
    "servicio técnico Apple La Plata",
    "plan canje iPhone",
    "iPhone 17",
    "iPhone 16",
    "iPhone 15",
    "iPad",
    "MacBook",
    "Apple Watch",
    "AirPods",
    "celulares Xiaomi Motorola",
    "iPhone sellado y seminuevo",
    "iPhone con garantía Argentina",
  ],
  // Le dice al buscador dónde está el negocio, además del JSON-LD.
  other: {
    "geo.region": "AR-B",
    "geo.placename": "La Plata, Buenos Aires",
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "iPhone Purple",
    title: "iPhone Purple — iPhone y productos Apple en La Plata",
    description:
      "iPhone, iPad, Mac y Apple Watch con garantía escrita en La Plata. Stock real, Plan Canje y servicio técnico propio.",
  },
  twitter: {
    card: "summary_large_image",
    title: "iPhone Purple — Apple en La Plata",
    description: "iPhone, iPad y Mac con garantía en La Plata. Stock real y Plan Canje.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0c10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${jost.variable} ${geistMono.variable}`}>
      <body className="bg-background text-foreground flex min-h-dvh flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
