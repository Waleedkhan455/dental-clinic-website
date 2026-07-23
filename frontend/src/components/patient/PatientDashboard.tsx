"use client";

import Link from "next/link";
import { CalendarPlus, CalendarClock, NotebookText, UserCog, ArrowRight } from "lucide-react";

import { useAuth } from "@/lib/auth/AuthContext";
import { useAuthedResource } from "@/lib/hooks/useAuthedResource";
import { getMyAppointments, partitionAppointments } from "@/lib/api/appointments";
import { AppointmentCard } from "@/components/patient/AppointmentCard";
import { EmptyState, PanelError, PanelLoading } from "@/components/patient/PanelStates";
import { Card, CardContent } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";

const QUICK_LINKS = [
  {
    href: "/patient/book",
    label: "Book an appointment",
    description: "Choose a dentist and a time that suits you.",
    icon: CalendarPlus,
  },
  {
    href: "/patient/history",
    label: "Treatment history",
    description: "Review your past treatments and notes.",
    icon: NotebookText,
  },
  {
    href: "/patient/profile",
    label: "Profile",
    description: "Keep your name and phone number up to date.",
    icon: UserCog,
  },
] as const;

export function PatientDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAuthedResource(getMyAppointments);

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const upcoming = data ? partitionAppointments(data).upcoming : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {firstName}</h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your appointments and quick actions.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <CalendarClock className="h-5 w-5 text-primary" aria-hidden="true" />
            Upcoming appointments
          </h2>
          <Link
            href="/patient/appointments"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <PanelLoading />
        ) : error ? (
          <PanelError message={error} onRetry={reload} />
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={<CalendarClock className="h-8 w-8" />}
            title="No upcoming appointments"
            description="When you book an appointment it will appear here."
            action={
              <Link href="/patient/book" className={buttonVariants({ variant: "primary" })}>
                <CalendarPlus className="h-5 w-5" aria-hidden="true" />
                Book an appointment
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.slice(0, 3).map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {QUICK_LINKS.map(({ href, label, description, icon: Icon }) => (
            <Link key={href} href={href} className="group">
              <Card className="h-full transition-colors hover:border-primary">
                <CardContent className="flex h-full flex-col gap-2 p-5">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <p className="font-semibold text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
