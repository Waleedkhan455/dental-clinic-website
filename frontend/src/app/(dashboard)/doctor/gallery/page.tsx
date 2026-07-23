import type { Metadata } from "next";

import { GalleryAdmin } from "@/components/doctor/GalleryAdmin";

export const metadata: Metadata = { title: "Manage Gallery" };

export default function DoctorGalleryPage() {
  return <GalleryAdmin />;
}
