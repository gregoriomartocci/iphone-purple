import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login?redirect=/admin", req.url));
    }
    const role = session.user.role;
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (pathname.startsWith("/cuenta")) {
    if (!session?.user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${pathname}`, req.url)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*"],
};
