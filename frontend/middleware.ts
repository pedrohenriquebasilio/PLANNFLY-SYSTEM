import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes and NextAuth API routes
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/api/auth")
  ) {
    // If authenticated user visits /login, redirect to /home
    if (pathname === "/login" && req.auth) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    return NextResponse.next();
  }

  // Protected routes: redirect to /login if not authenticated
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)",
  ],
};
