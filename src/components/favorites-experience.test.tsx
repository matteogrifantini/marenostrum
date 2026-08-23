import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { BeachRecommendation } from "../domain/beach";
import { FavoritesExperience } from "./favorites-experience";

const recommendation: BeachRecommendation = {
  beach: {
    slug: "cala-rossa",
    name: "Cala Rossa",
    municipality: "Favignana",
    coast: "Isole Egadi",
    description: "Una cala limpida.",
    orientationDegrees: 20,
    shelter: ["ponente"],
    tags: ["scogliera"],
    access: "difficile",
    image: "/images/beaches/cala-rossa.jpg",
  },
  conditions: {
    observedAt: "2026-08-23T08:00:00.000Z",
    sourceQuality: "high",
    windDirectionDegrees: 270,
    windSpeedKmh: 7,
    gustSpeedKmh: 10,
    waveHeightMeters: 0.2,
    weather: "sereno",
    temperatureCelsius: 29,
  },
  score: 92,
  label: "Ottima scelta",
  reason: "Mare calmo.",
  confidence: "alta",
  factors: { wind: 43, sea: 22, weather: 20 },
};

describe("FavoritesExperience", () => {
  afterEach(() => window.localStorage.clear());

  it("shows the saved beach from local storage", () => {
    window.localStorage.setItem("marenostrum:favorites:v1", JSON.stringify(["cala-rossa"]));

    render(<FavoritesExperience date="2026-08-23" period="all-day" recommendations={[recommendation]} />);

    expect(screen.getByRole("heading", { name: "Cala Rossa" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Spiagge preferite" })).toBeInTheDocument();
  });

  it("updates when a favorite is removed", () => {
    window.localStorage.setItem("marenostrum:favorites:v1", JSON.stringify(["cala-rossa"]));
    render(<FavoritesExperience date="2026-08-23" period="all-day" recommendations={[recommendation]} />);

    fireEvent.click(screen.getByRole("button", { name: "Rimuovi Cala Rossa dai preferiti" }));

    expect(screen.getByRole("heading", { name: "Ancora nessun preferito" })).toBeInTheDocument();
  });
});
