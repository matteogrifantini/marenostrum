import type { MetadataRoute } from "next";
import catalogBeaches from "../../data/catalog/sicilia/beaches.json";
import { getAllPublishedBeaches } from "../data/beach-repository";
import { TERRITORY_HUBS } from "../domain/territory-hubs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://marenostrum.app";
  const now = new Date();
  const slugSet = new Set<string>();

  try {
    const published = await getAllPublishedBeaches();
    published.forEach((beach) => slugSet.add(beach.slug));
  } catch {
    // Fallback to static catalog if DB is offline
  }

  if (slugSet.size === 0) {
    catalogBeaches.forEach((beach) => slugSet.add(beach.slug));
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/mappa`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...TERRITORY_HUBS.map((hub) => ({
      url: `${baseUrl}/localita/${hub.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.75,
    })),
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/termini`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const beachRoutes: MetadataRoute.Sitemap = Array.from(slugSet).map((slug) => ({
    url: `${baseUrl}/spiagge/${slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  return [...staticRoutes, ...beachRoutes];
}
