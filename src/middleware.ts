import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authHeader =
    request.cookies.get("__Secure-authjs.session-token") ??
    request.cookies.get("authjs.session-token");
  const { pathname } = new URL(request.url);

  if (pathname === "/login" && authHeader) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  if (!authHeader && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|public|$).*)"], // Protect all routes except API, _next, public assets, and "/"
};
