import type { Metadata } from "next";

import { SectionHeading } from "@/components/sections/SectionHeading";
import { BookingForm } from "@/components/booking/BookingForm";
import { getDoctors, getServices } from "@/lib/api/public";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description: `Book a dental appointment at ${siteConfig.name} in ${siteConfig.location.city}.`,
};

export const revalidate = 30;

// Access is restricted to authenticated patients by the proxy (see src/proxy.ts).
export default async function BookPage() {
  const [doctors, services] = await Promise.all([getDoctors(), getServices()]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Appointments"
        title="Book an appointment"
        subtitle="Choose your preferred dentist and a time that suits you. Your request is confirmed by the clinic before it's finalised."
      />
      <div className="mt-8">
        <BookingForm doctors={doctors} services={services} />
      </div>
    </div>
  );
}
