export const communityReportCategories = [
  { value: "parking", label: "Parcheggio", emoji: "🅿️", title: "Parcheggio" },
  { value: "crowding", label: "Affollamento", emoji: "👥", title: "Affollamento" },
  { value: "water", label: "Acqua", emoji: "🌊", title: "Acqua" },
  { value: "wind", label: "Vento", emoji: "🌬️", title: "Vento" },
  { value: "services", label: "Servizi", emoji: "🚿", title: "Servizi" },
] as const;

export type CommunityReportCategory = (typeof communityReportCategories)[number]["value"];

export function isCommunityReportCategory(value: unknown): value is CommunityReportCategory {
  return communityReportCategories.some((category) => category.value === value);
}

export function getCommunityReportCategory(category: CommunityReportCategory) {
  return communityReportCategories.find((option) => option.value === category)!;
}
