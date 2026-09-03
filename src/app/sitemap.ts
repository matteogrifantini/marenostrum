import type { MetadataRoute } from "next";
import { getAllPublishedBeaches } from "../data/beach-repository";
import {
  hasUniqueTerritoryHubDescription,
  shouldIndexTerritoryHub,
} from "../domain/seo/sitemap-policy";
import { TERRITORY_HUBS } from "../domain/territory-hubs";
import type { Beach } from "../domain/beach";

const BASE_URL = "https://marenostrum.app";

function staticRoutes(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/mappa`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/privacy`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookie`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/termini`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}

function meaningfulDate(value: string | undefined) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

function latestBeachUpdate(beaches: readonly Beach[]) {
  return beaches
    .map((beach) => meaningfulDate(beach.updatedAt))
    .filter((date): date is Date => date !== undefined)
    .sort((left, right) => right.getTime() - left.getTime())[0];
}

function beachRoute(beach: Beach): MetadataRoute.Sitemap[number] {
  const lastModified = meaningfulDate(beach.updatedAt);
  return {
    url: `${BASE_URL}/spiagge/${encodeURIComponent(beach.slug)}`,
    changeFrequency: "daily",
    priority: 0.85,
    ...(lastModified ? { lastModified } : {}),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const published = await getAllPublishedBeaches(undefined, { bypassCache: true });
    const beachesByProvince = new Map<string, Beach[]>();

    for (const beach of published) {
      if (!beach.provinceCode) continue;
      const provinceBeaches = beachesByProvince.get(beach.provinceCode) ?? [];
      provinceBeaches.push(beach);
      beachesByProvince.set(beach.provinceCode, provinceBeaches);
    }

    const territoryRoutes = TERRITORY_HUBS.flatMap((hub) => {
      const beaches = beachesByProvince.get(hub.provinceCode) ?? [];
      if (!shouldIndexTerritoryHub({
        publishedBeachCount: beaches.length,
        hasUniqueDescription: hasUniqueTerritoryHubDescription(hub.description),
      })) {
        return [];
      }

      const lastModified = latestBeachUpdate(beaches);
      return [{
        url: `${BASE_URL}/localita/${encodeURIComponent(hub.slug)}`,
        changeFrequency: "daily" as const,
        priority: 0.75,
        ...(lastModified ? { lastModified } : {}),
      }];
    });

    return [
      ...staticRoutes(),
      ...territoryRoutes,
      ...published.map(beachRoute),
    ];
  } catch (error) {
    console.error("Sitemap beach catalog lookup failed", error);
    return staticRoutes();
  }
}
