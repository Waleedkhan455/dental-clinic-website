import { Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional primary action (usually "New …"). */
  actionLabel?: string;
  onAction?: () => void;
}

export function AdminHeader({ title, subtitle, actionLabel, onAction }: AdminHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="shrink-0">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
