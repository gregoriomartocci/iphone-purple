import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatbotBubble } from "@/components/chatbot/ChatbotBubble";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "iPhone Purple — Tu tienda premium de celulares en Argentina",
    template: "%s | iPhone Purple",
  },
  description:
    "iPhone, Samsung y las mejores marcas con garantía oficial. Envío express a todo el país, hasta 18 cuotas sin interés y Plan Canje.",
  keywords: ["iPhone", "Samsung", "celulares", "Argentina", "tienda", "premium", "plan canje"],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://iphonepurple.com.ar",
    siteName: "iPhone Purple",
    title: "iPhone Purple — Tu tienda premium de celulares en Argentina",
    description:
      "iPhone, Samsung y las mejores marcas con garantía oficial. Envío express a todo el país.",
  },
  twitter: {
    card: "summary_large_image",
    title: "iPhone Purple",
    description: "Tu tienda premium de celulares en Argentina",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#7B2FBE",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#111111]">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatbotBubble />
        </Providers>
      </body>
    </html>
  );
}
