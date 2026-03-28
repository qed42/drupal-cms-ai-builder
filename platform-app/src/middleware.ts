import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

/**
 * Maps old onboarding step slugs to their new composite equivalents.
 */
const STEP_REDIRECTS: Record<string, string> = {
  name: "describe",
  idea: "describe",
  audience: "describe",
  theme: "style",
  design: "style",
  tone: "style",
  fonts: "brand",
  "follow-up": "details",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Redirect old onboarding step slugs to new composite pages
  const onboardingMatch = pathname.match(/^\/onboarding\/([^/]+)$/);
  if (onboardingMatch) {
    const slug = onboardingMatch[1];
    const newSlug = STEP_REDIRECTS[slug];
    if (newSlug) {
      const url = req.nextUrl.clone();
      url.pathname = `/onboarding/${newSlug}`;
      return NextResponse.redirect(url);
    }
  }

  const protectedPaths = ["/onboarding", "/dashboard"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from auth pages to dashboard
  const authPaths = ["/login", "/register"];
  if (authPaths.includes(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
