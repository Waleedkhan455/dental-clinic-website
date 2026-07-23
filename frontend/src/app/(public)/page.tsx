import Link from "next/link";
import { CalendarPlus, Stethoscope, ShieldCheck, Award } from "lucide-react";

import { buttonVariants } from "@/components/ui/Button";
import { ConnectionStatus } from "@/components/system/ConnectionStatus";
import { siteConfig } from "@/config/site";

const specialties = [
  {
    icon: Stethoscope,
    title: "Dental Implants",
    description: "Long-lasting titanium implants to restore missing teeth.",
  },
  {
    icon: Award,
    title: "Prosthodontics",
    description: "Crowns, bridges, and dentures crafted for form and function.",
  },
  {
    icon: ShieldCheck,
    title: "Orthodontics",
    description: "Braces and aligners to correct alignment and bite.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface-muted">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
              {siteConfig.location.city}, {siteConfig.location.country}
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Comprehensive dental care you can trust
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              {siteConfig.name} provides expert treatment from clinicians and faculty affiliated
              with Ayub Medical College — specialising in dental implants, prosthodontics, and
              orthodontics.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/book" className={buttonVariants({ variant: "primary", size: "lg" })}>
                <CalendarPlus className="h-5 w-5" aria-hidden="true" />
                Book an Appointment
              </Link>
              <Link href="/services" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {specialties.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-accent">
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Build status — temporary Phase 1 aid confirming the frontend reaches the API */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-lg border border-dashed border-border bg-surface-muted p-6">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            Project setup status (Phase 1)
          </p>
          <div className="max-w-md">
            <ConnectionStatus />
          </div>
        </div>
      </section>
    </>
  );
}
