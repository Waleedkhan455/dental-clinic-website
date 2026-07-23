import type { Metadata } from "next";

import { TeamAdmin } from "@/components/doctor/TeamAdmin";

export const metadata: Metadata = { title: "Manage Team" };

export default function DoctorTeamPage() {
  return <TeamAdmin />;
}
