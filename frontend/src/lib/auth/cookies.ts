/**
 * Token cookie helpers.
 *
 * The JWT is kept in a cookie (not localStorage) so Next.js middleware can read
 * it to guard panel routes. The real authorisation boundary is the API, which
 * verifies the token's signature on every request.
 */

export const TOKEN_COOKIE = "zimal_token";

// Keep in step with the backend token lifetime (24 hours).
const MAX_AGE_SECONDS = 60 * 60 * 24;

export function getTokenCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setTokenCookie(token: string): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; ` +
    `Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function removeTokenCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
