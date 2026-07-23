import type { Metadata } from "next";

import { PatientAppointments } from "@/components/patient/PatientAppointments";

export const metadata: Metadata = { title: "My Appointments" };

export default function PatientAppointmentsPage() {
  return <PatientAppointments />;
}
