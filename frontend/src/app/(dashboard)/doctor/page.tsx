import type { Metadata } from "next";

import { DoctorDashboard } from "@/components/doctor/DoctorDashboard";

export const metadata: Metadata = { title: "Doctor Panel" };

export default function DoctorDashboardPage() {
  return <DoctorDashboard />;
}
