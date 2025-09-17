import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protect all /app routes except recipe view routes
const isProtectedRoute = createRouteMatcher(["/app(.*)"]);

const isPublicRecipeRoute = createRouteMatcher(["/app/recipes/:id"]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all app routes except public recipe routes
  if (isProtectedRoute(req) && !isPublicRecipeRoute(req)) {
    await auth.protect();
  }

  // Add pathname header for layout to use
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
