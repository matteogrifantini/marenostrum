import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BeachRecommendation } from "../domain/beach";
import { NearbyCompass } from "./nearby-compass";

const recommendation: BeachRecommendation = {
  beach: {
    slug: "cala-del-gelsomino",
    name: "Cala del Gelsomino",
    municipality: "Noto",
    coast: "Sud-est",
    description: "Una baia luminosa.",
    orientationDegrees: 120,
    shelter: [],
    tags: [],
    access: "facile",
  },
  conditions: {
    observedAt: "2026-08-23T08:00:00+02:00",
    sourceQuality: "high",
    windDirectionDegrees: 0,
    windSpeedKmh: 8,
    gustSpeedKmh: 12,
    waveHeightMeters: 0.2,
    weather: "sereno",
    temperatureCelsius: 28,
  },
  score: 92,
  label: "Ottima scelta",
  reason: "Condizioni favorevoli.",
  confidence: "alta",
  factors: { wind: 40, sea: 25, weather: 20 },
};

describe("NearbyCompass", () => {
  it("shows the calm-sea shortlist with an honest straight-line distance note", () => {
    render(
      <NearbyCompass
        recommendations={[{ recommendation, distanceKm: 4.2 }]}
        date="2026-08-23"
        period="all-day"
        radiusKm={25}
      />,
    );

    expect(screen.getByRole("heading", { name: "Bussola per te" })).toBeInTheDocument();
    expect(screen.getByText("Mare calmo entro 25 km")).toBeInTheDocument();
    expect(screen.getByText("Distanza in linea d’aria; il tempo in auto può variare.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Apri Cala del Gelsomino" })).toHaveAttribute(
      "href",
      "/spiagge/cala-del-gelsomino?date=2026-08-23&period=all-day&source=nearby",
    );
    expect(screen.getByText("9.2 · 4.2 km")).toBeInTheDocument();
  });

  it("explains when no calm beach is inside the selected radius", () => {
    render(
      <NearbyCompass
        recommendations={[]}
        date="2026-08-23"
        period="all-day"
        radiusKm={5}
      />,
    );

    expect(screen.getByText("Nessuna spiaggia con mare calmo nel raggio selezionato.")).toBeInTheDocument();
  });
});
