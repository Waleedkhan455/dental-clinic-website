import type { Metadata } from "next";

import { getServices, groupServicesByCategory } from "@/lib/api/public";
import { serviceCategoryOrder } from "@/config/site";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ServiceCard } from "@/components/sections/ServiceCard";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore dental services at Zimal Dental Clinic — general dentistry, implants, prosthodontics, orthodontics, cosmetic and pediatric care.",
};

export const revalidate = 30;

export default async function ServicesPage() {
  const services = await getServices();
  const groups = groupServicesByCategory(services, serviceCategoryOrder);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="What we offer"
        title="Our services"
        subtitle="Comprehensive dental care, from routine checkups to implants and orthodontics."
      />

      {groups.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-border bg-surface-muted p-8 text-center text-muted-foreground">
          Services are being updated. Please check back soon.
        </p>
      ) : (
        <div className="mt-12 flex flex-col gap-12">
          {groups.map((group) => (
            <section key={group.category} aria-labelledby={`cat-${group.category}`}>
              <h2
                id={`cat-${group.category}`}
                className="border-b border-border pb-3 text-xl font-semibold text-foreground"
              >
                {group.category}
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
