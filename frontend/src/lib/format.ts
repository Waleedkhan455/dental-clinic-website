/** Small display formatters shared across the panels.
 *
 * The API stores and returns appointment times in **UTC** (ISO strings without a
 * timezone suffix). The clinic operates in Pakistan (PKT, UTC+5), so all times
 * are parsed as UTC and rendered in Asia/Karachi — this keeps the patient and
 * doctor panels in agreement regardless of the viewer's own timezone.
 */

const CLINIC_TZ = "Asia/Karachi";

/** Parse an API datetime. A string with no timezone designator is treated as UTC. */
function parseApiDate(value: string): Date {
  const hasTz = /([zZ])|([+-]\d{2}:?\d{2})$/.test(value.trim());
  return new Date(hasTz ? value : `${value}Z`);
}

/** e.g. "Friday, 25 July 2026 at 11:00 AM" (clinic time). */
export function formatDateTime(value: string): string {
  const date = parseApiDate(value);
  if (Number.isNaN(date.getTime())) return value;
  return date
    .toLocaleString("en-GB", {
      timeZone: CLINIC_TZ,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
}

/** e.g. "25 July 2026" (clinic time). */
export function formatDate(value: string): string {
  const date = parseApiDate(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    timeZone: CLINIC_TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Clinic-local (PKT) date + time parts for prefilling `<input type="date">` and
 * `<input type="time">` (e.g. the reschedule form), independent of the browser's
 * own timezone.
 */
export function clinicDateTimeParts(value: string): { date: string; time: string } {
  const d = parseApiDate(value);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  // en-CA renders the date as YYYY-MM-DD, which is what date inputs expect.
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: CLINIC_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return { date, time };
}
