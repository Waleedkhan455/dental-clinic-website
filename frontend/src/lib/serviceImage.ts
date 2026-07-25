import type { Service } from "@/lib/api/public";

/**
 * A relevant image for a service: the uploaded image if set, otherwise a
 * category-appropriate default so every service page shows a fitting photo.
 */
const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=65`;

const CATEGORY_IMAGES: Record<string, string> = {
  "General Dentistry": IMG("1629909615184-74f495363b67"),
  "Restorative & Prosthodontics": IMG("1609840114035-3c981b782dfe"),
  Orthodontics: IMG("1606811841689-23dfddce3e95"),
  "Cosmetic Dentistry": IMG("1588776814546-1ffcf47267a5"),
  "Pediatric Dentistry": IMG("1629909615184-74f495363b67"),
};

const DEFAULT_IMAGE = IMG("1629909615184-74f495363b67");

export function serviceImage(service: Pick<Service, "image_url" | "category">): string {
  return service.image_url || CATEGORY_IMAGES[service.category] || DEFAULT_IMAGE;
}
