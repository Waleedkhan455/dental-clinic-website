import { CalendarClock } from "lucide-react";

import type { Doctor } from "@/lib/api/public";
import { Card } from "@/components/ui/Card";

/** Initials from a doctor's name, ignoring a leading "Dr." title. */
function initialsOf(name: string): string {
  return name
    .replace(/^dr\.?\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card className="flex h-full flex-col p-6">
      <div className="flex items-center gap-4">
        {doctor.photo_url ? (
          <div
            className="h-16 w-16 shrink-0 rounded-full bg-neutral-100 bg-cover bg-center"
            style={{ backgroundImage: `url(${doctor.photo_url})` }}
            role="img"
            aria-label={doctor.name}
          />
        ) : (
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-foreground"
            aria-hidden="true"
          >
            {initialsOf(doctor.name)}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-foreground">{doctor.name}</h3>
          <p className="text-sm text-muted-foreground">{doctor.designation}</p>
        </div>
      </div>

      {doctor.qualifications.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {doctor.qualifications.map((qualification) => (
            <li
              key={qualification}
              className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700"
            >
              {qualification}
            </li>
          ))}
        </ul>
      )}

      {doctor.bio && <p className="mt-4 text-sm text-muted-foreground">{doctor.bio}</p>}

      <div className="mt-auto pt-4">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-sm font-medium text-accent-foreground">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          {doctor.availability.label}
        </span>
      </div>
    </Card>
  );
}
