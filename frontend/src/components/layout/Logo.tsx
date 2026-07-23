import Link from "next/link";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface LogoProps {
  /** Show the wordmark next to the icon. */
  withText?: boolean;
  className?: string;
}

/** Brand logo: a solid blue tile with a tooth glyph plus the clinic wordmark. */
export function Logo({ withText = true, className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      aria-label={`${siteConfig.name} — home`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary">
        <ToothGlyph className="h-6 w-6 text-primary-foreground" />
      </span>
      {withText && (
        <span className="flex flex-col leading-tight">
          <span className="font-heading text-base font-bold text-foreground">Zimal Dental</span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            &amp; Implant Center
          </span>
        </span>
      )}
    </Link>
  );
}

function ToothGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 6.2C10.4 4.5 8 3.9 6.4 4.9 4.8 5.9 4.3 8.2 4.8 10.4c.35 1.5.5 2.6.8 4.2.25 1.4.45 2.9 1 4.1.3.7.95 1.05 1.5.75.5-.28.7-1.1.95-2 .3-1.15.5-2.5 1.2-3.05.45-.35 1.05-.35 1.5 0 .7.55.9 1.9 1.2 3.05.25.9.45 1.72.95 2 .55.3 1.2-.05 1.5-.75.55-1.2.75-2.7 1-4.1.3-1.6.45-2.7.8-4.2.5-2.2 0-4.5-1.6-5.5C16 3.9 13.6 4.5 12 6.2Z" />
    </svg>
  );
}
