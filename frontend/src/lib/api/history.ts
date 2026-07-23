/** Typed treatment-history API calls (patient side — read-only). */

import { apiFetch } from "./client";

export interface HistoryRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string | null;
  treatment: string;
  notes?: string | null;
  attachments: string[];
  doctor_name?: string | null;
  doctor_designation?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/** The signed-in patient's own treatment history, most recent first. */
export function getMyHistory(token: string): Promise<HistoryRecord[]> {
  return apiFetch<HistoryRecord[]>("/api/history/mine", { token });
}

// --- Doctor / admin ---------------------------------------------------------

/** History record as seen by the doctor panel (adds patient identity). */
export interface HistoryAdminRecord extends HistoryRecord {
  patient_name?: string | null;
  patient_phone?: string | null;
}

export interface HistoryInput {
  patient_id: string;
  doctor_id: string;
  appointment_id?: string | null;
  treatment: string;
  notes?: string | null;
  attachments?: string[];
}

/** All treatment records, optionally for one patient (doctor/admin). */
export function getAllHistory(
  token: string,
  patientId?: string,
): Promise<HistoryAdminRecord[]> {
  const qs = patientId ? `?patient_id=${encodeURIComponent(patientId)}` : "";
  return apiFetch<HistoryAdminRecord[]>(`/api/history${qs}`, { token });
}

export function createHistory(input: HistoryInput, token: string): Promise<HistoryAdminRecord> {
  return apiFetch<HistoryAdminRecord>("/api/history", { method: "POST", body: input, token });
}

export function updateHistory(
  id: string,
  input: Partial<HistoryInput>,
  token: string,
): Promise<HistoryAdminRecord> {
  return apiFetch<HistoryAdminRecord>(`/api/history/${id}`, {
    method: "PATCH",
    body: input,
    token,
  });
}

export function deleteHistory(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/api/history/${id}`, { method: "DELETE", token });
}
