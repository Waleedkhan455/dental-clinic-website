import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "destructive";

// Flat, solid surfaces only — no gradients.
const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-neutral-100 text-muted-foreground border-border",
  info: "bg-info-surface text-accent-foreground border-info",
  success: "bg-success-surface text-success border-success",
  warning: "bg-warning-surface text-warning border-warning",
  destructive: "bg-destructive-surface text-destructive border-destructive",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/** Small pill for statuses and labels. */
export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
