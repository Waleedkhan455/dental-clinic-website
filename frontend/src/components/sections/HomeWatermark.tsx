/**
 * A large, faint blue brand watermark fixed behind the home page. Because it's
 * `position: fixed`, it stays put while the page scrolls over it. It sits at a
 * negative z-index so it paints above the white page background but behind all
 * content — showing through the sections that have no background of their own.
 */
export function HomeWatermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 flex select-none flex-col items-center justify-center overflow-hidden"
    >
      <div className="flex flex-col items-center opacity-[0.06]">
        <span className="flex h-40 w-40 items-center justify-center rounded-[2rem] bg-primary sm:h-52 sm:w-52">
          <ToothGlyph className="h-24 w-24 text-primary-foreground sm:h-32 sm:w-32" />
        </span>
        <span className="mt-6 text-center font-heading text-4xl font-extrabold tracking-tight text-primary sm:text-6xl">
          Zimal Dental Clinic
        </span>
      </div>
    </div>
  );
}

function ToothGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 6.2C10.4 4.5 8 3.9 6.4 4.9 4.8 5.9 4.3 8.2 4.8 10.4c.35 1.5.5 2.6.8 4.2.25 1.4.45 2.9 1 4.1.3.7.95 1.05 1.5.75.5-.28.7-1.1.95-2 .3-1.15.5-2.5 1.2-3.05.45-.35 1.05-.35 1.5 0 .7.55.9 1.9 1.2 3.05.25.9.45 1.72.95 2 .55.3 1.2-.05 1.5-.75.55-1.2.75-2.7 1-4.1.3-1.6.45-2.7.8-4.2.5-2.2 0-4.5-1.6-5.5C16 3.9 13.6 4.5 12 6.2Z" />
    </svg>
  );
}
