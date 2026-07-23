import type { GalleryImage } from "@/lib/api/public";

/** Responsive grid of clinic photos. Callers handle the empty case. */
export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((image) => (
        <li
          key={image.id}
          className="overflow-hidden rounded-lg border border-border bg-neutral-100"
        >
          <div
            className="aspect-square bg-cover bg-center"
            style={{ backgroundImage: `url(${image.image_url})` }}
            role="img"
            aria-label={image.caption ?? "Clinic photo"}
          />
          {image.caption && (
            <p className="px-3 py-2 text-xs text-muted-foreground">{image.caption}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
