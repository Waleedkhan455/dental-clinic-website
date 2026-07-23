import type { Metadata } from "next";

import { AppointmentsAdmin } from "@/components/doctor/AppointmentsAdmin";

export const metadata: Metadata = { title: "Manage Appointments" };

export default function DoctorAppointmentsPage() {
  return <AppointmentsAdmin />;
}
