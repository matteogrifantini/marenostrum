export type BeachAccess = "facile" | "moderato" | "difficile";

export type BeachPeriod = "all-day" | "morning" | "afternoon";

export type UserIntent = "relax" | "family" | "explore" | "water-sport";

export type SourceQuality = "high" | "medium" | "low";

export type Beach = {
  slug: string;
  name: string;
  municipality: string;
  coast: string;
  description: string;
  orientationDegrees: number;
  shelter: string[];
  tags: string[];
  access: BeachAccess;
  image?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageLicense?: string;
  latitude?: number;
  longitude?: number;
  orientationLabel?: string;
  services?: string[];
  warnings?: string[];
  facts?: string[];
};

export type BeachConditions = {
  observedAt: string;
  sourceQuality: SourceQuality;
  windDirectionDegrees: number;
  windSpeedKmh: number;
  gustSpeedKmh: number;
  waveHeightMeters: number;
  weather: "sereno" | "poco nuvoloso" | "nuvoloso" | "pioggia";
  temperatureCelsius: number;
  date?: string;
  period?: BeachPeriod;
  feelsLikeCelsius?: number;
  waterTemperatureCelsius?: number;
  precipitationProbabilityPercent?: number;
  waveDirectionDegrees?: number;
  cloudCoverPercent?: number;
  seaState?: "calmo" | "mosso" | "agitato";
  hourly?: Array<{
    time: string;
    windSpeedKmh: number;
    gustSpeedKmh: number;
    waveHeightMeters: number;
    temperatureCelsius: number;
    cloudCoverPercent: number;
    precipitationProbabilityPercent?: number;
    waveDirectionDegrees?: number;
    windDirectionDegrees?: number;
    waterTemperatureCelsius?: number;
    weather?: BeachConditions["weather"];
  }>;
};

export type ScoreConfidence = "alta" | "media" | "bassa";

export type BeachRecommendation = {
  beach: Beach;
  conditions: BeachConditions;
  score: number;
  label: string;
  reason: string;
  confidence: ScoreConfidence;
  factors: {
    wind: number;
    sea: number;
    weather: number;
    access: number;
    fit: number;
  };
};
