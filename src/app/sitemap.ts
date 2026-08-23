import type { MetadataRoute } from "next";
import { getAllPublishedBeaches } from "../data/beach-repository";
import { TERRITORY_HUBS } from "../domain/territory-hubs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://marenostrum.app";
  let beaches: Array<{ slug: string }> = [];

  try {
    const published = await getAllPublishedBeaches();
    beaches = published;
  } catch {
    beaches = [];
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/mappa`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...TERRITORY_HUBS.map((hub) => ({
      url: `${baseUrl}/localita/${hub.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/termini`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const beachRoutes: MetadataRoute.Sitemap = beaches.map((beach) => ({
    url: `${baseUrl}/spiagge/${beach.slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...beachRoutes];
}
