"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  type AuthUser,
  type LoginInput,
  type RegisterInput,
  type TokenResponse,
  getMe,
  loginRequest,
  registerRequest,
} from "@/lib/api/auth";
import { getTokenCookie, removeTokenCookie, setTokenCookie } from "./cookies";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  /** True while the initial session is being restored from the cookie. */
  isLoading: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session from the token cookie on first load.
  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const existing = getTokenCookie();
      if (existing) {
        try {
          const me = await getMe(existing);
          if (active) {
            setToken(existing);
            setUser(me);
          }
        } catch {
          removeTokenCookie();
        }
      }
      if (active) {
        setIsLoading(false);
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const applyAuth = useCallback((response: TokenResponse): AuthUser => {
    setTokenCookie(response.access_token);
    setToken(response.access_token);
    setUser(response.user);
    return response.user;
  }, []);

  const login = useCallback(
    async (input: LoginInput) => applyAuth(await loginRequest(input)),
    [applyAuth],
  );

  const register = useCallback(
    async (input: RegisterInput) => applyAuth(await registerRequest(input)),
    [applyAuth],
  );

  const logout = useCallback(() => {
    removeTokenCookie();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, logout }),
    [user, token, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
