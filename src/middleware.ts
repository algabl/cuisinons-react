import NextAuth from "next-auth";
import authConfig from "~/server/auth/config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  if (!isAuthenticated && req.nextUrl.pathname !== "/login") {
    const url = req.nextUrl.clone();
    url.search = "callbackUrl=" + url.pathname;
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
});
