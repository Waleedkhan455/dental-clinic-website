import type { Metadata } from "next";

import { TestimonialsAdmin } from "@/components/doctor/TestimonialsAdmin";

export const metadata: Metadata = { title: "Manage Testimonials" };

export default function DoctorTestimonialsPage() {
  return <TestimonialsAdmin />;
}
