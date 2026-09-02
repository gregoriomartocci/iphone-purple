import Link from "next/link";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return (
    <div className="shell flex min-h-[70svh] flex-col items-center justify-center py-20 text-center">
      <p className="text-muted-foreground text-sm">Error 404</p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Esta página no existe</h1>
      <p className="text-muted-foreground mt-3 max-w-sm leading-relaxed">
        Puede que el equipo que buscabas ya se haya vendido. Probá desde el catálogo.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/catalogo"
          className="bg-purple hover:bg-purple/85 inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-medium text-white transition-colors"
        >
          Ver catálogo
        </Link>
        <Link
          href="/"
          className="border-line text-foreground inline-flex h-12 items-center justify-center rounded-full border px-7 text-sm font-medium transition-colors hover:border-white/40"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
