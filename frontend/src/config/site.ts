/**
 * Central site configuration.
 *
 * Clinic identity, navigation, and contact details live here so branding stays
 * consistent across the header, footer, metadata, and contact points. Content
 * owned by the doctor panel (services, team, testimonials, gallery) is NOT here
 * — that is loaded dynamically from the API.
 */

export const siteConfig = {
  name: "Zimal Dental Clinic And Implant Center",
  shortName: "Zimal Dental",
  tagline: "Comprehensive dental care in Mansehra",
  description:
    "Comprehensive dental care by experienced clinicians and faculty affiliated with Ayub Medical College — specialising in Dental Implants, Prosthodontics, and Orthodontics.",
  location: {
    city: "Mansehra",
    country: "Pakistan",
    addressLine: "Mansehra, Khyber Pakhtunkhwa, Pakistan",
  },
  contact: {
    // Placeholder values — update with the clinic's real details.
    phone: "+92 300 0000000",
    whatsapp: "+92 300 0000000",
    email: "info@zimaldental.com",
  },
} as const;

/** Logical display order for service categories on the Services page. */
export const serviceCategoryOrder = [
  "General Dentistry",
  "Restorative & Prosthodontics",
  "Orthodontics",
  "Cosmetic Dentistry",
  "Pediatric Dentistry",
] as const;

/** Clinic opening hours shown on the Contact page. */
export const clinicHours = [
  { day: "Monday – Saturday", hours: "10:00 AM – 8:00 PM" },
  { day: "Friday", hours: "Implant & Prosthodontics clinic (Dr. Safa Nawaz)" },
  { day: "Sunday", hours: "Closed" },
] as const;

/** Primary navigation shown in the public header. */
export const mainNavLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Our Team", href: "/team" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * Build a `wa.me` link from a phone number (strips non-digits).
 * Example: "+92 300 1234567" -> "https://wa.me/923001234567".
 */
export function whatsappLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
