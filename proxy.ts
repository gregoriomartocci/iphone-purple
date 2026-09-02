import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Solo protege el panel. El sitio público es anónimo y no hay cuentas de cliente.
 *
 * Esto es un redirect por comodidad, no la barrera de seguridad: la autorización
 * real se vuelve a chequear dentro de cada Server Action del panel, porque las
 * acciones son accesibles por POST directo sin pasar por acá.
 */
export default auth(
  (req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
    const { pathname } = req.nextUrl;
    const session = req.auth;

    if (!pathname.startsWith("/admin")) return NextResponse.next();

    /**
     * Los redirects se arman clonando `req.nextUrl`, que refleja el host real del
     * pedido. Usar `req.url` acá haría que el destino salga del NEXTAUTH_URL
     * configurado: si esa variable queda desactualizada, el panel expulsa al
     * usuario a un dominio que no existe.
     */
    const to = (pathname: string, search?: Record<string, string>) => {
      const url = req.nextUrl.clone();
      url.pathname = pathname;
      url.search = "";
      for (const [key, value] of Object.entries(search ?? {})) {
        url.searchParams.set(key, value);
      }
      return NextResponse.redirect(url);
    };

    if (!session?.user) {
      // Se preserva la ruta pedida para volver ahí después del login.
      return to("/login", { redirect: req.nextUrl.pathname });
    }

    const role = session.user.role;
    if (role !== "admin" && role !== "super_admin") {
      return to("/");
    }

    return NextResponse.next();
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
