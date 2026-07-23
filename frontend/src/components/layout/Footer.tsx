import Link from "next/link";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";

import { mainNavLinks, siteConfig, whatsappLink } from "@/config/site";
import { Logo } from "@/components/layout/Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface-muted">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        {/* Brand + summary */}
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">{siteConfig.description}</p>
        </div>

        {/* Quick links */}
        <nav aria-label="Footer" className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Explore</h2>
          <ul className="flex flex-col gap-2">
            {mainNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/book"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Book Appointment
              </Link>
            </li>
          </ul>
        </nav>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Contact</h2>
          <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a
                href={siteConfig.location.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                {siteConfig.location.addressLine}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`} className="hover:text-primary">
                {siteConfig.contact.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-primary">
                {siteConfig.contact.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MessageCircle className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a
                href={whatsappLink(siteConfig.contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                WhatsApp us
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
