import type { Beach } from "../beach";

export const MARE_NOSTRUM_URL = "https://marenostrum.app";

export type BeachSeoMetadata = {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
};

function canonicalFor(beach: Beach) {
  return `${MARE_NOSTRUM_URL}/spiagge/${encodeURIComponent(beach.slug)}`;
}

function absoluteAssetUrl(value: string) {
  return value.startsWith("http") ? value : `${MARE_NOSTRUM_URL}${value}`;
}

export function buildBeachSeoTitle(beach: Beach): string {
  const brand = "Mare Nostrum";
  const hasDistinctMuni = Boolean(
    beach.municipality && beach.municipality.trim().toLowerCase() !== beach.name.trim().toLowerCase(),
  );

  if (hasDistinctMuni) {
    const candidateWithMuni = `Meteo ${beach.name} (${beach.municipality}): Mare e Vento | ${brand}`;
    if (candidateWithMuni.length <= 60) {
      return candidateWithMuni;
    }
  }

  const candidateRich = `Meteo ${beach.name}: Mare, Vento e Onde | ${brand}`;
  if (candidateRich.length <= 60) {
    return candidateRich;
  }

  const candidateCompact = `Meteo ${beach.name}: Mare e Vento | ${brand}`;
  if (candidateCompact.length <= 60) {
    return candidateCompact;
  }

  return `Meteo ${beach.name} | ${brand}`;
}

export function buildBeachSeoDescription(beach: Beach): string {
  const hasDistinctMuni = Boolean(
    beach.municipality && beach.municipality.trim().toLowerCase() !== beach.name.trim().toLowerCase(),
  );
  const location = hasDistinctMuni ? `${beach.name} (${beach.municipality})` : beach.name;

  const candidateWithMuni = `Meteo mare a ${location} oggi: scopri vento, altezza onde, temperatura acqua e se il mare è calmo per fare il bagno. Previsioni su Mare Nostrum.`;
  if (candidateWithMuni.length <= 158) {
    return candidateWithMuni;
  }

  const candidateWithoutMuni = `Meteo mare a ${beach.name} oggi: scopri vento, altezza onde, temperatura acqua e se il mare è calmo per fare il bagno. Previsioni su Mare Nostrum.`;
  if (candidateWithoutMuni.length <= 158) {
    return candidateWithoutMuni;
  }

  return `Meteo mare e onde a ${beach.name} oggi: vento, altezza onde, temperatura acqua e condizioni per il bagno. Aggiornato su Mare Nostrum.`;
}

export function buildBeachSeoMetadata(beach: Beach): BeachSeoMetadata {
  const title = buildBeachSeoTitle(beach);
  const description = buildBeachSeoDescription(beach);
  const canonical = canonicalFor(beach);

  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
  };
}

export function buildBeachJsonLd(beach: Beach) {
  const canonical = canonicalFor(beach);
  const hasCoordinates =
    typeof beach.latitude === "number" &&
    Number.isFinite(beach.latitude) &&
    typeof beach.longitude === "number" &&
    Number.isFinite(beach.longitude);

  return {
    "@context": "https://schema.org",
    "@type": ["Beach", "TouristAttraction"],
    "@id": `${canonical}#beach`,
    name: beach.name,
    description: beach.description,
    url: canonical,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
      url: canonical,
    },
    identifier: beach.slug,
    ...(beach.image ? { image: absoluteAssetUrl(beach.image) } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: beach.municipality,
      ...(beach.regionName ? { addressRegion: beach.regionName } : {}),
      addressCountry: "IT",
    },
    ...(hasCoordinates
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: beach.latitude,
            longitude: beach.longitude,
          },
        }
      : {}),
    publicAccess: true,
  };
}

export function buildBeachBreadcrumbJsonLd(beach: Beach) {
  const canonical = canonicalFor(beach);
  const itemListElement = [
    {
      "@type": "ListItem" as const,
      position: 1,
      name: "Mare Nostrum",
      item: MARE_NOSTRUM_URL,
    },
  ];

  if (beach.regionName) {
    itemListElement.push({
      "@type": "ListItem" as const,
      position: itemListElement.length + 1,
      name: beach.regionName,
      item: `${MARE_NOSTRUM_URL}/?region=${encodeURIComponent(beach.regionSlug ?? "sicilia")}`,
    });
  }

  if (beach.municipality && beach.municipality.toLowerCase() === "favignana") {
    itemListElement.push({
      "@type": "ListItem" as const,
      position: itemListElement.length + 1,
      name: "Favignana",
      item: `${MARE_NOSTRUM_URL}/localita/favignana`,
    });
  }

  itemListElement.push({
    "@type": "ListItem" as const,
    position: itemListElement.length + 1,
    name: beach.name,
    item: canonical,
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    itemListElement,
  };
}

export function serializeJsonLd(value: unknown) {
  return (JSON.stringify(value) ?? "").replace(/</g, "\\u003c");
}
