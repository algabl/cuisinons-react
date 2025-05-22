import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import authConfig from "~/server/auth/config";

// export function middleware(request: NextRequest) {
//   const authHeader =
//     request.cookies.get("__Secure-authjs.session-token") ??
//     request.cookies.get("authjs.session-token");
//   const { pathname } = new URL(request.url);

//   if (pathname.startsWith("/_next/") || pathname.startsWith("/public/")) {
//     return NextResponse.next();
//   }

//   if (pathname === "/login" && authHeader) {
//     return NextResponse.redirect(new URL("/app", request.url));
//   }

//   if (!authHeader && pathname !== "/login") {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   return NextResponse.next();
// }

const { auth } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default auth;
