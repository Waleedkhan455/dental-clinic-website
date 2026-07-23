/** Doctor/admin CRUD calls for services, team, testimonials, gallery, patients. */

import { apiFetch } from "./client";
import type { AuthUser } from "./auth";
import type { Availability, Doctor, GalleryImage, Service, Testimonial } from "./public";

// --- Patients ---------------------------------------------------------------

/** Patient accounts (for selecting a patient when adding history). */
export function getPatients(token: string): Promise<AuthUser[]> {
  return apiFetch<AuthUser[]>("/api/patients", { token });
}

// --- Services ---------------------------------------------------------------

export interface ServiceInput {
  name: string;
  category: string;
  description: string;
  visits_text: string;
  image_url?: string | null;
  is_active?: boolean;
}

export function getServicesAdmin(token: string): Promise<Service[]> {
  return apiFetch<Service[]>("/api/services/manage", { token });
}

export function createService(input: ServiceInput, token: string): Promise<Service> {
  return apiFetch<Service>("/api/services", { method: "POST", body: input, token });
}

export function updateService(
  id: string,
  input: Partial<ServiceInput>,
  token: string,
): Promise<Service> {
  return apiFetch<Service>(`/api/services/${id}`, { method: "PATCH", body: input, token });
}

export function deleteService(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/api/services/${id}`, { method: "DELETE", token });
}

// --- Team (doctors) ---------------------------------------------------------

export interface DoctorInput {
  name: string;
  designation: string;
  qualifications: string[];
  bio?: string | null;
  photo_url?: string | null;
  availability: Availability;
  is_active?: boolean;
}

export function getDoctorsAdmin(token: string): Promise<Doctor[]> {
  return apiFetch<Doctor[]>("/api/doctors/manage", { token });
}

export function createDoctor(input: DoctorInput, token: string): Promise<Doctor> {
  return apiFetch<Doctor>("/api/doctors", { method: "POST", body: input, token });
}

export function updateDoctor(
  id: string,
  input: Partial<DoctorInput>,
  token: string,
): Promise<Doctor> {
  return apiFetch<Doctor>(`/api/doctors/${id}`, { method: "PATCH", body: input, token });
}

export function deleteDoctor(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/api/doctors/${id}`, { method: "DELETE", token });
}

// --- Testimonials -----------------------------------------------------------

export interface TestimonialInput {
  patient_name: string;
  message: string;
  rating: number;
  is_published?: boolean;
}

export function getTestimonialsAdmin(token: string): Promise<Testimonial[]> {
  return apiFetch<Testimonial[]>("/api/testimonials/manage", { token });
}

export function createTestimonial(input: TestimonialInput, token: string): Promise<Testimonial> {
  return apiFetch<Testimonial>("/api/testimonials", { method: "POST", body: input, token });
}

export function updateTestimonial(
  id: string,
  input: Partial<TestimonialInput>,
  token: string,
): Promise<Testimonial> {
  return apiFetch<Testimonial>(`/api/testimonials/${id}`, { method: "PATCH", body: input, token });
}

export function deleteTestimonial(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/api/testimonials/${id}`, { method: "DELETE", token });
}

// --- Gallery ----------------------------------------------------------------

export interface GalleryInput {
  image_url: string;
  caption?: string | null;
  sort_order?: number;
}

/** Gallery is public-readable; the admin list reuses the same endpoint. */
export function getGalleryAdmin(token: string): Promise<GalleryImage[]> {
  return apiFetch<GalleryImage[]>("/api/gallery", { token });
}

export function createGalleryImage(input: GalleryInput, token: string): Promise<GalleryImage> {
  return apiFetch<GalleryImage>("/api/gallery", { method: "POST", body: input, token });
}

export function updateGalleryImage(
  id: string,
  input: Partial<GalleryInput>,
  token: string,
): Promise<GalleryImage> {
  return apiFetch<GalleryImage>(`/api/gallery/${id}`, { method: "PATCH", body: input, token });
}

export function deleteGalleryImage(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/api/gallery/${id}`, { method: "DELETE", token });
}
