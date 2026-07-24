import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import type { Service } from "@/lib/api/public";
import { serviceImage } from "@/lib/serviceImage";
import { Card } from "@/components/ui/Card";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div
        className="aspect-[16/9] w-full bg-accent bg-cover bg-center"
        style={{ backgroundImage: `url(${serviceImage(service)})` }}
        role="img"
        aria-label={service.name}
      />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {service.category}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">{service.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{service.description}</p>

        <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>Visits: {service.visits_text}</span>
        </div>

        <div className="mt-auto pt-4">
          <Link
            href={`/services/${service.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Learn more
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">about {service.name}</span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
