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
