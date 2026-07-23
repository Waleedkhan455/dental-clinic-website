import { siteConfig } from "@/config/site";

/**
 * schema.org structured data describing the clinic as a local Dentist business.
 * Rendered as JSON-LD so search engines (and Google's local results) can show
 * the clinic's name, location, hours, and contact details for Mansehra.
 */
export function clinicJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "@id": `${siteConfig.url}/#clinic`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    hasMap: siteConfig.location.mapUrl,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.location.addressLine,
      addressLocality: siteConfig.location.city,
      addressRegion: siteConfig.location.region,
      addressCountry: "PK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.location.geo.latitude,
      longitude: siteConfig.location.geo.longitude,
    },
    areaServed: { "@type": "City", name: siteConfig.location.city },
    medicalSpecialty: ["Dentistry", "Prosthodontics", "Orthodontics"],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:00",
        closes: "20:00",
      },
    ],
  };
}
