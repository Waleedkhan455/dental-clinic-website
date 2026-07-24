import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CalendarPlus } from "lucide-react";

import { getServiceBySlug } from "@/lib/api/public";
import { serviceImage } from "@/lib/serviceImage";
import { buttonVariants } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

interface ServiceDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServiceDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  // Resolve not-found here (before the page streams) so the response gets a
  // proper 404 status rather than a soft 200.
  if (!service) {
    notFound();
  }
  return {
    title: service.name,
    description: service.description.slice(0, 160),
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All services
      </Link>

      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-primary">
        {service.category}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">{service.name}</h1>

      {/* Relevant image (uploaded, or a category default). Background image over a
          solid fallback so a missing photo degrades gracefully. */}
      <div
        className="mt-6 aspect-[16/9] w-full rounded-xl border border-border bg-accent bg-cover bg-center"
        style={{ backgroundImage: `url(${serviceImage(service)})` }}
        role="img"
        aria-label={service.name}
      />

      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{service.description}</p>

      <Card className="mt-8">
        <CardContent className="flex items-center gap-3 p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent">
            <CalendarDays className="h-6 w-6 text-primary" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Expected number of visits</p>
            <p className="font-semibold text-foreground">{service.visits_text}</p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Link href="/book" className={buttonVariants({ variant: "primary", size: "lg" })}>
          <CalendarPlus className="h-5 w-5" aria-hidden="true" />
          Book this treatment
        </Link>
      </div>
    </div>
  );
}
