export type BeachAccess = "facile" | "moderato" | "difficile";

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
