import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/** Five-star rating display (read-only). */
export function StarRating({ rating, className }: { rating: number; className?: string }) {
  const clamped = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`Rated ${clamped} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "h-4 w-4",
            index < clamped ? "fill-warning text-warning" : "fill-transparent text-neutral-300",
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
