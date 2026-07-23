import { Quote } from "lucide-react";

import type { Testimonial } from "@/lib/api/public";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/sections/StarRating";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="flex h-full flex-col p-6">
      <Quote className="h-6 w-6 text-primary" aria-hidden="true" />
      <StarRating rating={testimonial.rating} className="mt-3" />
      <blockquote className="mt-3 flex-1 text-sm text-foreground">
        &ldquo;{testimonial.message}&rdquo;
      </blockquote>
      <p className="mt-4 text-sm font-semibold text-foreground">{testimonial.patient_name}</p>
    </Card>
  );
}
