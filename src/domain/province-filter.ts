import type { BeachRecommendation } from "./beach";

export const SICILIAN_PROVINCES = [
  { code: "AG", label: "Agrigento" },
  { code: "CL", label: "Caltanissetta" },
  { code: "CT", label: "Catania" },
  { code: "EN", label: "Enna" },
  { code: "ME", label: "Messina" },
  { code: "PA", label: "Palermo" },
  { code: "RG", label: "Ragusa" },
  { code: "SR", label: "Siracusa" },
  { code: "TP", label: "Trapani" },
] as const;

export type SicilianProvinceCode = (typeof SICILIAN_PROVINCES)[number]["code"];
export type ProvinceSelection = SicilianProvinceCode | "all";

const provinceCodes = new Set<string>(SICILIAN_PROVINCES.map(({ code }) => code));

export function normalizeProvinceCode(value: string | null | undefined): ProvinceSelection {
  const normalized = value?.trim().toUpperCase();
  return normalized && provinceCodes.has(normalized)
    ? normalized as SicilianProvinceCode
    : "all";
}

export function filterRecommendationsByProvince(
  recommendations: readonly BeachRecommendation[],
  province: ProvinceSelection,
) {
  if (province === "all") return recommendations;

  return recommendations.filter(({ beach }) => beach.provinceCode === province);
}
