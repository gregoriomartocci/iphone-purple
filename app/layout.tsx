import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

/**
 * Una sola familia para todo el sitio.
 *
 * Inter es neutra, muy legible en tamaños chicos y tiene cifras tabulares
 * buenas para los precios. Tener una sola tipografía —en vez de una para
 * títulos y otra para texto— es lo que da coherencia.
 */
const inter = Inter({
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "iPhone Purple — Equipos Apple con garantía en Argentina",
    template: "%s | iPhone Purple",
  },
  description:
    "iPhone, iPad, Mac y Apple Watch con garantía escrita. Mirá el stock real, cotizá tu equipo usado con el Plan Canje y consultá por WhatsApp.",
  keywords: [
    "iPhone",
    "Apple",
    "celulares",
    "Argentina",
    "plan canje",
    "reparación iPhone",
    "iPhone usado",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "iPhone Purple",
    title: "iPhone Purple — Equipos Apple con garantía en Argentina",
    description:
      "Stock real, Plan Canje y servicio técnico propio. Consultá por WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "iPhone Purple",
    description: "Equipos Apple con garantía en Argentina.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1a1a20",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="bg-background text-foreground flex min-h-dvh flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
