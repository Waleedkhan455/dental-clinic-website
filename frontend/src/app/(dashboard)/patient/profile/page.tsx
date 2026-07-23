import type { Metadata } from "next";

import { PatientProfile } from "@/components/patient/PatientProfile";

export const metadata: Metadata = { title: "My Profile" };

export default function PatientProfilePage() {
  return <PatientProfile />;
}
