import type { Metadata } from "next";
import { Phone, MessageCircle } from "lucide-react";

import { SectionHeading } from "@/components/sections/SectionHeading";
import { buttonVariants } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { siteConfig, whatsappLink } from "@/config/site";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description: `Book a dental appointment at ${siteConfig.name} in ${siteConfig.location.city}.`,
};

// NOTE: The full online booking form (doctor selection + availability rules)
// is built in Phase 5. This interim page lets patients book via WhatsApp/phone.
export default function BookPage() {
  const telHref = `tel:${siteConfig.contact.phone.replace(/\s/g, "")}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Appointments"
        title="Book an appointment"
        subtitle="Online booking with doctor selection is arriving shortly. In the meantime, reach us directly and we'll confirm your slot."
      />

      <Card className="mt-8">
        <CardContent className="flex flex-col gap-3 p-6 sm:flex-row">
          <a
            href={whatsappLink(
              siteConfig.contact.whatsapp,
              "Hello, I would like to book a dental appointment.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "primary", size: "lg", className: "w-full" })}
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Book on WhatsApp
          </a>
          <a
            href={telHref}
            className={buttonVariants({ variant: "outline", size: "lg", className: "w-full" })}
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            Call the clinic
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
