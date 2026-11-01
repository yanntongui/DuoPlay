import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes publiques sans vérification
const PUBLIC_ROUTES = ["/admin/login", "/admin/2fa"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const pathname = request.nextUrl.pathname;

  // Routes publiques
  if (PUBLIC_ROUTES.includes(pathname)) {
    // Si déjà authentifié sur login, rediriger vers dashboard
    if (token && pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // Protection des routes admin
  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
