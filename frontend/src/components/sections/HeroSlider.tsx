"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";

import { siteConfig } from "@/config/site";

/**
 * Full-width hero slideshow: each slide is a background photo with the clinic's
 * message overlaid, plus prev/next arrows and dot indicators. It advances on its
 * own and pauses on hover/focus; auto-advance is disabled for users who prefer
 * reduced motion (arrows and dots still work).
 */

interface Slide {
  image: string;
  heading: string;
  subtitle: string;
}

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=70`;

const SLIDES: Slide[] = [
  {
    image: IMG("1629909615184-74f495363b67"),
    heading: "Comprehensive dental care you can trust",
    subtitle:
      "Expert treatment from clinicians and faculty affiliated with Ayub Medical College — in the heart of Mansehra.",
  },
  {
    image: IMG("1588776814546-1ffcf47267a5"),
    heading: "Dental implants & prosthodontics",
    subtitle: "Restore missing teeth with long-lasting implants, crowns, bridges, and dentures.",
  },
  {
    image: IMG("1609840114035-3c981b782dfe"),
    heading: "Orthodontics for a confident smile",
    subtitle: "Braces and clear aligners to straighten teeth and correct your bite.",
  },
  {
    image: IMG("1606811841689-23dfddce3e95"),
    heading: "Gentle dentistry for the whole family",
    subtitle: "From routine checkups to children's dental care, in a calm and modern clinic.",
  },
];

const AUTOPLAY_MS = 5000;
const PRIMARY_BTN =
  "inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-surface px-7 text-base font-semibold text-primary transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const SECONDARY_BTN =
  "inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-white/80 px-7 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const ARROW_BTN =
  "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md border border-white/50 bg-neutral-900/30 text-white transition-colors hover:bg-neutral-900/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex";
const TEXT_SHADOW = { textShadow: "0 2px 10px rgb(0 0 0 / 0.35)" };

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = SLIDES.length;

  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  // Auto-advance, paused on hover/focus and when reduced motion is requested.
  const reducedMotion = useRef(false);
  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  useEffect(() => {
    if (paused || reducedMotion.current) return;
    const id = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, next]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Clinic highlights"
      className="relative isolate overflow-hidden bg-primary"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={slide.heading}
            className="relative w-full shrink-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
            inert={i !== index || undefined}
          >
            <div
              className="absolute inset-0 bg-primary bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            {/* Solid (non-gradient) tint for text legibility over any photo. */}
            <div className="absolute inset-0 bg-neutral-900/55" />

            <div className="relative mx-auto flex min-h-[30rem] max-w-6xl flex-col justify-center px-6 py-20 sm:min-h-[34rem] sm:px-16 lg:px-20">
              <span className="inline-flex w-fit items-center rounded-full border border-white/40 px-3 py-1 text-sm font-medium text-white">
                {siteConfig.location.city}, {siteConfig.location.country}
              </span>
              <h1
                className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl"
                style={TEXT_SHADOW}
              >
                {slide.heading}
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-white/90" style={TEXT_SHADOW}>
                {slide.subtitle}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/book" className={PRIMARY_BTN}>
                  <CalendarPlus className="h-5 w-5" aria-hidden="true" />
                  Book an Appointment
                </Link>
                <Link href="/services" className={SECONDARY_BTN}>
                  Explore Services
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={prev} aria-label="Previous slide" className={`${ARROW_BTN} left-3 sm:left-4`}>
        <ChevronLeft className="h-6 w-6" aria-hidden="true" />
      </button>
      <button type="button" onClick={next} aria-label="Next slide" className={`${ARROW_BTN} right-3 sm:right-4`}>
        <ChevronRight className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center gap-2.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.heading}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={
              "h-2.5 rounded-full transition-all " +
              (i === index ? "w-7 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80")
            }
          />
        ))}
      </div>
    </section>
  );
}
