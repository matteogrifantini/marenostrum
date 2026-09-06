import type { BeachRecommendation } from "./beach";

export const ITALIAN_REGIONS = [
  { code: "IT-21", label: "Piemonte" },
  { code: "IT-23", label: "Valle d'Aosta" },
  { code: "IT-25", label: "Lombardia" },
  { code: "IT-32", label: "Trentino-Alto Adige" },
  { code: "IT-34", label: "Veneto" },
  { code: "IT-36", label: "Friuli-Venezia Giulia" },
  { code: "IT-42", label: "Liguria" },
  { code: "IT-45", label: "Emilia-Romagna" },
  { code: "IT-52", label: "Toscana" },
  { code: "IT-55", label: "Umbria" },
  { code: "IT-57", label: "Marche" },
  { code: "IT-62", label: "Lazio" },
  { code: "IT-65", label: "Abruzzo" },
  { code: "IT-67", label: "Molise" },
  { code: "IT-72", label: "Campania" },
  { code: "IT-75", label: "Puglia" },
  { code: "IT-77", label: "Basilicata" },
  { code: "IT-78", label: "Calabria" },
  { code: "IT-82", label: "Sicilia" },
  { code: "IT-88", label: "Sardegna" },
] as const;

export type ItalianRegionCode = (typeof ITALIAN_REGIONS)[number]["code"];
export type RegionSelection = ItalianRegionCode | "all";

export const ITALIAN_PROVINCES = [
  { code: "AL", label: "Alessandria", regionCode: "IT-21" },
  { code: "AT", label: "Asti", regionCode: "IT-21" },
  { code: "BI", label: "Biella", regionCode: "IT-21" },
  { code: "CN", label: "Cuneo", regionCode: "IT-21" },
  { code: "NO", label: "Novara", regionCode: "IT-21" },
  { code: "TO", label: "Torino", regionCode: "IT-21" },
  { code: "VB", label: "Verbano-Cusio-Ossola", regionCode: "IT-21" },
  { code: "VC", label: "Vercelli", regionCode: "IT-21" },
  { code: "AO", label: "Aosta", regionCode: "IT-23" },
  { code: "BG", label: "Bergamo", regionCode: "IT-25" },
  { code: "BS", label: "Brescia", regionCode: "IT-25" },
  { code: "CO", label: "Como", regionCode: "IT-25" },
  { code: "CR", label: "Cremona", regionCode: "IT-25" },
  { code: "LC", label: "Lecco", regionCode: "IT-25" },
  { code: "LO", label: "Lodi", regionCode: "IT-25" },
  { code: "MB", label: "Monza e Brianza", regionCode: "IT-25" },
  { code: "MI", label: "Milano", regionCode: "IT-25" },
  { code: "MN", label: "Mantova", regionCode: "IT-25" },
  { code: "PV", label: "Pavia", regionCode: "IT-25" },
  { code: "SO", label: "Sondrio", regionCode: "IT-25" },
  { code: "VA", label: "Varese", regionCode: "IT-25" },
  { code: "BZ", label: "Bolzano", regionCode: "IT-32" },
  { code: "TN", label: "Trento", regionCode: "IT-32" },
  { code: "BL", label: "Belluno", regionCode: "IT-34" },
  { code: "PD", label: "Padova", regionCode: "IT-34" },
  { code: "RO", label: "Rovigo", regionCode: "IT-34" },
  { code: "TV", label: "Treviso", regionCode: "IT-34" },
  { code: "VE", label: "Venezia", regionCode: "IT-34" },
  { code: "VI", label: "Vicenza", regionCode: "IT-34" },
  { code: "VR", label: "Verona", regionCode: "IT-34" },
  { code: "GO", label: "Gorizia", regionCode: "IT-36" },
  { code: "PN", label: "Pordenone", regionCode: "IT-36" },
  { code: "TS", label: "Trieste", regionCode: "IT-36" },
  { code: "UD", label: "Udine", regionCode: "IT-36" },
  { code: "GE", label: "Genova", regionCode: "IT-42" },
  { code: "IM", label: "Imperia", regionCode: "IT-42" },
  { code: "SP", label: "La Spezia", regionCode: "IT-42" },
  { code: "SV", label: "Savona", regionCode: "IT-42" },
  { code: "BO", label: "Bologna", regionCode: "IT-45" },
  { code: "FC", label: "Forlì-Cesena", regionCode: "IT-45" },
  { code: "FE", label: "Ferrara", regionCode: "IT-45" },
  { code: "MO", label: "Modena", regionCode: "IT-45" },
  { code: "PC", label: "Piacenza", regionCode: "IT-45" },
  { code: "PR", label: "Parma", regionCode: "IT-45" },
  { code: "RA", label: "Ravenna", regionCode: "IT-45" },
  { code: "RE", label: "Reggio Emilia", regionCode: "IT-45" },
  { code: "RN", label: "Rimini", regionCode: "IT-45" },
  { code: "AR", label: "Arezzo", regionCode: "IT-52" },
  { code: "FI", label: "Firenze", regionCode: "IT-52" },
  { code: "GR", label: "Grosseto", regionCode: "IT-52" },
  { code: "LI", label: "Livorno", regionCode: "IT-52" },
  { code: "LU", label: "Lucca", regionCode: "IT-52" },
  { code: "MS", label: "Massa-Carrara", regionCode: "IT-52" },
  { code: "PI", label: "Pisa", regionCode: "IT-52" },
  { code: "PO", label: "Prato", regionCode: "IT-52" },
  { code: "PT", label: "Pistoia", regionCode: "IT-52" },
  { code: "SI", label: "Siena", regionCode: "IT-52" },
  { code: "PG", label: "Perugia", regionCode: "IT-55" },
  { code: "TR", label: "Terni", regionCode: "IT-55" },
  { code: "AN", label: "Ancona", regionCode: "IT-57" },
  { code: "AP", label: "Ascoli Piceno", regionCode: "IT-57" },
  { code: "FM", label: "Fermo", regionCode: "IT-57" },
  { code: "MC", label: "Macerata", regionCode: "IT-57" },
  { code: "PU", label: "Pesaro e Urbino", regionCode: "IT-57" },
  { code: "FR", label: "Frosinone", regionCode: "IT-62" },
  { code: "LT", label: "Latina", regionCode: "IT-62" },
  { code: "RI", label: "Rieti", regionCode: "IT-62" },
  { code: "RM", label: "Roma", regionCode: "IT-62" },
  { code: "VT", label: "Viterbo", regionCode: "IT-62" },
  { code: "AQ", label: "L'Aquila", regionCode: "IT-65" },
  { code: "CH", label: "Chieti", regionCode: "IT-65" },
  { code: "PE", label: "Pescara", regionCode: "IT-65" },
  { code: "TE", label: "Teramo", regionCode: "IT-65" },
  { code: "CB", label: "Campobasso", regionCode: "IT-67" },
  { code: "IS", label: "Isernia", regionCode: "IT-67" },
  { code: "AV", label: "Avellino", regionCode: "IT-72" },
  { code: "BN", label: "Benevento", regionCode: "IT-72" },
  { code: "CE", label: "Caserta", regionCode: "IT-72" },
  { code: "NA", label: "Napoli", regionCode: "IT-72" },
  { code: "SA", label: "Salerno", regionCode: "IT-72" },
  { code: "BA", label: "Bari", regionCode: "IT-75" },
  { code: "BT", label: "Barletta-Andria-Trani", regionCode: "IT-75" },
  { code: "BR", label: "Brindisi", regionCode: "IT-75" },
  { code: "FG", label: "Foggia", regionCode: "IT-75" },
  { code: "LE", label: "Lecce", regionCode: "IT-75" },
  { code: "TA", label: "Taranto", regionCode: "IT-75" },
  { code: "MT", label: "Matera", regionCode: "IT-77" },
  { code: "PZ", label: "Potenza", regionCode: "IT-77" },
  { code: "CS", label: "Cosenza", regionCode: "IT-78" },
  { code: "CZ", label: "Catanzaro", regionCode: "IT-78" },
  { code: "KR", label: "Crotone", regionCode: "IT-78" },
  { code: "RC", label: "Reggio Calabria", regionCode: "IT-78" },
  { code: "VV", label: "Vibo Valentia", regionCode: "IT-78" },
  { code: "AG", label: "Agrigento", regionCode: "IT-82" },
  { code: "CL", label: "Caltanissetta", regionCode: "IT-82" },
  { code: "CT", label: "Catania", regionCode: "IT-82" },
  { code: "EN", label: "Enna", regionCode: "IT-82" },
  { code: "ME", label: "Messina", regionCode: "IT-82" },
  { code: "PA", label: "Palermo", regionCode: "IT-82" },
  { code: "RG", label: "Ragusa", regionCode: "IT-82" },
  { code: "SR", label: "Siracusa", regionCode: "IT-82" },
  { code: "TP", label: "Trapani", regionCode: "IT-82" },
  { code: "CA", label: "Cagliari", regionCode: "IT-88" },
  { code: "NU", label: "Nuoro", regionCode: "IT-88" },
  { code: "OR", label: "Oristano", regionCode: "IT-88" },
  { code: "SS", label: "Sassari", regionCode: "IT-88" },
  { code: "SU", label: "Sud Sardegna", regionCode: "IT-88" },
  { code: "OG", label: "Ogliastra (storica)", regionCode: "IT-88" },
  { code: "OT", label: "Olbia-Tempio (storica)", regionCode: "IT-88" },
  { code: "VS", label: "Medio Campidano (storica)", regionCode: "IT-88" },
] as const;

export type ItalianProvinceCode = (typeof ITALIAN_PROVINCES)[number]["code"];
export type ProvinceSelection = ItalianProvinceCode | "all";

const regionCodes = new Set<string>(ITALIAN_REGIONS.map(({ code }) => code));
const provinceCodes = new Set<string>(ITALIAN_PROVINCES.map(({ code }) => code));

export function normalizeRegionCode(value: string | null | undefined): RegionSelection {
  const normalized = value?.trim().toUpperCase();
  return normalized && regionCodes.has(normalized)
    ? normalized as ItalianRegionCode
    : "all";
}

export function normalizeProvinceCode(value: string | null | undefined): ProvinceSelection {
  const normalized = value?.trim().toUpperCase();
  return normalized && provinceCodes.has(normalized)
    ? normalized as ItalianProvinceCode
    : "all";
}

export function getRegionLabel(value: string | null | undefined) {
  return ITALIAN_REGIONS.find(({ code }) => code === value)?.label ?? value ?? "Italia";
}

export function getProvinceLabel(value: string | null | undefined) {
  return ITALIAN_PROVINCES.find(({ code }) => code === value)?.label ?? value ?? "Italia";
}

export function filterRecommendationsByProvince(
  recommendations: readonly BeachRecommendation[],
  province: ProvinceSelection,
) {
  if (province === "all") return recommendations;

  return recommendations.filter(({ beach }) => beach.provinceCode === province);
}

export function filterRecommendationsByRegion(
  recommendations: readonly BeachRecommendation[],
  region: RegionSelection,
) {
  if (region === "all") return recommendations;

  return recommendations.filter(({ beach }) => beach.regionCode === region);
}
