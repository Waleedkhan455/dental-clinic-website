import type { Metadata } from "next";

import { HistoryAdmin } from "@/components/doctor/HistoryAdmin";

export const metadata: Metadata = { title: "Patient History" };

export default function DoctorHistoryPage() {
  return <HistoryAdmin />;
}
