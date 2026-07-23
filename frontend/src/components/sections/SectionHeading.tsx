import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

/** Consistent heading block for public page sections. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className="text-sm font-semibold uppercase tracking-wide text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h2>
      {subtitle && (
        <p className={cn("text-muted-foreground", align === "center" && "max-w-2xl")}>{subtitle}</p>
      )}
    </div>
  );
}
