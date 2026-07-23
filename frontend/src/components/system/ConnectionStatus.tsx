"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, Database } from "lucide-react";

import { getHealth, type HealthResponse } from "@/lib/api/client";

type Status = "loading" | "online" | "offline";

/**
 * Phase 1 connectivity check: confirms the frontend can reach the FastAPI
 * backend and reports database status. Intended as a temporary build-time aid.
 */
export function ConnectionStatus() {
  const [status, setStatus] = useState<Status>("loading");
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let active = true;
    getHealth()
      .then((data) => {
        if (!active) return;
        setHealth(data);
        setStatus("online");
      })
      .catch(() => {
        if (active) setStatus("offline");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        {status === "loading" && (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
        )}
        {status === "online" && (
          <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
        )}
        {status === "offline" && <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />}
        <div>
          <p className="text-sm font-semibold text-foreground">
            {status === "loading" && "Checking API connection…"}
            {status === "online" && "API connected"}
            {status === "offline" && "API unreachable"}
          </p>
          <p className="text-sm text-muted-foreground">
            {status === "offline"
              ? "Start the FastAPI backend on the configured API URL."
              : health?.service ?? "FastAPI backend"}
          </p>
        </div>
      </div>

      {health && (
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <Database
            className={health.database.connected ? "h-4 w-4 text-success" : "h-4 w-4 text-warning"}
            aria-hidden="true"
          />
          <span className="text-sm text-muted-foreground">
            {health.database.connected
              ? `Database connected (${health.database.name})`
              : "Database not connected — awaiting MongoDB Atlas configuration"}
          </span>
        </div>
      )}
    </div>
  );
}
