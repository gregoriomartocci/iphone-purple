import Link from "next/link";
import { MessageCircle } from "lucide-react";

const footerLinks = {
  tienda: [
    { href: "/catalogo", label: "Catálogo" },
    { href: "/catalogo?categoria=iphone", label: "iPhone" },
    { href: "/catalogo?categoria=samsung", label: "Samsung" },
    { href: "/catalogo?categoria=accesorios", label: "Accesorios" },
    { href: "/plan-canje", label: "Plan Canje" },
  ],
  ayuda: [
    { href: "/faq", label: "Preguntas frecuentes" },
    { href: "/envios", label: "Envíos" },
    { href: "/garantia", label: "Garantía" },
    { href: "/devoluciones", label: "Devoluciones" },
    { href: "/contacto", label: "Contacto" },
  ],
  cuenta: [
    { href: "/cuenta", label: "Mi cuenta" },
    { href: "/cuenta/pedidos", label: "Mis pedidos" },
    { href: "/login", label: "Iniciar sesión" },
    { href: "/register", label: "Crear cuenta" },
  ],
};

const paymentMethods = ["Visa", "Mastercard", "AMEX", "Mercado Pago", "Débito"];

export function Footer() {
  return (
    <footer className="bg-[#FAFAFA] border-t border-[#E8E8E8] mt-20">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-baseline gap-0.5 mb-4">
              <span className="text-[#111] font-black text-xl">iPhone</span>
              <span className="text-[#7B2FBE] font-black text-xl">Purple</span>
            </Link>
            <p className="text-[#888] text-sm leading-relaxed mb-6 max-w-xs">
              Tu tienda premium de celulares en Argentina. iPhone, Samsung y más
              marcas con garantía oficial y los mejores precios.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/iphonepurple"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#888] hover:text-[#7B2FBE] transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://wa.me/5491100000000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#888] hover:text-[#7B2FBE] transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links — Tienda */}
          <div>
            <h3 className="text-[#111] text-sm font-semibold mb-3">Tienda</h3>
            <ul className="space-y-2.5">
              {footerLinks.tienda.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#666] text-sm hover:text-[#111] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links — Ayuda */}
          <div>
            <h3 className="text-[#111] text-sm font-semibold mb-3">Ayuda</h3>
            <ul className="space-y-2.5">
              {footerLinks.ayuda.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#666] text-sm hover:text-[#111] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links — Mi cuenta */}
          <div>
            <h3 className="text-[#111] text-sm font-semibold mb-3">Mi cuenta</h3>
            <ul className="space-y-2.5">
              {footerLinks.cuenta.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#666] text-sm hover:text-[#111] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#999] text-xs">
            © 2025 iPhone Purple. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-2">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="px-2 py-0.5 bg-[#F0F0F0] rounded text-[#999] text-[10px] font-medium"
              >
                {method}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/privacidad"
              className="text-[#999] text-xs hover:text-[#111] transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className="text-[#999] text-xs hover:text-[#111] transition-colors"
            >
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
