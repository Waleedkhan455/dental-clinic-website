/**
 * Post-authentication redirect helpers.
 *
 * After login/register we perform a **hard** navigation (window.location)
 * rather than a soft router.replace(). The panels are gated by the Next.js
 * proxy (middleware); a soft navigation can reuse a Router-Cache entry that was
 * prefetched while logged out — i.e. the proxy's "redirect to /login" response —
 * which makes the user appear stuck on the login page. A full navigation sends
 * the freshly-set auth cookie and lets the proxy re-evaluate cleanly.
 */

import type { UserRole } from "@/lib/api/auth";

/** The panel a role lands on after signing in. */
export function panelPathForRole(role: UserRole): string {
  return role === "doctor" ? "/doctor" : "/patient";
}

/**
 * Read a safe same-site `?next=` path from a query string, or null.
 * Rejects protocol-relative (`//host`) and backslash tricks to avoid open
 * redirects to another origin.
 */
export function safeNextParam(search: string): string | null {
  const next = new URLSearchParams(search).get("next");
  if (!next) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

/** Resolve where to send a just-authenticated user, then hard-navigate there. */
export function redirectAfterAuth(role: UserRole, search: string): void {
  const destination = safeNextParam(search) ?? panelPathForRole(role);
  window.location.assign(destination);
}
