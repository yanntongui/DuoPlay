import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin/token";
import { isAdminConsoleEnabled } from "@/lib/admin/enabled";

/**
 * Console interne.
 *
 * - Tant que `ADMIN_ENABLED` n'est pas explicitement `1`, l'accès renvoie 404
 *   (voir `lib/admin/enabled.ts`).
 * - L'authentification repose sur un cookie HttpOnly signé (HMAC), posé par la
 *   Server Action `login`. Aucun jeton n'est lisible ni forgeable côté client.
 */

const LOGIN_PATH = "/admin/login";

export async function middleware(request: NextRequest) {
  if (!isAdminConsoleEnabled()) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const pathname = request.nextUrl.pathname;
  const authenticated = await verifyAdminToken(
    request.cookies.get(ADMIN_COOKIE)?.value,
    process.env.ADMIN_SESSION_SECRET,
  );

  if (pathname === LOGIN_PATH) {
    if (authenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    const url = new URL(LOGIN_PATH, request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
