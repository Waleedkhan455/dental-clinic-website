/** Typed authentication API calls against the FastAPI backend. */

import { apiFetch } from "./client";

export type UserRole = "doctor" | "patient";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
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
}

export interface LoginInput {
  email: string;
  password: string;
}

export function registerRequest(input: RegisterInput): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/api/auth/register", { method: "POST", body: input });
}

export function loginRequest(input: LoginInput): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/api/auth/login", { method: "POST", body: input });
}

export function getMe(token: string): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/me", { token });
}
