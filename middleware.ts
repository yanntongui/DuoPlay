import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * La console est une maquette : le jeton `admin_token` est posé côté client et
 * n'a aucune valeur d'authentification. On ne l'expose donc pas en production
 * tant que le vrai backend d'auth n'est pas branché (cf. lib/admin/enabled).
 */
function adminEnabled() {
  if (process.env.ADMIN_ENABLED === "1") return true;
  if (process.env.ADMIN_ENABLED === "0") return false;
  return process.env.NODE_ENV !== "production";
}

// Routes publiques sans vérification
const PUBLIC_ROUTES = ["/admin/login", "/admin/2fa"];

export function middleware(request: NextRequest) {
  if (!adminEnabled()) {
    return new NextResponse("Not Found", { status: 404 });
  }

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
