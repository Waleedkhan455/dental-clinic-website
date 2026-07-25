/** Typed authentication API calls against the FastAPI backend. */

import { apiFetch } from "./client";

export type UserRole = "doctor" | "patient";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  created_at?: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  /** Verification code emailed by requestOtp(). */
  otp: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ProfileUpdateInput {
  name: string;
  phone?: string | null;
  avatar_url?: string | null;
}

export function registerRequest(input: RegisterInput): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/api/auth/register", { method: "POST", body: input });
}

/** Email a verification code to confirm the address before account creation. */
export function requestOtp(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/request-otp", {
    method: "POST",
    body: { email },
  });
}

export function loginRequest(input: LoginInput): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/api/auth/login", { method: "POST", body: input });
}

export function getMe(token: string): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/me", { token });
}

/** Update the signed-in user's own profile (name and phone). */
export function updateProfile(input: ProfileUpdateInput, token: string): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/me", { method: "PATCH", body: input, token });
}
