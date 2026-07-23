import type { Metadata } from "next";

import { PatientHistory } from "@/components/patient/PatientHistory";

export const metadata: Metadata = { title: "Treatment History" };

export default function PatientHistoryPage() {
  return <PatientHistory />;
}
