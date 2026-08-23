import Link from "next/link";
import type { BeachPeriod } from "../domain/beach";
import type { NearbyCalmRecommendation } from "../domain/nearby-recommendations";

type NearbyCompassProps = {
  recommendations: NearbyCalmRecommendation[];
  date: string;
  period: BeachPeriod;
  radiusKm: number;
};

export function NearbyCompass({
  recommendations,
  date,
  period,
  radiusKm,
}: NearbyCompassProps) {
  return (
    <section
      aria-labelledby="nearby-compass-heading"
      className="mb-4 rounded-[1.5rem] border border-[rgba(255,194,71,0.45)] bg-[linear-gradient(135deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96))] p-4 shadow-[0_14px_40px_rgba(20,44,57,0.07)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--sun-dark)]">
            Suggerimento locale
          </p>
          <h2 id="nearby-compass-heading" className="mt-1 font-serif text-2xl font-semibold tracking-[-0.045em] text-[var(--ink)]">
            Bussola per te
          </h2>
          <p className="mt-1 text-sm font-semibold text-[var(--ink-soft)]">
            Mare calmo entro {radiusKm} km
          </p>
        </div>
        <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--sun)] text-xl shadow-[0_8px_18px_rgba(255,194,71,0.28)]">
          🧭
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
        Distanza in linea d’aria; il tempo in auto può variare.
      </p>

      {recommendations.length > 0 ? (
        <ol className="mt-4 grid gap-2 sm:grid-cols-3">
          {recommendations.map(({ recommendation, distanceKm }, index) => {
            const { beach } = recommendation;
            const displayScore = (Math.max(0, Math.min(100, recommendation.score)) / 10).toFixed(1);

            return (
              <li key={beach.slug}>
                <Link
                  href={`/spiagge/${beach.slug}?date=${encodeURIComponent(date)}&period=${period}&source=nearby`}
                  aria-label={`Apri ${beach.name}`}
                  className="group flex min-h-[4.5rem] items-center gap-3 rounded-[1rem] border border-[var(--line)] bg-white/80 px-3 py-2.5 transition-[transform,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--sun)] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-extrabold text-[var(--ink)]">{beach.name}</strong>
                    <span className="mt-0.5 block truncate text-xs font-semibold text-[var(--muted)]">{beach.municipality}</span>
                  </span>
                  <span className="shrink-0 text-right text-xs font-black text-[var(--sea-deep)]">{displayScore} · {distanceKm.toFixed(1)} km</span>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-4 rounded-[1rem] bg-white/75 px-3 py-3 text-sm font-semibold text-[var(--muted)]">
          Nessuna spiaggia con mare calmo nel raggio selezionato.
        </p>
      )}
    </section>
  );
}
