"use client";

import Link from "next/link";
import {
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Clock,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "@/lib/auth/AuthContext";
import { useAuthedResource } from "@/lib/hooks/useAuthedResource";
import { getDoctorDashboard, type AppointmentDetail } from "@/lib/api/appointments";
import { AppointmentStatusBadge } from "@/components/patient/AppointmentStatusBadge";
import { EmptyState, PanelError, PanelLoading } from "@/components/patient/PanelStates";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/format";

const STAT_CARDS = [
  { key: "today", label: "Today", icon: CalendarDays },
  { key: "pending", label: "Pending requests", icon: Clock },
  { key: "upcoming_confirmed", label: "Upcoming confirmed", icon: CalendarClock },
  { key: "total", label: "Total appointments", icon: ClipboardList },
] as const;

export function DoctorDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAuthedResource(getDoctorDashboard);

  const firstName = user?.name?.split(" ").slice(-1)[0] ?? "Doctor";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, Dr. {firstName}</h1>
        <p className="mt-1 text-muted-foreground">
          Today&apos;s schedule, pending requests, and clinic activity at a glance.
        </p>
      </div>

      {loading ? (
        <PanelLoading />
      ) : error ? (
        <PanelError message={error} onRetry={reload} />
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STAT_CARDS.map(({ key, label, icon: Icon }) => (
              <Card key={key}>
                <CardContent className="flex flex-col gap-1 p-5">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="mt-1 text-3xl font-bold text-foreground">{data.stats[key]}</span>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <ListSection
            title="Today's appointments"
            icon={<CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />}
            items={data.today}
            emptyText="No appointments scheduled for today."
          />

          <ListSection
            title="Pending requests"
            icon={<Clock className="h-5 w-5 text-warning" aria-hidden="true" />}
            items={data.pending}
            emptyText="No pending requests — you're all caught up."
            manageHint
          />
        </>
      ) : null}
    </div>
  );
}

function ListSection({
  title,
  icon,
  items,
  emptyText,
  manageHint = false,
}: {
  title: string;
  icon: React.ReactNode;
  items: AppointmentDetail[];
  emptyText: string;
  manageHint?: boolean;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          {icon}
          {title}
        </h2>
        <Link
          href="/doctor/appointments"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Manage
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<CalendarClock className="h-8 w-8" />} title={emptyText} />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((appt) => (
            <Card key={appt.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-foreground">{appt.patient_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(appt.scheduled_at)}
                    {appt.doctor_name ? ` · ${appt.doctor_name}` : ""}
                    {appt.service_name ? ` · ${appt.service_name}` : ""}
                  </p>
                </div>
                <AppointmentStatusBadge status={appt.status} />
              </CardContent>
            </Card>
          ))}
          {manageHint && items.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Open <span className="font-medium">Appointments</span> to confirm, reschedule, or
              cancel requests.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
