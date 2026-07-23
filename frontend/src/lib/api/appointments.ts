/** Typed appointment API calls. */

import { apiFetch } from "./client";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  patient_id?: string | null;
  patient_name: string;
  patient_phone: string;
  doctor_id: string;
  service_id?: string | null;
  scheduled_at: string;
  status: AppointmentStatus;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BookingInput {
  patient_name: string;
  patient_phone: string;
  doctor_id: string;
  service_id?: string | null;
  /** Clinic-local datetime, e.g. "2026-07-24T11:00:00". */
  scheduled_at: string;
  notes?: string;
}

/** Book an appointment (requires a patient's bearer token). */
export function createAppointment(input: BookingInput, token: string): Promise<Appointment> {
  return apiFetch<Appointment>("/api/appointments", { method: "POST", body: input, token });
}
