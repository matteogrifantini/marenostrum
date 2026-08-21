export const communityReportCategories = [
  {
    value: "parking",
    label: "Parcheggio",
    emoji: "🅿️",
    title: "Parcheggio",
    details: [
      { value: "available", label: "Posti disponibili" },
      { value: "almost-full", label: "Parcheggio quasi pieno" },
      { value: "full", label: "Parcheggio pieno" },
      { value: "paid", label: "Parcheggio a pagamento" },
      { value: "difficult-access", label: "Accesso difficile" },
    ],
  },
  {
    value: "crowding",
    label: "Affollamento",
    emoji: "👥",
    title: "Affollamento",
    details: [
      { value: "quiet", label: "Spiaggia tranquilla" },
      { value: "moderate", label: "Affollamento moderato" },
      { value: "crowded", label: "Spiaggia affollata" },
      { value: "full", label: "Spiaggia piena" },
    ],
  },
  {
    value: "water",
    label: "Acqua",
    emoji: "🌊",
    title: "Acqua",
    details: [
      { value: "clear", label: "Acqua limpida" },
      { value: "murky", label: "Acqua torbida" },
      { value: "seaweed", label: "Alghe o posidonia" },
      { value: "jellyfish", label: "Meduse" },
      { value: "litter", label: "Rifiuti in acqua" },
    ],
  },
  {
    value: "wind",
    label: "Vento",
    emoji: "🌬️",
    title: "Vento",
    details: [
      { value: "light", label: "Vento leggero" },
      { value: "moderate", label: "Vento moderato" },
      { value: "strong", label: "Vento forte" },
      { value: "gusts", label: "Raffiche sostenute" },
    ],
  },
  {
    value: "services",
    label: "Servizi",
    emoji: "🚿",
    title: "Servizi",
    details: [
      { value: "showers", label: "Docce disponibili" },
      { value: "toilets", label: "Bagni disponibili" },
      { value: "food", label: "Bar o ristoro aperto" },
      { value: "closed", label: "Servizi chiusi" },
      { value: "missing", label: "Servizio assente" },
    ],
  },
] as const;

export type CommunityReportCategory = (typeof communityReportCategories)[number]["value"];

export function isCommunityReportCategory(value: unknown): value is CommunityReportCategory {
  return communityReportCategories.some((category) => category.value === value);
}

export function getCommunityReportCategory(category: CommunityReportCategory) {
  return communityReportCategories.find((option) => option.value === category)!;
}

export function getCommunityReportDetailOptions(category: CommunityReportCategory) {
  return getCommunityReportCategory(category).details;
}

export function isCommunityReportDetail(category: CommunityReportCategory, detail: string) {
  return getCommunityReportDetailOptions(category).some((option) => option.label === detail);
}
