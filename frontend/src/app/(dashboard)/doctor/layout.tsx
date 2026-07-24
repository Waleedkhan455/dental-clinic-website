"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  Images,
  LayoutDashboard,
  MessageSquareQuote,
  NotebookText,
  Stethoscope,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/doctor", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/doctor/appointments", label: "Appointments", icon: CalendarClock, exact: false },
  { href: "/doctor/history", label: "Patient history", icon: NotebookText, exact: false },
  { href: "/doctor/services", label: "Services", icon: Stethoscope, exact: false },
  { href: "/doctor/team", label: "Team", icon: Users, exact: false },
  { href: "/doctor/testimonials", label: "Testimonials", icon: MessageSquareQuote, exact: false },
  { href: "/doctor/gallery", label: "Gallery", icon: Images, exact: false },
] as const;

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Doctor panel" className="border-b border-border">
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
      {/* min-w-0 lets wide tables scroll inside their own overflow container
          instead of pushing the panel past the viewport. */}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
