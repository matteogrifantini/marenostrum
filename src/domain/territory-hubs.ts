export type TerritoryHub = {
  slug: string;
  provinceCode: string;
  name: string;
  eyebrow: string;
  description: string;
  queryLabel: string;
};

export const TERRITORY_HUBS: readonly TerritoryHub[] = [
  {
    slug: "palermo",
    provinceCode: "PA",
    name: "Spiagge vicino Palermo",
    eyebrow: "Costa nord-occidentale",
    description: "Confronta vento, onde e cielo sulle spiagge del palermitano prima di partire.",
    queryLabel: "Palermo e provincia",
  },
  {
    slug: "trapani",
    provinceCode: "TP",
    name: "Spiagge vicino Trapani",
    eyebrow: "Golfo, Egadi e Zingaro",
    description: "Scopri dove il mare è più tranquillo tra Trapani, Favignana, Scopello e San Vito Lo Capo.",
    queryLabel: "Trapani e provincia",
  },
  {
    slug: "messina",
    provinceCode: "ME",
    name: "Spiagge vicino Messina",
    eyebrow: "Costa nord-orientale",
    description: "Una pagina pronta ad accogliere le prossime spiagge verificate del messinese.",
    queryLabel: "Messina e provincia",
  },
  {
    slug: "siracusa",
    provinceCode: "SR",
    name: "Spiagge vicino Siracusa",
    eyebrow: "Costa sud-orientale",
    description: "Una pagina pronta ad accogliere le prossime spiagge verificate del siracusano.",
    queryLabel: "Siracusa e provincia",
  },
  {
    slug: "ragusa",
    provinceCode: "RG",
    name: "Spiagge vicino Ragusa",
    eyebrow: "Costa iblea",
    description: "Una pagina pronta ad accogliere le prossime spiagge verificate del ragusano.",
    queryLabel: "Ragusa e provincia",
  },
  {
    slug: "agrigento",
    provinceCode: "AG",
    name: "Spiagge vicino Agrigento",
    eyebrow: "Costa dei templi",
    description: "Una pagina pronta ad accogliere le prossime spiagge verificate dell'agrigentino.",
    queryLabel: "Agrigento e provincia",
  },
];

export function getTerritoryHub(slug: string) {
  return TERRITORY_HUBS.find((hub) => hub.slug === slug) ?? null;
}

export function filterRecommendationsForHub<T extends { beach: { provinceCode?: string } }>(
  recommendations: readonly T[],
  hub: TerritoryHub,
) {
  return recommendations.filter(({ beach }) => beach.provinceCode === hub.provinceCode);
}
