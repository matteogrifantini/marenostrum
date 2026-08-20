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
    expect(screen.getByLabelText("Voto 10.0 su 10, Ottima scelta")).toHaveAttribute(
      "data-score-tone",
      "excellent",
    );
    expect(screen.getByLabelText("Vento: NO, 7 km/h")).toBeInTheDocument();
    expect(screen.getByLabelText("Onde: 0.2 m")).toBeInTheDocument();
    expect(screen.queryByText("Raffiche")).not.toBeInTheDocument();
    expect(screen.queryByText("Aria")).not.toBeInTheDocument();
    expect(screen.queryByText("Cielo sereno")).not.toBeInTheDocument();
    expect(screen.queryByText("Mare calmo")).not.toBeInTheDocument();
    expect(screen.queryByText("Parcheggio limitato")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /apri la scheda di cala del gelsomino/i }),
    ).toHaveAttribute(
      "href",
      "/spiagge/cala-del-gelsomino?date=2026-08-15&period=all-day",
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
