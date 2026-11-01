import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const pathname = request.nextUrl.pathname;

  // Routes publiques - pas de vérification
  if (pathname === "/admin/login" || pathname === "/admin/2fa") {
    return NextResponse.next();
  }

  // Si on est sur une autre route admin sans token, rediriger vers login
  if (pathname.startsWith("/admin") && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Si on est sur login avec token, rediriger vers dashboard
  if (pathname === "/admin/login" && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
