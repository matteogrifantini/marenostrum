import type { Beach, BeachAccess } from "./beach";

export type BeachFilterTag =
  | "sabbia"
  | "scogliera"
  | "ciottoli"
  | "riserva"
  | "trekking"
  | "citta"
  | "snorkeling"
  | "famiglie"
  | "libera"
  | "attrezzata"
  | "lidi"
  | "selvaggia";

export type BeachFilterService = "parcheggio" | "pineta" | "bar" | "servizi";

export type BeachFilters = {
  access: BeachAccess[];
  tags: BeachFilterTag[];
  services: BeachFilterService[];
};

type FilterOption<T extends string> = {
  value: T;
  label: string;
};

export const DEFAULT_BEACH_FILTERS: BeachFilters = {
  access: [],
  tags: [],
  services: [],
};

export const BEACH_ACCESS_FILTER_OPTIONS: ReadonlyArray<FilterOption<BeachAccess>> = [
  { value: "facile", label: "Accesso facile" },
  { value: "moderato", label: "Accesso moderato" },
  { value: "difficile", label: "Accesso impegnativo" },
];

export const BEACH_TAG_FILTER_OPTIONS: ReadonlyArray<FilterOption<BeachFilterTag>> = [
  { value: "sabbia", label: "Sabbia" },
  { value: "scogliera", label: "Scogliera" },
  { value: "ciottoli", label: "Ciottoli" },
  { value: "riserva", label: "Riserva" },
  { value: "trekking", label: "Trekking" },
  { value: "citta", label: "In città" },
  { value: "snorkeling", label: "Snorkeling" },
  { value: "famiglie", label: "Adatta alle famiglie" },
  { value: "libera", label: "Spiaggia libera" },
  { value: "attrezzata", label: "Attrezzata" },
  { value: "lidi", label: "Lidi" },
  { value: "selvaggia", label: "Selvaggia" },
];

export const BEACH_SERVICE_FILTER_OPTIONS: ReadonlyArray<FilterOption<BeachFilterService>> = [
  { value: "parcheggio", label: "Parcheggio" },
  { value: "pineta", label: "Pineta" },
  { value: "bar", label: "Bar e ristoro" },
  { value: "servizi", label: "Servizi" },
];

const TAG_TOKENS: Record<BeachFilterTag, ReadonlyArray<string>> = {
  sabbia: ["sabbia", "arenile", "litorale"],
  scogliera: ["scogli", "scogliera", "roccia", "roccioso", "rocciosa"],
  ciottoli: ["ciottoli", "ghiaia"],
  riserva: ["riserva", "area protetta"],
  trekking: ["trekking", "sentiero", "percorso", "cammino"],
  citta: ["citta", "lungomare", "urbana", "centro abitato"],
  snorkeling: ["snorkeling"],
  famiglie: ["famiglie", "bambini"],
  libera: ["spiaggia libera", "arenile libero", "libera"],
  attrezzata: ["attrezzata", "stabilimento", "concessione"],
  lidi: ["lido", "lidi", "stabilimento balneare"],
  selvaggia: ["selvaggia", "incontaminata"],
};

const SERVICE_TOKENS: Record<BeachFilterService, ReadonlyArray<string>> = {
  parcheggio: ["parcheggio", "sosta auto"],
  pineta: ["pineta"],
  bar: ["bar", "ristoro", "ristorante"],
  servizi: ["servizi", "docce", "toilette", "bagni"],
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase("it-IT")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function beachSearchText(beach: Beach) {
  return normalize(
    [
      beach.name,
      beach.municipality,
      beach.coast,
      beach.description,
      ...beach.tags,
      ...(beach.services ?? []),
      ...(beach.facts ?? []),
      ...(beach.warnings ?? []),
    ].join(" "),
  );
}

function matchesGroup<T extends string>(
  text: string,
  selected: readonly T[],
  tokens: Record<T, ReadonlyArray<string>>,
) {
  return selected.length === 0 || selected.some((value) => tokens[value].some((token) => text.includes(normalize(token))));
}

export function matchesBeachFilters(beach: Beach, filters: BeachFilters) {
  const text = beachSearchText(beach);
  const accessMatches = filters.access.length === 0 || filters.access.includes(beach.access);
  const tagMatches = matchesGroup(text, filters.tags, TAG_TOKENS);
  const serviceMatches = matchesGroup(text, filters.services, SERVICE_TOKENS);

  return accessMatches && tagMatches && serviceMatches;
}
