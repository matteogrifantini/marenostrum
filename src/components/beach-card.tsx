"use client";

import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { CloudSun, Navigation, Waves, Wind } from "lucide-react";
import type { Beach, BeachPeriod, BeachRecommendation } from "../domain/beach";
import { formatScoreOutOf100 } from "../domain/score";
import { getScorePresentation } from "../domain/score-presentation";
import { formatWeatherLabel } from "../lib/forecast-presentation";
import { versionedMediaUrl } from "../lib/media-url";
import {
  formatDistanceKm,
  formatWaveHeightMeters,
  formatWindSpeedKmh,
  useUserPreferences,
} from "../lib/user-preferences";
import { FavoriteToggle } from "./favorite-toggle";

type BeachCardProps = {
  recommendation: BeachRecommendation;
  date: string;
  period: BeachPeriod;
  distanceKm?: number;
  eager?: boolean;
};

type ScoreTone = "excellent" | "good" | "caution" | "poor";

const SCORE_TONE_CLASSES: Record<ScoreTone, string> = {
  excellent: "bg-[var(--score-excellent)] text-white",
  good: "bg-[var(--score-good)] text-white",
  caution: "bg-[var(--score-caution)] text-[var(--ink)]",
  poor: "bg-[var(--score-poor)] text-white",
};

const IMAGE_POSITIONS: Record<string, string> = {
  "cala-del-gelsomino": "center 72%",
  "spiaggia-della-marchesa": "center 68%",
  "tonnara-di-vendicari": "center 70%",
};

function scoreTone(score: number): ScoreTone {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "caution";
  return "poor";
}

function windDirection(degrees: number) {
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const normalized = ((degrees % 360) + 360) % 360;
  return directions[Math.round(normalized / 45) % directions.length];
}

const WIND_NAMES_ITALIAN: Record<string, string> = {
  N: "tramontana",
  NE: "grecale",
  E: "levante",
  SE: "scirocco",
  S: "ostro",
  SO: "libeccio",
  O: "ponente",
  NO: "maestrale",
};

function getBeachFeatureChips(beach: Beach) {
  const chips: Array<{ label: string; icon: string }> = [];

  // 1. Tipo di litorale (Sabbia, Ciottoli, Scogli)
  if (beach.tags.some((t) => t.includes("sabbia"))) {
    chips.push({ label: "Sabbia", icon: "🏖️" });
  } else if (beach.tags.includes("ciottoli")) {
    chips.push({ label: "Ciottoli", icon: "🪨" });
  } else if (beach.tags.includes("scogli") || beach.tags.includes("scogliera")) {
    chips.push({ label: "Scogli", icon: "🧗" });
  }

  // 2. Esperienza / Target (Acque basse, Famiglie, Snorkeling, Tramonto)
  if (beach.tags.includes("acque-basse")) {
    chips.push({ label: "Acque basse", icon: "🐚" });
  } else if (beach.tags.includes("famiglie")) {
    chips.push({ label: "Famiglie", icon: "👨‍👩‍👧" });
  } else if (beach.tags.includes("snorkeling")) {
    chips.push({ label: "Snorkeling", icon: "🤿" });
  } else if (beach.tags.includes("tramonto") || beach.tags.includes("panoramica")) {
    chips.push({ label: "Tramonto", icon: "🌅" });
  }

  // 3. Servizi / Parcheggio
  if (beach.warnings?.some((w) => w.includes("parcheggio-limitato"))) {
    chips.push({ label: "Park limitato", icon: "🅿️" });
  } else if (beach.services?.some((s) => s.includes("parcheggio"))) {
    chips.push({ label: "Parcheggio", icon: "🅿️" });
  } else if (beach.services?.some((s) => s.includes("lidi") || s.includes("bar"))) {
    chips.push({ label: "Lidi e bar", icon: "🍹" });
  } else if (beach.tags.includes("selvaggia") || beach.tags.includes("natura")) {
    chips.push({ label: "Libera", icon: "🌿" });
  }

  return chips.slice(0, 3);
}

export function BeachCard({
  recommendation,
  date,
  period,
  distanceKm,
  eager = false,
}: BeachCardProps) {
  const preferences = useUserPreferences();
  const { beach, conditions } = recommendation;
  const detailHref = `/spiagge/${beach.slug}?date=${encodeURIComponent(date)}&period=${encodeURIComponent(period)}&source=home`;
  const image = beach.image;
  const imageSrc = image ? versionedMediaUrl(image) : undefined;
  const imageAlt = beach.imageAlt ?? `Foto di ${beach.name}`;
  const displayScore = formatScoreOutOf100(recommendation.score);
  const tone = scoreTone(recommendation.score);
  const direction = windDirection(conditions.windDirectionDegrees);
  const windMetric = formatWindSpeedKmh(
    conditions.windSpeedKmh,
    preferences.distanceUnit,
  );
  const waveMetric = formatWaveHeightMeters(
    conditions.waveHeightMeters,
    preferences.waveHeightUnit,
  );
  const weatherLabel = formatWeatherLabel(conditions.weather);
  const featureChips = getBeachFeatureChips(beach);
  const scorePresentation = getScorePresentation(recommendation);

  const windName = WIND_NAMES_ITALIAN[direction] ?? "";
  const isSheltered = beach.shelter?.includes(windName);
  const seaStateLabel = conditions.seaState
    ? conditions.seaState.charAt(0).toUpperCase() + conditions.seaState.slice(1)
    : "Calmo";
  const googleMapsUrl =
    beach.latitude != null && beach.longitude != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${beach.latitude},${beach.longitude}`
      : undefined;

  return (
    <article className="home-beach-card relative h-full min-w-0 overflow-hidden rounded-[1.25rem] bg-[var(--surface)] shadow-[0_10px_32px_rgba(20,44,57,0.09)]">
      <Link
        href={detailHref}
        aria-label={`Apri la scheda di ${beach.name}`}
        className="block h-full min-w-0 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--sun)]"
      >
        <BeachCardLinkContent>
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--surface-muted)]">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                priority={eager}
                fetchPriority={eager ? "high" : "auto"}
                loading={eager ? "eager" : "lazy"}
                sizes="(max-width: 639px) 46vw, (max-width: 1023px) 31vw, 28vw"
                className="object-cover transition-transform duration-500 ease-out"
                style={{ objectPosition: IMAGE_POSITIONS[beach.slug] ?? "center" }}
              />
            ) : (
              <div
                role="img"
                aria-label={`Foto non disponibile per ${beach.name}`}
                className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.18),transparent_32%),linear-gradient(145deg,var(--sea-deep),var(--ink))]"
              />
            )}

            {/* Aura-style top orientation / shelter badge */}
            <div className="absolute left-2.5 top-2.5 z-10 flex flex-wrap items-center gap-1.5 sm:left-3 sm:top-3">
              {beach.orientationLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[0.62rem] font-semibold text-white/95 backdrop-blur-md shadow-sm sm:text-[0.68rem]">
                  {beach.orientationLabel}
                </span>
              )}
              {isSheltered && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/70 px-2 py-0.5 text-[0.62rem] font-bold text-emerald-300 backdrop-blur-md shadow-sm sm:text-[0.68rem]">
                  🛡️ Riparata
                </span>
              )}
            </div>

            <span className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-4">
            <div className="min-w-0">
              <h3 className="line-clamp-1 font-serif text-[0.95rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--ink)] sm:line-clamp-2 sm:min-h-[2.35rem] sm:text-lg">
                {beach.name}
              </h3>
              <div className="mt-0.5 flex flex-wrap items-center gap-1 break-words text-[0.68rem] font-bold leading-tight text-[var(--muted)] sm:text-xs">
                <span>{distanceKm == null
                  ? beach.municipality
                  : `${beach.municipality} · ${formatDistanceKm(distanceKm, preferences.distanceUnit)}`}</span>
                {beach.coast && <span className="text-[var(--muted)]/80">({beach.coast})</span>}
              </div>

              {/* Feature Chips */}
              {(featureChips.length > 0 || beach.webcam) && (
                <div className="mt-1 flex flex-wrap items-center gap-1 sm:mt-2">
                  {beach.webcam && (
                    <span className="inline-flex items-center rounded bg-[var(--surface-muted)] px-1.5 py-0.5 text-[0.55rem] font-black uppercase text-[var(--ink-soft)] shadow-xs">
                      WEBCAM
                    </span>
                  )}
                  {featureChips.map((chip) => (
                    <span
                      key={chip.label}
                      className="inline-flex items-center gap-0.5 rounded bg-[var(--surface-muted)] px-1.5 py-0.5 text-[0.58rem] font-medium text-[var(--ink-soft)] sm:text-[0.66rem]"
                    >
                      <span aria-hidden="true">{chip.icon}</span>
                      <span>{chip.label}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-2 flex min-w-0 items-center gap-2 pt-1 sm:mt-auto sm:gap-3 sm:pt-3">
              <div
                aria-label={`Punteggio Mare Nostrum: ${scorePresentation.scoreLabel}, ${scorePresentation.label}`}
                data-score-tone={tone}
                className={`flex size-9 shrink-0 items-center justify-center rounded-full shadow-[0_4px_12px_rgba(20,44,57,0.12)] sm:size-12 ${SCORE_TONE_CLASSES[tone]}`}
              >
                <strong className="whitespace-nowrap font-serif text-base font-semibold leading-none tabular-nums tracking-[-0.04em] sm:text-xl">
                  {displayScore}
                </strong>
              </div>

              <div className="min-w-0 flex-1 space-y-0.5 pb-0.5 text-[0.63rem] font-bold leading-tight text-[var(--ink-soft)] sm:space-y-1 sm:text-xs">
                <span className="block text-[0.68rem] font-extrabold text-[var(--ink)]">
                  {scorePresentation.label}
                </span>
                <div
                  aria-label={`Vento: ${direction}, ${windMetric}`}
                  className="flex min-w-0 items-center gap-1 sm:gap-1.5"
                >
                  <Wind
                    aria-hidden="true"
                    className="shrink-0 text-[var(--sea)]"
                    size={13}
                    strokeWidth={2.2}
                  />
                  <span className="min-w-0 break-words whitespace-normal">
                    {direction} · {windMetric}
                  </span>
                </div>
                <div
                  aria-label={`Onde: ${waveMetric}`}
                  className="flex min-w-0 items-center gap-1 sm:gap-1.5"
                >
                  <Waves
                    aria-hidden="true"
                    className="shrink-0 text-[var(--sea)]"
                    size={13}
                    strokeWidth={2.2}
                  />
                  <span className="min-w-0 break-words whitespace-normal">
                    {waveMetric} · {seaStateLabel}
                  </span>
                </div>
                <div
                  aria-label={`Meteo: ${weatherLabel}, ${Math.round(conditions.temperatureCelsius)}°C`}
                  className="flex min-w-0 items-center gap-1 sm:gap-1.5"
                >
                  <CloudSun
                    aria-hidden="true"
                    className="shrink-0 text-[var(--sun-dark)]"
                    size={13}
                    strokeWidth={2.2}
                  />
                  <span className="min-w-0 break-words whitespace-normal">
                    {weatherLabel} · {Math.round(conditions.temperatureCelsius)}°C
                  </span>
                </div>
              </div>
            </div>
          </div>
          <BeachCardLinkStatus />
        </BeachCardLinkContent>
      </Link>

      <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1.5 sm:right-3 sm:top-3">
        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            aria-label={`Apri indicazioni Google Maps per ${beach.name}`}
            title="Apri in Google Maps"
            className="detail-press grid size-9 place-items-center rounded-full bg-white/88 text-[var(--ink)] shadow-[0_4px_14px_rgba(8,47,61,0.14)] backdrop-blur-md transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <Navigation aria-hidden="true" size={15} className="text-blue-600" />
          </a>
        )}
        <FavoriteToggle
          beachSlug={beach.slug}
          beachName={beach.name}
        />
      </div>
    </article>
  );
}

function BeachCardLinkContent({ children }: { children: React.ReactNode }) {
  return <div className="relative flex h-full min-w-0 flex-col">{children}</div>;
}

function BeachCardLinkStatus() {
  const { pending } = useLinkStatus();

  if (!pending) return null;

  return (
    <span
      role="status"
      aria-label="Apertura scheda spiaggia"
      className="pointer-events-none absolute inset-0 z-20 grid place-items-center rounded-[1.25rem] bg-[rgba(255,255,255,0.48)] backdrop-blur-[2px]"
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-3 py-2 text-xs font-black text-white shadow-[0_8px_22px_rgba(20,44,57,0.22)]">
        <span aria-hidden="true" className="size-3 animate-spin rounded-full border-2 border-white/35 border-t-white" />
        Apro…
      </span>
    </span>
  );
}
