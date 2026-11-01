import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const pathname = request.nextUrl.pathname;

  // Routes publiques
  const publicRoutes = ["/admin/login", "/admin/2fa"];

  // Si on est sur une route admin et pas de token, rediriger vers login
  if (pathname.startsWith("/admin") && !publicRoutes.includes(pathname) && !token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Si on est sur login et déjà authentifié, rediriger vers dashboard
  if (pathname === "/admin/login" && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
