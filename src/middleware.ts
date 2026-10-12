import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proteção leve (edge-safe): só verifica a existência do cookie de sessão.
 * A validação real do JWT acontece em `requireStore()` nas páginas/ações do admin.
 */
export function middleware(req: NextRequest) {
  const hasSession =
    req.cookies.has("authjs.session-token") || req.cookies.has("__Secure-authjs.session-token");
  if (!hasSession) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
