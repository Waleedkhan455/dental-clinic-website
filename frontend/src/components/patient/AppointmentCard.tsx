import { CalendarClock, CalendarCog, Stethoscope, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AppointmentStatusBadge } from "@/components/patient/AppointmentStatusBadge";
import type { AppointmentDetail } from "@/lib/api/appointments";
import { formatDateTime } from "@/lib/format";

interface AppointmentCardProps {
  appointment: AppointmentDetail;
  /** When provided, a Cancel button is shown (only for cancellable ones). */
  onCancel?: (appointment: AppointmentDetail) => void;
}

export function AppointmentCard({ appointment, onCancel }: AppointmentCardProps) {
  const {
    doctor_name,
    doctor_designation,
    service_name,
    scheduled_at,
    previous_scheduled_at,
    notes,
    status,
  } = appointment;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 text-foreground">
            <CalendarClock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="font-semibold">{formatDateTime(scheduled_at)}</span>
            {previous_scheduled_at && <Badge tone="warning">Rescheduled</Badge>}
          </div>
          {previous_scheduled_at && (
            <div className="flex items-start gap-2 rounded-md bg-warning-surface px-3 py-2 text-sm text-foreground">
              <CalendarCog className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              <span>
                The clinic moved this appointment. Previously{" "}
                <span className="line-through">{formatDateTime(previous_scheduled_at)}</span>.
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {doctor_name ?? "Dentist"}
              {doctor_designation ? ` — ${doctor_designation}` : ""}
            </span>
          </div>
          {service_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Stethoscope className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{service_name}</span>
            </div>
          )}
          {notes && (
            <p className="mt-1 rounded-md bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
              {notes}
            </p>
          )}
        </div>

        <div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
          <AppointmentStatusBadge status={status} />
          {onCancel && (
            <Button variant="outline" size="sm" onClick={() => onCancel(appointment)}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
