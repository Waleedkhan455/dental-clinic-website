/**
 * Server-side data fetchers for the public website.
 *
 * These run in React Server Components. Reads are cached and revalidated in the
 * background (stale-while-revalidate) so pages serve instantly without a
 * database round-trip on every request; doctor-panel edits appear within
 * ~{@link REVALIDATE_SECONDS}s. List fetchers degrade to an empty array on
 * failure so a transient API issue never crashes the whole page.
 */

import { cache } from "react";

import { apiFetch } from "./client";

export type AvailabilityType = "specific_days" | "by_appointment" | "regular_hours";

export interface Availability {
  type: AvailabilityType;
  weekdays: number[];
  label: string;
}

export interface Doctor {
  id: string;
  name: string;
  designation: string;
  qualifications: string[];
  bio?: string | null;
  photo_url?: string | null;
  availability: Availability;
  is_active: boolean;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  visits_text: string;
  image_url?: string | null;
  is_active: boolean;
}

export interface Testimonial {
  id: string;
  patient_name: string;
  message: string;
  rating: number;
  is_published: boolean;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption?: string | null;
  sort_order: number;
}

export const REVALIDATE_SECONDS = 30;
const CACHED = { next: { revalidate: REVALIDATE_SECONDS } } as const;

export async function getDoctors(): Promise<Doctor[]> {
  try {
    return await apiFetch<Doctor[]>("/api/doctors", CACHED);
  } catch (error) {
    console.error("Failed to load doctors:", error);
    return [];
  }
}

export async function getServices(): Promise<Service[]> {
  try {
    return await apiFetch<Service[]>("/api/services", CACHED);
  } catch (error) {
    console.error("Failed to load services:", error);
    return [];
  }
}

// Cached per request so the detail page's generateMetadata and the page body
// share a single fetch.
export const getServiceBySlug = cache(async (slug: string): Promise<Service | null> => {
  try {
    return await apiFetch<Service>(`/api/services/${encodeURIComponent(slug)}`, CACHED);
  } catch {
    return null;
  }
});

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    return await apiFetch<Testimonial[]>("/api/testimonials", CACHED);
  } catch (error) {
    console.error("Failed to load testimonials:", error);
    return [];
  }
}

export async function getGallery(): Promise<GalleryImage[]> {
  try {
    return await apiFetch<GalleryImage[]>("/api/gallery", CACHED);
  } catch (error) {
    console.error("Failed to load gallery:", error);
    return [];
  }
}

/** Group services by category, preserving a sensible category order. */
export function groupServicesByCategory(
  services: Service[],
  categoryOrder: readonly string[],
): { category: string; services: Service[] }[] {
  const groups = new Map<string, Service[]>();
  for (const service of services) {
    const list = groups.get(service.category) ?? [];
    list.push(service);
    groups.set(service.category, list);
  }
  const orderedKeys = [
    ...categoryOrder.filter((category) => groups.has(category)),
    ...[...groups.keys()].filter((category) => !categoryOrder.includes(category)),
  ];
  return orderedKeys.map((category) => ({ category, services: groups.get(category)! }));
}
