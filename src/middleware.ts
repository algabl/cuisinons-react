import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authHeader =
    request.cookies.get("__Secure-authjs.session-token") ??
    request.cookies.get("authjs.session-token");
  const { pathname } = new URL(request.url);

  if (pathname.startsWith("/_next/") || pathname.startsWith("/public/")) {
    return NextResponse.next();
  }

  if (pathname === "/login" && authHeader) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  if (!authHeader && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude all files in the /public folder
    // Exclude all files in the /api folder
    // Exclude _next/
    // Exclude favicon.ico
    "/((?!api|_next|static|public|favicon.ico).*)",
  ],
};
