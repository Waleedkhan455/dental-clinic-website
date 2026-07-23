import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { TOKEN_COOKIE } from "@/lib/auth/cookies";

/**
 * Route guards for the authenticated panels (Next.js "proxy", formerly
 * "middleware").
 *
 * The token's role is read here only to route users to the correct panel and
 * bounce unauthenticated visitors to /login. This is a UX guard — the API
 * independently verifies the JWT signature and enforces roles on every request,
 * so a tampered cookie cannot access protected data.
 */

interface JwtPayload {
  role?: string;
  exp?: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    let base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padding = base64.length % 4;
    if (padding) base64 += "=".repeat(4 - padding);
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJwt(token);
  const isExpired = payload?.exp !== undefined && Date.now() / 1000 > payload.exp;
  if (!payload || isExpired) {
    return NextResponse.redirect(loginUrl);
  }

  // Wrong-role users are sent to their own panel.
  if (pathname.startsWith("/doctor") && payload.role !== "doctor") {
    return NextResponse.redirect(new URL("/patient", request.url));
  }
  if (pathname.startsWith("/patient") && payload.role !== "patient") {
    return NextResponse.redirect(new URL("/doctor", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/doctor", "/doctor/:path*", "/patient", "/patient/:path*"],
};
