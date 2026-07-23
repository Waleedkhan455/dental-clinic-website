import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { AppointmentStatus } from "@/lib/api/appointments";

const STATUS_META: Record<AppointmentStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: "Pending confirmation", tone: "warning" },
  confirmed: { label: "Confirmed", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "destructive" },
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const meta = STATUS_META[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
