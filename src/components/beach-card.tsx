"use client";

import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { CloudSun, Waves, Wind } from "lucide-react";
import type { BeachPeriod, BeachRecommendation } from "../domain/beach";
import { formatScoreOutOf100 } from "../domain/score";
import { formatWeatherLabel } from "../lib/forecast-presentation";
import { versionedMediaUrl } from "../lib/media-url";
import { formatDistanceKm, formatWaveHeightMeters, formatWindSpeedKmh, useUserPreferences } from "../lib/user-preferences";
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

export function BeachCard({
  recommendation,
  date,
  distanceKm,
  eager = false,
}: BeachCardProps) {
  const preferences = useUserPreferences();
  const { beach, conditions } = recommendation;
  const detailHref = `/spiagge/${beach.slug}?date=${encodeURIComponent(date)}&period=all-day&source=home`;
  const image = beach.image;
  const imageSrc = image ? versionedMediaUrl(image) : undefined;
  const imageAlt = beach.imageAlt ?? `Foto di ${beach.name}`;
  const displayScore = formatScoreOutOf100(recommendation.score);
  const tone = scoreTone(recommendation.score);
  const direction = windDirection(conditions.windDirectionDegrees);
  const windMetric = formatWindSpeedKmh(conditions.windSpeedKmh, preferences.distanceUnit);
  const waveMetric = formatWaveHeightMeters(conditions.waveHeightMeters, preferences.waveHeightUnit);
  const weatherLabel = formatWeatherLabel(conditions.weather);

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
            <span className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          <div className="flex min-h-[9.5rem] flex-1 flex-col p-3 sm:p-4">
            <h3 className="line-clamp-2 min-h-[2.35rem] font-serif text-[1.03rem] font-semibold leading-[1.15] tracking-[-0.035em] text-[var(--ink)] sm:text-lg">
              {beach.name}
            </h3>
            <p className="mt-1 break-words text-[0.7rem] font-semibold leading-tight text-[var(--muted)] sm:text-xs">
              {distanceKm == null
                ? beach.municipality
                : `${beach.municipality} · ${formatDistanceKm(distanceKm, preferences.distanceUnit)}`}
            </p>

            <div className="mt-auto flex min-w-0 items-end gap-1.5 pt-3 sm:gap-3">
              <div
                aria-label={`Voto ${displayScore} su 100, ${recommendation.label}`}
                data-score-tone={tone}
                className={`grid size-[2.65rem] shrink-0 place-items-center rounded-full shadow-[0_5px_14px_rgba(20,44,57,0.14)] sm:size-14 ${SCORE_TONE_CLASSES[tone]}`}
              >
                <strong className="font-serif text-base font-semibold leading-none tracking-[-0.055em] sm:text-xl">
                  {displayScore}
                </strong>
              </div>

              <div className="min-w-0 flex-1 space-y-1.5 pb-0.5 text-[0.68rem] font-bold leading-none text-[var(--ink-soft)] sm:text-xs">
                <div
                  aria-label={`Vento: ${direction}, ${windMetric}`}
                  className="flex min-w-0 items-center gap-1.5"
                >
                  <Wind aria-hidden="true" className="shrink-0 text-[var(--sea)]" size={16} strokeWidth={2.2} />
                  <span className="min-w-0 break-words whitespace-normal">{direction} · {windMetric}</span>
                </div>
                <div
                  aria-label={`Onde: ${waveMetric}`}
                  className="flex min-w-0 items-center gap-1.5"
                >
                  <Waves aria-hidden="true" className="shrink-0 text-[var(--sea)]" size={16} strokeWidth={2.2} />
                  <span className="min-w-0 break-words whitespace-normal">{waveMetric}</span>
                </div>
                <div
                  aria-label={`Meteo: ${weatherLabel}, ${Math.round(conditions.temperatureCelsius)}°C`}
                  className="flex min-w-0 items-center gap-1.5"
                >
                  <CloudSun aria-hidden="true" className="shrink-0 text-[var(--sun-dark)]" size={16} strokeWidth={2.2} />
                  <span className="min-w-0 break-words whitespace-normal">{weatherLabel} · {Math.round(conditions.temperatureCelsius)}°C</span>
                </div>
              </div>
            </div>
          </div>
          <BeachCardLinkStatus />
        </BeachCardLinkContent>
      </Link>
      <FavoriteToggle
        beachSlug={beach.slug}
        beachName={beach.name}
        className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4"
      />
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
