import type { Beach } from "../domain/beach";
import type {
  BeachContent,
  MediaItemRow,
  ParkingFacilityRow,
  WebcamRow,
} from "../data/beach-content-repository";
import {
  emptyBeachDetailContent,
  type BeachDetailContent,
  type BeachDetailReport,
  type BeachFact,
} from "../domain/beach-detail-content";

function nonEmpty(value: string | null | undefined, fallback: string) {
  const normalized = value?.trim();
  return normalized || fallback;
}

function isoDate(value: string | null | undefined) {
  const match = value?.match(/^\d{4}-\d{2}-\d{2}/);
  return match?.[0] ?? null;
}

function verificationLabel(value: string | null | undefined, prefix: string, fallback: string) {
  const date = isoDate(value);
  return date ? `${prefix} ${date}` : fallback;
}

function facilityType(value: string) {
  const normalized = value.trim().toLowerCase();
  const labels: Record<string, string> = {
    public: "Parcheggio pubblico",
    private: "Parcheggio privato",
    street: "Sosta lungo strada",
    roadside: "Sosta lungo strada",
  };

  return labels[normalized] ?? nonEmpty(value, "Tipo non disponibile");
}

function mapParking(parking: ParkingFacilityRow, sourceUrl?: string) {
  return {
    id: parking.id,
    name: nonEmpty(parking.name, "Parcheggio vicino"),
    price: nonEmpty(parking.pricing_note, "Prezzo non disponibile"),
    type: facilityType(parking.facility_type),
    walking: nonEmpty(parking.access_note, "Distanza a piedi non disponibile"),
    updated: verificationLabel(
      parking.checked_at,
      "Verificato",
      "Data di verifica non disponibile",
    ),
    ...(sourceUrl ? { sourceUrl } : {}),
  };
}

function mapFacts(beach: Beach): BeachFact[] {
  return (beach.facts ?? [])
    .map((fact) => fact.trim())
    .filter(Boolean)
    .map((value) => ({ emoji: "•", label: "Dettaglio", value }));
}

function numericCoordinate(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function distanceKm(
  latitude: number | undefined,
  longitude: number | undefined,
  webcam: WebcamRow,
) {
  const beachLatitude = numericCoordinate(latitude);
  const beachLongitude = numericCoordinate(longitude);
  const webcamLatitude = numericCoordinate(webcam.latitude);
  const webcamLongitude = numericCoordinate(webcam.longitude);

  if (
    beachLatitude === null ||
    beachLongitude === null ||
    webcamLatitude === null ||
    webcamLongitude === null
  ) {
    return undefined;
  }

  const earthRadiusKm = 6371;
  const latitudeDelta = ((webcamLatitude - beachLatitude) * Math.PI) / 180;
  const longitudeDelta = ((webcamLongitude - beachLongitude) * Math.PI) / 180;
  const beachLatitudeRadians = (beachLatitude * Math.PI) / 180;
  const webcamLatitudeRadians = (webcamLatitude * Math.PI) / 180;
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(beachLatitudeRadians) *
      Math.cos(webcamLatitudeRadians) *
      Math.sin(longitudeDelta / 2) ** 2;
  const distance = earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(distance * 10) / 10;
}

function localMediaSource(media: MediaItemRow) {
  const candidate = media.media_url ?? media.storage_path ?? media.thumbnail_url;
  return candidate?.startsWith("/") ? candidate : null;
}

function mapPhotos(beach: Beach, media: MediaItemRow[]) {
  return media
    .filter((item) => item.kind === "photo")
    .map((item) => {
      const source = localMediaSource(item);
      if (!source) return null;

      return {
        id: item.id,
        src: source,
        alt: `Foto di ${beach.name}`,
        age: verificationLabel(
          item.captured_at ?? item.verified_at,
          "Verificata",
          "Data non disponibile",
        ),
      };
    })
    .filter((photo): photo is NonNullable<typeof photo> => photo !== null);
}

function mapWebcam(beach: Beach, webcam: WebcamRow | undefined) {
  if (!webcam) return null;

  const image = webcam.snapshot_url?.startsWith("/") ? webcam.snapshot_url : null;

  return {
    name: nonEmpty(webcam.name, "Webcam vicina"),
    distanceKm: distanceKm(beach.latitude, beach.longitude, webcam),
    ...(image ? { image, alt: `Anteprima della webcam di ${webcam.name}` } : {}),
    updated: verificationLabel(
      webcam.last_checked_at,
      "Ultimo controllo",
      "Ultimo controllo non disponibile",
    ),
    live: webcam.status === "online",
    pageUrl: webcam.page_url,
  };
}

export function buildBeachDetailContent(
  beach: Beach,
  content: BeachContent | null,
  reports: BeachDetailReport[],
): BeachDetailContent {
  const sourceUrlById = new Map(
    (content?.sources ?? []).map((source) => [source.id, source.source_url]),
  );

  return {
    ...emptyBeachDetailContent,
    reports: [...reports],
    facts: mapFacts(beach),
    parkings:
      content?.parkings.map((parking) =>
        mapParking(parking, parking.source_id ? sourceUrlById.get(parking.source_id) : undefined),
      ) ?? [],
    reviewProfile: content?.reviewProfile
      ? {
          provider: content.reviewProfile.provider,
          mapsUrl: content.reviewProfile.maps_url,
        }
      : null,
    recentPhotos: content ? mapPhotos(beach, content.media) : [],
    // Video providers are not rendered as images: keep them hidden until a
    // dedicated licensed video renderer is connected.
    reels: [],
    webcam: content ? mapWebcam(beach, content.webcams[0]) : null,
  };
}
