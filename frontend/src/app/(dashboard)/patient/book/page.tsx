import type { Metadata } from "next";

import { BookingForm } from "@/components/booking/BookingForm";
import { getDoctors, getServices } from "@/lib/api/public";

export const metadata: Metadata = { title: "Book an Appointment" };

export const dynamic = "force-dynamic";

export default async function PatientBookPage() {
  const [doctors, services] = await Promise.all([getDoctors(), getServices()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Book an appointment</h1>
        <p className="mt-1 text-muted-foreground">
          Choose your preferred dentist and a time that suits you. Your request is confirmed by the
          clinic before it&apos;s finalised.
        </p>
      </div>
      <div className="max-w-2xl">
        <BookingForm doctors={doctors} services={services} />
      </div>
    </div>
  );
}
