import { MapPin, Phone, Mail, MessageCircle, Clock } from "lucide-react";

import { siteConfig, clinicHours, whatsappLink } from "@/config/site";
import { buttonVariants } from "@/components/ui/Button";

const telHref = `tel:${siteConfig.contact.phone.replace(/\s/g, "")}`;
const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
  `${siteConfig.location.city}, ${siteConfig.location.country}`,
)}&output=embed`;

/** Contact details, opening hours, quick actions, and an embedded map. */
export function ContactSection() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <ul className="flex flex-col gap-4">
          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="font-medium text-foreground">Location</p>
              <p className="text-sm text-muted-foreground">{siteConfig.location.addressLine}</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="font-medium text-foreground">Phone</p>
              <a href={telHref} className="text-sm text-muted-foreground hover:text-primary">
                {siteConfig.contact.phone}
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="font-medium text-foreground">Email</p>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {siteConfig.contact.email}
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="font-medium text-foreground">Opening hours</p>
              <ul className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
                {clinicHours.map((entry) => (
                  <li key={entry.day} className="flex flex-wrap gap-x-2">
                    <span className="font-medium text-foreground">{entry.day}:</span>
                    <span>{entry.hours}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        </ul>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappLink(
              siteConfig.contact.whatsapp,
              "Hello, I would like to book a dental appointment.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Book on WhatsApp
          </a>
          <a href={telHref} className={buttonVariants({ variant: "outline", size: "md" })}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call the clinic
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <iframe
          title={`Map showing ${siteConfig.name} in ${siteConfig.location.city}`}
          src={mapSrc}
          className="h-full min-h-[320px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
