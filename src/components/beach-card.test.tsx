import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { demoRecommendations } from "../data/demo-beaches";
import { BeachCard } from "./beach-card";

const linkStatus = vi.hoisted(() => ({ pending: false }));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
  useLinkStatus: () => ({ pending: linkStatus.pending }),
}));

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
    expect(screen.getByLabelText(`Voto ${demoRecommendations[0].score} su 100, Ottima scelta`)).toHaveAttribute(
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
    expect(screen.getByLabelText(/Meteo: Sereno/i)).toHaveTextContent(/Sereno/i);
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

  it("keeps a narrow mobile card from clipping the location and wind metric", () => {
    const recommendation = {
      ...demoRecommendations[0],
      beach: { ...demoRecommendations[0].beach, municipality: "Palermo" },
      conditions: {
        ...demoRecommendations[0].conditions,
        windDirectionDegrees: 90,
        windSpeedKmh: 8.1,
      },
    };

    render(
      <BeachCard
        recommendation={recommendation}
        date="2026-08-15"
        period="all-day"
        distanceKm={8.1}
      />,
    );

    expect(screen.getByText("Palermo · 8.1 km")).not.toHaveClass("truncate");
    expect(screen.getByText("E · 8.1 km/h")).not.toHaveClass("truncate");
  });

  it("shows immediate feedback while the beach detail link is pending", () => {
    linkStatus.pending = true;

    try {
      render(
        <BeachCard
          recommendation={demoRecommendations[0]}
          date="2026-08-15"
          period="all-day"
        />,
      );

      expect(screen.getByRole("status", { name: "Apertura scheda spiaggia" })).toBeInTheDocument();
    } finally {
      linkStatus.pending = false;
    }
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

    expect(screen.getByLabelText(new RegExp(`Voto ${score} su 100`))).toHaveAttribute(
      "data-score-tone",
      tone,
    );
  });

  it("renders orientation badges and feature tags for rich decision support", () => {
    render(
      <BeachCard
        recommendation={demoRecommendations[0]}
        date="2026-08-15"
        period="all-day"
      />,
    );

    expect(screen.getByText("Sud-est")).toBeInTheDocument();
    expect(screen.getByText("Acque basse")).toBeInTheDocument();
  });
});
