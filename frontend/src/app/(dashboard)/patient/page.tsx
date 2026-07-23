import type { Metadata } from "next";

import { PatientDashboard } from "@/components/patient/PatientDashboard";

export const metadata: Metadata = { title: "My Dashboard" };

export default function PatientDashboardPage() {
  return <PatientDashboard />;
}
