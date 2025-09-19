import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  apiAuthPrefix,
  AppRoutes,
  authRoutes,
  loginRoutes,
  publicRoutes,
} from "./routes-config";

// Edge-safe middleware: rely on presence of the session cookie only.
// Avoid verifying JWT in middleware (jsonwebtoken is not Edge-compatible).
const SESSION_COOKIE = "patient_session";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isApiRoute = pathname.startsWith("/api");
  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
  const isAuthRoute = authRoutes.includes(pathname);

  // Determine auth status by cookie presence (Edge-safe)
  const isLoggedIn = !!req.cookies.get(SESSION_COOKIE)?.value;

  // Public routes: intake forms and explicit public routes
  const isPublicForm = pathname.startsWith("/form");
  const isPublicRoute = isPublicForm || publicRoutes.includes(pathname);

  const isLoginRoute = loginRoutes.includes(pathname);

  // Always allow API routes to pass through middleware unmodified
  if (isApiRoute || isApiAuthRoute || isAuthRoute) {
    return NextResponse.next();
  }

  // If user is logged in and trying to access login routes, send them home
  if (isLoginRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(AppRoutes.home, req.url));
  }

  // If user is not logged in and is trying to access a protected route, send to login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL(AppRoutes.login, req.url));
  }

  // Otherwise allow the request
  return NextResponse.next();
}

export const config = {
  // Do NOT run middleware on API routes to avoid interfering with Set-Cookie
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/"],
};
