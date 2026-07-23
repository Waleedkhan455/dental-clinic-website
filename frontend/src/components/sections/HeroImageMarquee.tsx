import { Award, Smile, Sparkles, Stethoscope } from "lucide-react";

/**
 * A self-running image banner for the hero. Four tiles scroll continuously to
 * the left in a seamless loop (pure CSS — see `.hero-marquee-*` in globals.css).
 *
 * Images are set as CSS backgrounds over a solid blue (`bg-accent`) fallback, so
 * if a photo ever fails to load the tile degrades to an on-brand panel with its
 * label rather than a broken-image icon.
 */

interface Tile {
  label: string;
  image: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TILES: Tile[] = [
  {
    label: "Dental Implants",
    icon: Sparkles,
    image:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=70",
  },
  {
    label: "Orthodontics",
    icon: Smile,
    image:
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=70",
  },
  {
    label: "Prosthodontics",
    icon: Award,
    image:
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=70",
  },
  {
    label: "General Dentistry",
    icon: Stethoscope,
    image:
      "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=800&q=70",
  },
];

function TileCard({ tile, hidden }: { tile: Tile; hidden?: boolean }) {
  const Icon = tile.icon;
  return (
    <div
      className="relative mr-4 h-48 w-72 shrink-0 overflow-hidden rounded-xl border border-border bg-accent shadow-[var(--shadow-card)] sm:mr-6 sm:h-56 sm:w-96"
      role={hidden ? undefined : "img"}
      aria-label={hidden ? undefined : `${tile.label} at our clinic`}
      aria-hidden={hidden || undefined}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${tile.image})` }}
      />
      {/* Solid (non-gradient) tint keeps the label readable over any photo. */}
      <div className="absolute inset-0 bg-neutral-900/35" />
      <div className="absolute bottom-0 left-0 flex items-center gap-2 p-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface/95">
          <Icon className="h-5 w-5 text-primary" />
        </span>
        <span className="text-base font-semibold text-white drop-shadow-sm">{tile.label}</span>
      </div>
    </div>
  );
}

export function HeroImageMarquee() {
  return (
    <div
      className="hero-marquee-viewport w-full overflow-hidden"
      role="region"
      aria-label="Our dental specialties"
    >
      <div className="hero-marquee-track flex w-max">
        {TILES.map((tile) => (
          <TileCard key={tile.label} tile={tile} />
        ))}
        {/* Duplicate set for the seamless loop; hidden from assistive tech. */}
        {TILES.map((tile) => (
          <TileCard key={`dup-${tile.label}`} tile={tile} hidden />
        ))}
      </div>
    </div>
  );
}
