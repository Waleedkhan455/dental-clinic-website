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

/** An appointment enriched by the API with doctor/service display names. */
export interface AppointmentDetail extends Appointment {
  doctor_name?: string | null;
  doctor_designation?: string | null;
  service_name?: string | null;
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

/** The signed-in patient's own appointments, enriched and soonest-first. */
export function getMyAppointments(token: string): Promise<AppointmentDetail[]> {
  return apiFetch<AppointmentDetail[]>("/api/appointments/mine", { token });
}

/** Cancel one of the patient's own pending/confirmed appointments. */
export function cancelAppointment(id: string, token: string): Promise<AppointmentDetail> {
  return apiFetch<AppointmentDetail>(`/api/appointments/${id}/cancel`, {
    method: "PATCH",
    token,
  });
}

// --- Doctor / admin ---------------------------------------------------------

export interface AppointmentStats {
  today: number;
  pending: number;
  upcoming_confirmed: number;
  total: number;
}

export interface AppointmentFilters {
  doctor_id?: string;
  status?: AppointmentStatus;
  day?: string; // YYYY-MM-DD (clinic-local)
}

export interface AppointmentUpdateInput {
  status?: AppointmentStatus;
  scheduled_at?: string;
  notes?: string;
}

/** All appointments (doctor/admin), optionally filtered. */
export function getAllAppointments(
  filters: AppointmentFilters,
  token: string,
): Promise<AppointmentDetail[]> {
  const params = new URLSearchParams();
  if (filters.doctor_id) params.set("doctor_id", filters.doctor_id);
  if (filters.status) params.set("status_filter", filters.status);
  if (filters.day) params.set("day", filters.day);
  const qs = params.toString();
  return apiFetch<AppointmentDetail[]>(`/api/appointments${qs ? `?${qs}` : ""}`, { token });
}

/** Headline counts for the doctor dashboard. */
export function getAppointmentStats(token: string): Promise<AppointmentStats> {
  return apiFetch<AppointmentStats>("/api/appointments/stats", { token });
}

/** Confirm/complete/cancel or reschedule an appointment (doctor/admin). */
export function updateAppointment(
  id: string,
  input: AppointmentUpdateInput,
  token: string,
): Promise<AppointmentDetail> {
  return apiFetch<AppointmentDetail>(`/api/appointments/${id}`, {
    method: "PATCH",
    body: input,
    token,
  });
}

/** Local calendar date as YYYY-MM-DD (clinic runs in PKT, matching the browser). */
function localDayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export interface DoctorDashboardData {
  stats: AppointmentStats;
  today: AppointmentDetail[];
  pending: AppointmentDetail[];
}

/** One-shot fetch for the doctor dashboard: counts, today's list, pending list. */
export async function getDoctorDashboard(token: string): Promise<DoctorDashboardData> {
  const [stats, today, pending] = await Promise.all([
    getAppointmentStats(token),
    getAllAppointments({ day: localDayISO() }, token),
    getAllAppointments({ status: "pending" }, token),
  ]);
  return { stats, today, pending };
}

/**
 * Split appointments into upcoming vs past.
 * Upcoming = still active (pending/confirmed) and not in the past.
 */
export function partitionAppointments(appointments: AppointmentDetail[]): {
  upcoming: AppointmentDetail[];
  past: AppointmentDetail[];
} {
  const now = Date.now();
  const upcoming: AppointmentDetail[] = [];
  const past: AppointmentDetail[] = [];
  for (const appt of appointments) {
    const isActive = appt.status === "pending" || appt.status === "confirmed";
    const isFuture = new Date(appt.scheduled_at).getTime() >= now;
    if (isActive && isFuture) {
      upcoming.push(appt);
    } else {
      past.push(appt);
    }
  }
  // Past list reads best most-recent-first (the API returns soonest-first).
  past.reverse();
  return { upcoming, past };
}
