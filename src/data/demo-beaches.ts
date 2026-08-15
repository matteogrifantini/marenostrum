import type { Beach, BeachConditions, BeachPeriod, UserIntent } from "../domain/beach";
import { getDateOptions } from "../domain/date-selection";
import { scoreBeach } from "../domain/score";
import { DEMO_FORECAST_DATES, demoForecast } from "./demo-forecast";

export const DEMO_NOW = new Date("2026-08-15T09:00:00+02:00");
export const DEMO_DATE_OPTIONS = getDateOptions(DEMO_NOW);
export const DEMO_TODAY = DEMO_DATE_OPTIONS[0].iso;

const demoBeaches: Beach[] = [
  {
    slug: "cala-del-gelsomino",
    name: "Cala del Gelsomino",
    municipality: "Noto",
    coast: "Sud-est",
    description:
      "Acqua bassa, luce aperta e una baia che resta piacevole quando gira il vento.",
    orientationDegrees: 120,
    orientationLabel: "Sud-est",
    shelter: ["maestrale", "ponente", "tramontana"],
    tags: ["relax", "famiglie", "acque-basse", "fondale-basso"],
    access: "facile",
    image: "/images/beaches/cala-del-gelsomino.jpg",
    imageAlt: "La spiaggia della Pineta del Gelsomineto sulla costa sud-orientale della Sicilia.",
    imageCredit: "Stella",
    imageLicense: "CC BY-SA 4.0",
    latitude: 36.9436,
    longitude: 15.1953,
    services: ["Parcheggio vicino", "Bar stagionale", "Pineta"],
    warnings: ["Nelle ore centrali il parcheggio può riempirsi."],
    facts: ["Fondale basso", "Sabbia e ciottoli", "Accesso breve dalla pineta"],
  },
  {
    slug: "tonnara-di-vendicari",
    name: "Tonnara di Vendicari",
    municipality: "Noto",
    coast: "Sud-est",
    description:
      "Un tratto di costa da vivere con calma, tra sentieri, acqua trasparente e paesaggio aperto.",
    orientationDegrees: 160,
    orientationLabel: "Sud",
    shelter: ["maestrale", "tramontana"],
    tags: ["esplora", "selvaggia", "panorama", "sentiero"],
    access: "moderato",
    image: "/images/beaches/tonnara-di-vendicari.jpg",
    imageAlt: "La spiaggia della Tonnara di Vendicari vista dalla costa della riserva naturale.",
    imageCredit: "Daniele Chessari",
    imageLicense: "CC BY-SA 4.0",
    latitude: 36.8078,
    longitude: 15.0984,
    services: ["Riserva naturale", "Sentiero segnalato", "Area picnic"],
    warnings: ["L’ultimo tratto è a piedi e non è ombreggiato."],
    facts: ["Riserva naturale", "Torre e tonnara storica", "Accesso a piedi"],
  },
  {
    slug: "spiaggia-della-marchesa",
    name: "Spiaggia della Marchesa",
    municipality: "Avola",
    coast: "Sud-est",
    description:
      "Pineta, sabbia e un accesso semplice per una giornata senza troppi piani.",
    orientationDegrees: 95,
    orientationLabel: "Est-sud-est",
    shelter: ["maestrale", "ponente"],
    tags: ["relax", "snorkeling", "famiglie", "pineta"],
    access: "facile",
    image: "/images/beaches/spiaggia-della-marchesa.jpg",
    imageAlt: "La spiaggia della Marchesa di Cassibile tra sabbia, pineta e mare aperto.",
    imageCredit: "Davide Mauro",
    imageLicense: "CC BY-SA 4.0",
    latitude: 36.9274,
    longitude: 15.1456,
    services: ["Pineta", "Parcheggio", "Area picnic"],
    warnings: ["Porta acqua per il tratto sotto il sole."],
    facts: ["Sabbia chiara", "Pineta", "Snorkeling vicino agli scogli"],
  },
];

function conditionsFor(
  slug: string,
  date: string,
  period: BeachPeriod,
): BeachConditions | undefined {
  return demoForecast[slug]?.[date]?.[period];
}

function isDemoDate(value: string): value is (typeof DEMO_FORECAST_DATES)[number] {
  return (DEMO_FORECAST_DATES as readonly string[]).includes(value);
}

function evaluationTimeFor(date: string) {
  return new Date(`${date}T09:00:00+02:00`);
}

export const demoBeachInputs: Array<{
  beach: Beach;
  conditions: BeachConditions;
}> = demoBeaches.map((beach) => ({
  beach,
  conditions: conditionsFor(beach.slug, DEMO_TODAY, "all-day") as BeachConditions,
}));

export function getDemoRecommendations(intent: UserIntent = "relax") {
  return demoBeachInputs
    .map(({ beach, conditions }) =>
      scoreBeach(beach, conditions, { intent, now: DEMO_NOW }),
    )
    .sort((left, right) => right.score - left.score);
}

export function getDemoRecommendationsFor({
  date,
  period,
}: {
  date: string;
  period: BeachPeriod;
}) {
  const effectiveDate = isDemoDate(date) ? date : DEMO_TODAY;

  return demoBeaches
    .map((beach) => {
      const conditions = conditionsFor(beach.slug, effectiveDate, period);

      return conditions
        ? scoreBeach(beach, conditions, {
            intent: "relax",
            now: evaluationTimeFor(effectiveDate),
          })
        : undefined;
    })
    .filter(
      (recommendation): recommendation is NonNullable<typeof recommendation> =>
        Boolean(recommendation),
    )
    .sort((left, right) => right.score - left.score);
}

export function getDemoRecommendation(slug: string, intent: UserIntent = "relax") {
  return getDemoRecommendations(intent).find(
    (recommendation) => recommendation.beach.slug === slug,
  );
}

export function getDemoRecommendationFor(
  slug: string,
  query: { date: string; period: BeachPeriod },
) {
  return getDemoRecommendationsFor(query).find(
    (recommendation) => recommendation.beach.slug === slug,
  );
}

export const demoRecommendations = getDemoRecommendationsFor({
  date: DEMO_TODAY,
  period: "all-day",
});
