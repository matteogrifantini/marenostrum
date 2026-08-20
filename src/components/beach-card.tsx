import Image from "next/image";
import Link from "next/link";
import { Waves, Wind } from "lucide-react";
import type { BeachPeriod, BeachRecommendation } from "../domain/beach";

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
  period,
  distanceKm,
  eager = false,
}: BeachCardProps) {
  const { beach, conditions } = recommendation;
  const detailHref = `/spiagge/${beach.slug}?date=${encodeURIComponent(date)}&period=${period}`;
  const image = beach.image ?? "/images/beaches/cala-del-gelsomino.jpg";
  const imageAlt = beach.imageAlt ?? `Foto di ${beach.name}`;
  const displayScore = (Math.max(0, Math.min(100, recommendation.score)) / 10).toFixed(1);
  const tone = scoreTone(recommendation.score);
  const direction = windDirection(conditions.windDirectionDegrees);

  return (
    <article className="home-beach-card h-full min-w-0 overflow-hidden rounded-[1.25rem] bg-[var(--surface)] shadow-[0_10px_32px_rgba(20,44,57,0.09)]">
      <Link
        href={detailHref}
        aria-label={`Apri la scheda di ${beach.name}`}
        className="flex h-full min-w-0 flex-col focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--sun)]"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--surface-muted)]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            loading={eager ? "eager" : "lazy"}
            sizes="(max-width: 639px) 46vw, (max-width: 1023px) 31vw, 28vw"
            className="object-cover transition-transform duration-500 ease-out"
            style={{ objectPosition: IMAGE_POSITIONS[beach.slug] ?? "center" }}
          />
          <span className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <h3 className="line-clamp-2 min-h-[2.35rem] font-serif text-[1.03rem] font-semibold leading-[1.15] tracking-[-0.035em] text-[var(--ink)] sm:text-lg">
            {beach.name}
          </h3>
          <p className="mt-1 truncate text-[0.7rem] font-semibold text-[var(--muted)] sm:text-xs">
            {distanceKm == null
              ? beach.municipality
              : `${beach.municipality} · ${distanceKm} km`}
          </p>

          <div className="mt-auto flex min-w-0 items-end gap-1.5 pt-3 sm:gap-3">
            <div
              aria-label={`Voto ${displayScore} su 10, ${recommendation.label}`}
              data-score-tone={tone}
              className={`grid size-[2.65rem] shrink-0 place-items-center rounded-full shadow-[0_5px_14px_rgba(20,44,57,0.14)] sm:size-14 ${SCORE_TONE_CLASSES[tone]}`}
            >
              <strong className="font-serif text-base font-semibold leading-none tracking-[-0.055em] sm:text-xl">
                {displayScore}
              </strong>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5 pb-0.5 text-[0.68rem] font-bold leading-none text-[var(--ink-soft)] sm:text-xs">
              <div
                aria-label={`Vento: ${direction}, ${conditions.windSpeedKmh} km/h`}
                className="flex min-w-0 items-center gap-1.5"
              >
                <Wind aria-hidden="true" className="shrink-0 text-[var(--sea)]" size={16} strokeWidth={2.2} />
                <span className="truncate">{direction} · {conditions.windSpeedKmh} km/h</span>
              </div>
              <div
                aria-label={`Onde: ${conditions.waveHeightMeters.toFixed(1)} m`}
                className="flex min-w-0 items-center gap-1.5"
              >
                <Waves aria-hidden="true" className="shrink-0 text-[var(--sea)]" size={16} strokeWidth={2.2} />
                <span className="truncate">{conditions.waveHeightMeters.toFixed(1)} m</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
