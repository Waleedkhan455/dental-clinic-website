"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";

interface ResourceState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Fetch an authenticated resource using the token from AuthContext.
 *
 * Handles the session-restore delay (waits for auth to settle), reports a
 * friendly error, and exposes `reload()` for refetching after a mutation.
 *
 * `fetcher` must be a stable reference (a module-level API function), so it is
 * intentionally excluded from the effect dependencies.
 */
export function useAuthedResource<T>(
  fetcher: (token: string) => Promise<T>,
): ResourceState<T> & { reload: () => void } {
  const { token, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<ResourceState<T>>({
    data: null,
    error: null,
    loading: true,
  });
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setState({ data: null, error: "You are not signed in.", loading: false });
      return;
    }

    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    (async () => {
      try {
        const data = await fetcher(token);
        if (active) setState({ data, error: null, loading: false });
      } catch (err) {
        if (active) {
          setState({
            data: null,
            error:
              err instanceof ApiError
                ? err.message
                : "Something went wrong while loading. Please try again.",
            loading: false,
          });
        }
      }
    })();

    return () => {
      active = false;
    };
    // fetcher is a stable module-level function — see the note above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, authLoading, nonce]);

  return { ...state, reload };
}
