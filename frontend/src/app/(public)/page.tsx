import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarPlus,
  Stethoscope,
  Award,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

import { HeroSlider } from "@/components/sections/HeroSlider";
import { HomeWatermark } from "@/components/sections/HomeWatermark";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { clinicJsonLd } from "@/lib/seo";
import { DoctorCard } from "@/components/sections/DoctorCard";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { TestimonialCard } from "@/components/sections/TestimonialCard";
import { GalleryGrid } from "@/components/sections/GalleryGrid";
import { ContactSection } from "@/components/sections/ContactSection";
import { siteConfig, whatsappLink } from "@/config/site";
import { getDoctors, getGallery, getServices, getTestimonials } from "@/lib/api/public";

export const metadata: Metadata = {
  title: "Dental Care in Mansehra",
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

// Always render fresh so doctor-panel changes appear immediately.
export const dynamic = "force-dynamic";

const specialties = [
  {
    icon: Stethoscope,
    title: "Dental Implants",
    description: "Long-lasting titanium implants to restore missing teeth.",
  },
  {
    icon: Award,
    title: "Prosthodontics",
    description: "Crowns, bridges, and dentures crafted for form and function.",
  },
  {
    icon: ShieldCheck,
    title: "Orthodontics",
    description: "Braces and aligners to correct alignment and bite.",
  },
];

export default async function HomePage() {
  const [doctors, services, testimonials, gallery] = await Promise.all([
    getDoctors(),
    getServices(),
    getTestimonials(),
    getGallery(),
  ]);

  const featuredServices = services.slice(0, 6);

  return (
    <>
      {/* Local-business structured data for search engines. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicJsonLd()) }}
      />

      {/* Fixed brand watermark behind the page (stays still while scrolling). */}
      <HomeWatermark />

      {/* Hero slideshow */}
      <HeroSlider />

      {/* About the Clinic */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="About the clinic"
              title="Modern, patient-first dental care in Mansehra"
              subtitle={siteConfig.description}
            />
            <p className="mt-4 text-muted-foreground">
              Our team combines clinical expertise with a calm, reassuring environment so every
              visit — from a routine checkup to a full smile makeover — feels comfortable and
              clear.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {specialties.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-lg border border-border bg-surface p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-accent">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Dentists */}
      {doctors.length > 0 && (
        <section id="team" className="bg-surface-muted">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="Our team" title="Meet our dentists" />
              <Link
                href="/team"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View full team <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {featuredServices.length > 0 && (
        <section id="services" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="What we offer"
              title="Our services"
              subtitle="From routine dentistry to implants and orthodontics."
            />
            <Link
              href="/services"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all services <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="bg-surface-muted">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <SectionHeading eyebrow="Patient stories" title="What our patients say" align="center" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section id="gallery" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading eyebrow="Our clinic" title="Gallery" />
          <div className="mt-8">
            <GalleryGrid images={gallery} />
          </div>
        </section>
      )}

      {/* Appointment call-to-action */}
      <section id="appointment" className="bg-primary">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
              Ready to book your appointment?
            </h2>
            <p className="mt-2 text-primary-foreground/90">
              Choose your preferred dentist and time online, or message us on WhatsApp.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/book"
              className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-surface px-7 text-base font-medium text-primary transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary-foreground)]"
            >
              <CalendarPlus className="h-5 w-5" aria-hidden="true" />
              Book online
            </Link>
            <a
              href={whatsappLink(
                siteConfig.contact.whatsapp,
                "Hello, I would like to book a dental appointment.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-[color:var(--color-primary-foreground)] px-7 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Contact & Location */}
      <section id="contact" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="Get in touch" title="Contact & location" />
        <div className="mt-8">
          <ContactSection />
        </div>
      </section>
    </>
  );
}
