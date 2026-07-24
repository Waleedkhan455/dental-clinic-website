"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { useAuth } from "@/lib/auth/AuthContext";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";

/**
 * Shell for the authenticated panels (doctor + patient).
 *
 * Middleware guards these routes at the edge; this client guard is a
 * second line that also handles the loading state while the session restores.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  function handleLogout() {
    logout();
    // Hard navigation clears the client Router Cache so previously-authenticated
    // pages can't be shown from cache (e.g. via the Back button) after sign-out.
    window.location.assign("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
            </div>
            {user.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt=""
                className="h-9 w-9 rounded-full border border-border object-cover"
              />
            )}
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
