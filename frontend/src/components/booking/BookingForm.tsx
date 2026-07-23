"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus, CheckCircle2, Info } from "lucide-react";

import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import { createAppointment } from "@/lib/api/appointments";
import type { AuthUser } from "@/lib/api/auth";
import type { Doctor, Service } from "@/lib/api/public";
import { Input } from "@/components/ui/Input";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface BookingFormProps {
  doctors: Doctor[];
  services: Service[];
}

/** Convert a JS getDay() (Sun=0) to Python weekday() (Mon=0), matching the API. */
function toPythonWeekday(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function localTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function BookingForm({ doctors, services }: BookingFormProps) {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }
  if (!user || !token) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-3 p-6">
          <p className="text-muted-foreground">Please sign in to book an appointment.</p>
          <Link href="/login?next=/book" className={buttonVariants({ variant: "primary" })}>
            Sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <BookingFormFields user={user} token={token} doctors={doctors} services={services} />
  );
}

interface FieldsProps extends BookingFormProps {
  user: AuthUser;
  token: string;
}

function BookingFormFields({ user, token, doctors, services }: FieldsProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [doctorId, setDoctorId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ doctorName: string; when: string } | null>(
    null,
  );

  const selectedDoctor = doctors.find((doctor) => doctor.id === doctorId);

  const doctorOptions: SelectOption[] = doctors.map((doctor) => ({
    label: `${doctor.name} — ${doctor.designation}`,
    value: doctor.id,
  }));

  const serviceOptions: SelectOption[] = [
    { label: "Not sure / general consultation", value: "" },
    ...services.map((service) => ({ label: service.name, value: service.id })),
  ];

  function validate(scheduledAt: string): string | null {
    const when = new Date(scheduledAt);
    if (Number.isNaN(when.getTime())) return "Please choose a valid date and time.";
    if (when.getTime() <= Date.now()) return "Please choose a future date and time.";

    if (selectedDoctor?.availability.type === "specific_days") {
      const weekday = toPythonWeekday(new Date(`${date}T00:00:00`).getDay());
      if (!selectedDoctor.availability.weekdays.includes(weekday)) {
        const allowed = selectedDoctor.availability.weekdays
          .map((day) => WEEKDAY_LABELS[day])
          .join(", ");
        return `${selectedDoctor.name} is available on ${allowed} only. Please choose one of those days.`;
      }
    }
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!doctorId) {
      setError("Please select a doctor.");
      return;
    }
    const scheduledAt = `${date}T${time}:00`;
    const validationError = validate(scheduledAt);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await createAppointment(
        {
          patient_name: name,
          patient_phone: phone,
          doctor_id: doctorId,
          service_id: serviceId || null,
          scheduled_at: scheduledAt,
          notes: notes || undefined,
        },
        token,
      );
      const when = new Date(scheduledAt).toLocaleString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      setConfirmation({ doctorName: selectedDoctor?.name ?? "your dentist", when });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not book the appointment. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setDoctorId("");
    setServiceId("");
    setDate("");
    setTime("");
    setNotes("");
    setError(null);
    setConfirmation(null);
  }

  if (confirmation) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-4 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Appointment requested</h2>
              <p className="text-sm text-muted-foreground">
                Your request is <strong>pending confirmation</strong> from the clinic.
              </p>
            </div>
          </div>
          <dl className="w-full border-t border-border pt-4 text-sm">
            <div className="flex justify-between gap-4 py-1">
              <dt className="text-muted-foreground">Dentist</dt>
              <dd className="font-medium text-foreground">{confirmation.doctorName}</dd>
            </div>
            <div className="flex justify-between gap-4 py-1">
              <dt className="text-muted-foreground">When</dt>
              <dd className="font-medium text-foreground">{confirmation.when}</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/patient/appointments"
              className={buttonVariants({ variant: "primary" })}
            >
              View my appointments
            </Link>
            <Button variant="secondary" onClick={resetForm}>
              Book another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive bg-destructive-surface px-3 py-2 text-sm text-foreground"
            >
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            <Input
              label="Phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="03xx xxxxxxx"
            />
          </div>

          <Select
            label="Service"
            options={serviceOptions}
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            helperText="Optional — choose the treatment you're interested in."
          />

          <Select
            label="Preferred dentist"
            required
            placeholder="Select a dentist"
            options={doctorOptions}
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          />

          {selectedDoctor && (
            <p className="flex items-start gap-2 rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {selectedDoctor.name} is available:{" "}
                <strong>{selectedDoctor.availability.label}</strong>.
              </span>
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Date"
              type="date"
              required
              min={localTodayISO()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label="Time"
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <Textarea
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            helperText="Optional — anything the dentist should know."
            placeholder="e.g. tooth pain on the lower right side"
          />

          <Button type="submit" size="lg" isLoading={submitting} className="w-full sm:w-auto">
            <CalendarPlus className="h-5 w-5" aria-hidden="true" />
            Request appointment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
