import type { Metadata } from "next";

import { getDoctors } from "@/lib/api/public";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { DoctorCard } from "@/components/sections/DoctorCard";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the dentists at Zimal Dental Clinic — experienced clinicians and faculty affiliated with Ayub Medical College, with their qualifications and availability.",
};

export const revalidate = 30;

export default async function TeamPage() {
  const doctors = await getDoctors();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Our team"
        title="Meet our dentists"
        subtitle="Experienced clinicians and faculty members affiliated with Ayub Medical College. Availability is shown on each profile and enforced when you book."
      />

      {doctors.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-border bg-surface-muted p-8 text-center text-muted-foreground">
          Team profiles are being updated. Please check back soon.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}
