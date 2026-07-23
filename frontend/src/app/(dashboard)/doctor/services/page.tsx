import type { Metadata } from "next";

import { ServicesAdmin } from "@/components/doctor/ServicesAdmin";

export const metadata: Metadata = { title: "Manage Services" };

export default function DoctorServicesPage() {
  return <ServicesAdmin />;
}
