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
  // Public base URL — set NEXT_PUBLIC_SITE_URL in production for correct
  // canonical links, Open Graph URLs, sitemap, and robots.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  location: {
    city: "Mansehra",
    country: "Pakistan",
    region: "Khyber Pakhtunkhwa",
    addressLine: "Siran Arcade, Upper Chanai, Mansehra 21300, Khyber Pakhtunkhwa, Pakistan",
    // Approximate town-centre coordinates for local-business structured data.
    geo: { latitude: 34.333, longitude: 73.2 },
    // The clinic's Google Maps listing (opens the exact location / directions).
    mapUrl: "https://maps.app.goo.gl/jt9wiYM6i8WUgCCy6?g_st=iw",
  },
  contact: {
    // Local: 0347 913 2302 — stored in international form so the tel: link and
    // WhatsApp (wa.me needs the country code, no leading 0) both work.
    phone: "+92 347 913 2302",
    whatsapp: "+92 347 913 2302",
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
