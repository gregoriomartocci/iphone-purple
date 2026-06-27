import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada | iPhone Purple",
};

export default function NotFound() {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="text-[120px] font-black text-[#F0F0F0] leading-none select-none">404</p>
      <h1 className="text-2xl font-bold text-[#111] -mt-4">Página no encontrada</h1>
      <p className="text-[#666] text-sm mt-2 mb-8 max-w-xs">
        La página que buscás no existe o fue movida. Volvé al inicio para seguir comprando.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="bg-[#7B2FBE] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#6D28D9] transition-colors"
        >
          Ir al inicio
        </Link>
        <Link
          href="/catalogo"
          className="border border-[#E8E8E8] text-[#111] px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#F7F7F7] transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
