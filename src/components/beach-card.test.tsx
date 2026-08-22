import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { demoRecommendations } from "../data/demo-beaches";
import { BeachCard } from "./beach-card";

describe("BeachCard", () => {
  it("shows only the compact decision data and dated detail link", () => {
    render(
      <BeachCard
        recommendation={demoRecommendations[0]}
        date="2026-08-15"
        period="all-day"
        distanceKm={18}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Cala del Gelsomino" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      expect.stringContaining("cala-del-gelsomino.jpg"),
    );
    expect(screen.getByText("Noto · 18 km")).toBeInTheDocument();
    expect(screen.getByLabelText("Voto 9.6 su 10, Ottima scelta")).toHaveAttribute(
      "data-score-tone",
      "excellent",
    );
    expect(screen.getByLabelText("Vento: NO, 7 km/h")).toBeInTheDocument();
    expect(screen.getByLabelText("Onde: 0.2 m")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salva Cala del Gelsomino" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.queryByText("Raffiche")).not.toBeInTheDocument();
    expect(screen.queryByText("Aria")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Cielo: Sereno")).toHaveTextContent("Cielo · Sereno");
    expect(screen.queryByText("Mare calmo")).not.toBeInTheDocument();
    expect(screen.queryByText("Parcheggio limitato")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /apri la scheda di cala del gelsomino/i }),
    ).toHaveAttribute(
      "href",
      "/spiagge/cala-del-gelsomino?date=2026-08-15&period=all-day&source=home",
    );
  });

  it("opens a homepage-selected beach on all-day while preserving its date origin", () => {
    render(
      <BeachCard
        recommendation={demoRecommendations[0]}
        date="2026-08-16"
        period="morning"
      />,
    );

    expect(screen.getByRole("link", { name: /apri la scheda di cala del gelsomino/i })).toHaveAttribute(
      "href",
      "/spiagge/cala-del-gelsomino?date=2026-08-16&period=all-day&source=home",
    );
  });

  it("shows the municipality without a fabricated distance when it is unavailable", () => {
    render(
      <BeachCard
        recommendation={demoRecommendations[0]}
        date="2026-08-20"
        period="all-day"
      />,
    );

    expect(screen.getByText("Noto")).not.toHaveTextContent("km");
  });

  it("does not borrow another beach image when this beach has no image", () => {
    render(
      <BeachCard
        recommendation={{
          ...demoRecommendations[0],
          beach: { ...demoRecommendations[0].beach, image: undefined },
        }}
        date="2026-08-20"
        period="all-day"
      />,
    );

    expect(screen.getByRole("img", { name: "Foto non disponibile per Cala del Gelsomino" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Foto di Cala del Gelsomino" })).not.toBeInTheDocument();
  });

  it("uses the same concise aggregate metric text visually and in accessible labels", () => {
    const recommendation = {
      ...demoRecommendations[0],
      conditions: {
        ...demoRecommendations[0].conditions,
        windSpeedKmh: 11.981818181818182,
        waveHeightMeters: 0.29999999999999999,
      },
    };

    render(
      <BeachCard
        recommendation={recommendation}
        date="2026-08-15"
        period="all-day"
      />,
    );

    expect(screen.getByLabelText("Vento: NO, 12 km/h")).toHaveTextContent(
      "NO · 12 km/h",
    );
    expect(screen.getByLabelText("Onde: 0.3 m")).toHaveTextContent("0.3 m");
  });

  it.each([
    [95, "excellent"],
    [80, "good"],
    [65, "caution"],
    [50, "poor"],
  ])("maps score %i to the %s visual tone", (score, tone) => {
    render(
      <BeachCard
        recommendation={{ ...demoRecommendations[0], score }}
        date="2026-08-15"
        period="all-day"
        distanceKm={18}
      />,
    );

    expect(screen.getByLabelText(new RegExp(`Voto ${(score / 10).toFixed(1)}`))).toHaveAttribute(
      "data-score-tone",
      tone,
    );
  });
});
