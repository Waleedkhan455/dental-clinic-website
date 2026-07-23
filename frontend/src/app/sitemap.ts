import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getServices } from "@/lib/api/public";

// Include live service detail pages, so re-generate per request.
export const dynamic = "force-dynamic";

const STATIC_PATHS = ["", "/services", "/team", "/gallery", "/contact", "/book"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  let serviceEntries: MetadataRoute.Sitemap = [];
  try {
    const services = await getServices();
    serviceEntries = services.map((service) => ({
      url: `${base}/services/${service.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    // A transient API issue shouldn't break the sitemap — ship the static routes.
  }

  return [...staticEntries, ...serviceEntries];
}
