"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, CalendarPlus, History } from "lucide-react";

import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { useAuthedResource } from "@/lib/hooks/useAuthedResource";
import { ApiError } from "@/lib/api/client";
import {
  type AppointmentDetail,
  cancelAppointment,
  getMyAppointments,
  partitionAppointments,
} from "@/lib/api/appointments";
import { AppointmentCard } from "@/components/patient/AppointmentCard";
import { EmptyState, PanelError, PanelLoading } from "@/components/patient/PanelStates";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDateTime } from "@/lib/format";

export function PatientAppointments() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { data, loading, error, reload } = useAuthedResource(getMyAppointments);

  const [target, setTarget] = useState<AppointmentDetail | null>(null);
  const [cancelling, setCancelling] = useState(false);

  async function confirmCancel() {
    if (!target || !token) return;
    setCancelling(true);
    try {
      await cancelAppointment(target.id, token);
      toast({ title: "Appointment cancelled", variant: "success" });
      setTarget(null);
      reload();
    } catch (err) {
      toast({
        title: "Could not cancel",
        description: err instanceof ApiError ? err.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <Shell><PanelLoading /></Shell>;
  if (error) return <Shell><PanelError message={error} onRetry={reload} /></Shell>;

  const { upcoming, past } = partitionAppointments(data ?? []);

  return (
    <Shell>
      {upcoming.length === 0 && past.length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="h-8 w-8" />}
          title="You have no appointments yet"
          description="Book your first appointment and it will show up here."
          action={
            <Link href="/patient/book" className={buttonVariants({ variant: "primary" })}>
              <CalendarPlus className="h-5 w-5" aria-hidden="true" />
              Book an appointment
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <CalendarClock className="h-5 w-5 text-primary" aria-hidden="true" />
              Upcoming
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {upcoming.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onCancel={setTarget}
                  />
                ))}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <History className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                Past &amp; cancelled
              </h2>
              <div className="flex flex-col gap-3">
                {past.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <Modal
        open={target !== null}
        onClose={() => (cancelling ? undefined : setTarget(null))}
        title="Cancel this appointment?"
        description={
          target
            ? `${target.doctor_name ?? "Your dentist"} — ${formatDateTime(target.scheduled_at)}`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setTarget(null)} disabled={cancelling}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={confirmCancel} isLoading={cancelling}>
              Cancel appointment
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          This will cancel your request. You can always book a new appointment afterwards.
        </p>
      </Modal>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My appointments</h1>
          <p className="mt-1 text-muted-foreground">
            Track your upcoming visits and review past appointments.
          </p>
        </div>
        <Link href="/patient/book" className={buttonVariants({ variant: "primary", size: "sm" })}>
          <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          Book new
        </Link>
      </div>
      {children}
    </div>
  );
}
