import type { Metadata } from "next";
import { ImageIcon } from "lucide-react";

import { getGallery } from "@/lib/api/public";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { GalleryGrid } from "@/components/sections/GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos of Zimal Dental Clinic And Implant Center in Mansehra.",
};

export const revalidate = 30;

export default async function GalleryPage() {
  const images = await getGallery();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading eyebrow="Our clinic" title="Gallery" subtitle="A look inside our clinic." />

      {images.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-surface-muted p-12 text-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-muted-foreground">Clinic photos will be added here soon.</p>
        </div>
      ) : (
        <div className="mt-10">
          <GalleryGrid images={images} />
        </div>
      )}
    </div>
  );
}
