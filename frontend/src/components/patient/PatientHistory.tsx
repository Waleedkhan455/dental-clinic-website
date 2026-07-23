"use client";

import { NotebookText, Lock, User } from "lucide-react";

import { useAuthedResource } from "@/lib/hooks/useAuthedResource";
import { getMyHistory } from "@/lib/api/history";
import { EmptyState, PanelError, PanelLoading } from "@/components/patient/PanelStates";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";

export function PatientHistory() {
  const { data, loading, error, reload } = useAuthedResource(getMyHistory);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Treatment history</h1>
        <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
          <Lock className="h-4 w-4" aria-hidden="true" />
          Read-only — added by your dentist and visible only to you and the clinic.
        </p>
      </div>

      {loading ? (
        <PanelLoading />
      ) : error ? (
        <PanelError message={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<NotebookText className="h-8 w-8" />}
          title="No treatment records yet"
          description="After a visit, your dentist may add a record of your treatment here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((record) => (
            <Card key={record.id}>
              <CardContent className="flex flex-col gap-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold text-foreground">{record.treatment}</h2>
                  {record.created_at && (
                    <span className="text-sm text-muted-foreground">
                      {formatDate(record.created_at)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    {record.doctor_name ?? "Clinic dentist"}
                    {record.doctor_designation ? ` — ${record.doctor_designation}` : ""}
                  </span>
                </div>
                {record.notes && (
                  <p className="rounded-md bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
                    {record.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
