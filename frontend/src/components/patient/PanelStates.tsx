import { Loader2, AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function PanelLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2 py-16 text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function PanelError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-3 p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          <p className="font-medium">{message}</p>
        </div>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <span className="text-primary" aria-hidden="true">
          {icon}
        </span>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
        {action && <div className="mt-2">{action}</div>}
      </CardContent>
    </Card>
  );
}
