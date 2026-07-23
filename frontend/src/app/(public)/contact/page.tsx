import type { Metadata } from "next";

import { SectionHeading } from "@/components/sections/SectionHeading";
import { ContactSection } from "@/components/sections/ContactSection";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${siteConfig.name} in ${siteConfig.location.city} — location, phone, WhatsApp, and opening hours.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Get in touch"
        title="Contact & location"
        subtitle="Visit us in Mansehra, or reach out by phone or WhatsApp to book your appointment."
      />
      <div className="mt-10">
        <ContactSection />
      </div>
    </div>
  );
}
