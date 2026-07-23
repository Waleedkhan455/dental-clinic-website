"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, CalendarPlus, LayoutDashboard, NotebookText, UserCog } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/patient", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/patient/appointments", label: "Appointments", icon: CalendarClock, exact: false },
  { href: "/patient/book", label: "Book", icon: CalendarPlus, exact: false },
  { href: "/patient/history", label: "Treatment history", icon: NotebookText, exact: false },
  { href: "/patient/profile", label: "Profile", icon: UserCog, exact: false },
] as const;

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Patient panel" className="border-b border-border">
        <ul className="-mb-px flex gap-1 overflow-x-auto">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div>{children}</div>
    </div>
  );
}
