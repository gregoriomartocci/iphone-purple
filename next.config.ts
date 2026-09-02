import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad.
 *
 * La CSP es la que más trabajo hace: aunque algo lograra inyectar markup, el
 * navegador no ejecutaría scripts de otro origen. Next necesita 'unsafe-inline'
 * para sus scripts de hidratación, y en desarrollo además 'unsafe-eval' para el
 * refresh en caliente — por eso la política se endurece en producción.
 */
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Fotos de producto: Supabase Storage y las de demostración.
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  // Supabase (REST y realtime) y la API de Anthropic para el importador.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Nadie nos mete en un iframe: cierra el clickjacking sobre el panel.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      // Fotos de la semilla de demostración; se van cuando cargues las tuyas.
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // No anunciamos la versión del framework: es información gratis para un atacante.
  poweredByHeader: false,

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
