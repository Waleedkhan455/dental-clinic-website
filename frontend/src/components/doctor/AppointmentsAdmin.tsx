"use client";

import { useMemo, useState } from "react";
import { CalendarClock, CalendarCog, Check, CheckCheck, X } from "lucide-react";

import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { useAuthedResource } from "@/lib/hooks/useAuthedResource";
import { ApiError } from "@/lib/api/client";
import {
  type AppointmentDetail,
  type AppointmentStatus,
  getAllAppointments,
  updateAppointment,
} from "@/lib/api/appointments";
import { getDoctorsAdmin } from "@/lib/api/admin";
import type { Doctor } from "@/lib/api/public";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { AppointmentStatusBadge } from "@/components/patient/AppointmentStatusBadge";
import { PanelError, PanelLoading } from "@/components/patient/PanelStates";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { clinicDateTimeParts, formatDateTime } from "@/lib/format";

interface PageData {
  appointments: AppointmentDetail[];
  doctors: Doctor[];
}

// Stable module-level fetcher (see useAuthedResource).
async function fetchPage(token: string): Promise<PageData> {
  const [appointments, doctors] = await Promise.all([
    getAllAppointments({}, token),
    getDoctorsAdmin(token),
  ]);
  return { appointments, doctors };
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function AppointmentsAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { data, loading, error, reload } = useAuthedResource(fetchPage);

  const [statusFilter, setStatusFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);

  const [rescheduleFor, setRescheduleFor] = useState<AppointmentDetail | null>(null);
  const [cancelFor, setCancelFor] = useState<AppointmentDetail | null>(null);

  const doctorOptions = useMemo(
    () => [
      { value: "", label: "All dentists" },
      ...(data?.doctors ?? []).map((d) => ({ value: d.id, label: d.name })),
    ],
    [data?.doctors],
  );

  const filtered = useMemo(() => {
    const list = data?.appointments ?? [];
    return list.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (doctorFilter && a.doctor_id !== doctorFilter) return false;
      if (dayFilter && clinicDateTimeParts(a.scheduled_at).date !== dayFilter) return false;
      return true;
    });
  }, [data?.appointments, statusFilter, doctorFilter, dayFilter]);

  async function act(appt: AppointmentDetail, patch: Parameters<typeof updateAppointment>[1], label: string) {
    if (!token) return;
    setActingId(appt.id);
    try {
      await updateAppointment(appt.id, patch, token);
      toast({ title: label, variant: "success" });
      setRescheduleFor(null);
      setCancelFor(null);
      reload();
    } catch (err) {
      toast({
        title: "Action failed",
        description: err instanceof ApiError ? err.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Appointments"
        subtitle="Confirm, reschedule, cancel, or complete appointments. Filter by dentist, status, or day."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Select label="Status" options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        <Select label="Dentist" options={doctorOptions} value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} />
        <Input label="Day" type="date" value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} />
      </div>

      {loading ? (
        <PanelLoading />
      ) : error ? (
        <PanelError message={error} onRetry={reload} />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filtered.length} appointment{filtered.length === 1 ? "" : "s"}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Dentist</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No appointments match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((a) => {
                  const busy = actingId === a.id;
                  const active = a.status === "pending" || a.status === "confirmed";
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <span className="font-medium text-foreground">{a.patient_name}</span>
                        <span className="block text-xs text-muted-foreground">{a.patient_phone}</span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{formatDateTime(a.scheduled_at)}</TableCell>
                      <TableCell className="whitespace-nowrap">{a.doctor_name ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{a.service_name ?? "—"}</TableCell>
                      <TableCell><AppointmentStatusBadge status={a.status} /></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-2">
                          {a.status === "pending" && (
                            <Button size="sm" variant="primary" isLoading={busy} onClick={() => act(a, { status: "confirmed" }, "Appointment confirmed")}>
                              <Check className="h-4 w-4" aria-hidden="true" /> Confirm
                            </Button>
                          )}
                          {a.status === "confirmed" && (
                            <Button size="sm" variant="primary" isLoading={busy} onClick={() => act(a, { status: "completed" }, "Marked complete")}>
                              <CheckCheck className="h-4 w-4" aria-hidden="true" /> Complete
                            </Button>
                          )}
                          {active && (
                            <Button size="sm" variant="secondary" disabled={busy} onClick={() => setRescheduleFor(a)}>
                              <CalendarCog className="h-4 w-4" aria-hidden="true" /> Reschedule
                            </Button>
                          )}
                          {active && (
                            <Button size="sm" variant="outline" disabled={busy} onClick={() => setCancelFor(a)}>
                              <X className="h-4 w-4" aria-hidden="true" /> Cancel
                            </Button>
                          )}
                          {!active && <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </>
      )}

      {rescheduleFor && (
        <RescheduleModal
          appointment={rescheduleFor}
          busy={actingId === rescheduleFor.id}
          onClose={() => setRescheduleFor(null)}
          onSubmit={(scheduled_at) => act(rescheduleFor, { scheduled_at }, "Appointment rescheduled")}
        />
      )}

      <ConfirmDialog
        open={cancelFor !== null}
        title="Cancel this appointment?"
        message={
          cancelFor
            ? `${cancelFor.patient_name} — ${formatDateTime(cancelFor.scheduled_at)}. This frees the slot.`
            : ""
        }
        confirmLabel="Cancel appointment"
        busy={cancelFor ? actingId === cancelFor.id : false}
        onConfirm={() => cancelFor && act(cancelFor, { status: "cancelled" }, "Appointment cancelled")}
        onCancel={() => setCancelFor(null)}
      />
    </div>
  );
}

function RescheduleModal({
  appointment,
  busy,
  onClose,
  onSubmit,
}: {
  appointment: AppointmentDetail;
  busy: boolean;
  onClose: () => void;
  onSubmit: (scheduledAt: string) => void;
}) {
  const initial = clinicDateTimeParts(appointment.scheduled_at);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);

  return (
    <Modal
      open
      onClose={() => (busy ? undefined : onClose())}
      title="Reschedule appointment"
      description={`${appointment.patient_name} · currently ${formatDateTime(appointment.scheduled_at)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Back
          </Button>
          <Button onClick={() => onSubmit(`${date}T${time}:00`)} isLoading={busy} disabled={!date || !time}>
            <CalendarClock className="h-4 w-4" aria-hidden="true" /> Save new time
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
    </Modal>
  );
}
