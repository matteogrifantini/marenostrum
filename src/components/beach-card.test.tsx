import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { demoRecommendations } from "../data/demo-beaches";
import { BeachCard } from "./beach-card";

describe("BeachCard", () => {
  it("shows the photo-first decision data and dated detail link", () => {
    render(
      <BeachCard
        recommendation={demoRecommendations[0]}
        date="2026-08-15"
        period="all-day"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Cala del Gelsomino" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      expect.stringContaining("cala-del-gelsomino.jpg"),
    );
    expect(screen.getAllByText("Ottima scelta")).toHaveLength(1);
    expect(screen.queryByText("Informazioni aggiornate")).not.toBeInTheDocument();
    expect(screen.queryByText(/ore 07:00/)).not.toBeInTheDocument();
    expect(screen.queryByText(/riparata dal Maestrale/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Aggiornato")).not.toBeInTheDocument();
    expect(screen.queryByText("Previsione")).not.toBeInTheDocument();
    expect(screen.queryByText(/Esposta a/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Mare score")).not.toBeInTheDocument();
    expect(screen.getByText("10.0")).toBeInTheDocument();
    expect(screen.getByText(/Noto/)).toBeInTheDocument();
    expect(screen.getAllByText(/Sud-est/)).toHaveLength(1);
    expect(screen.getByText("7 km/h")).toBeInTheDocument();
    expect(screen.getByText("12 km/h")).toBeInTheDocument();
    expect(screen.getByText("0.2 m")).toBeInTheDocument();
    expect(screen.getByText("30°")).toBeInTheDocument();
    expect(screen.getByText("Cielo sereno")).toBeInTheDocument();
    expect(screen.getByText("Mare calmo")).toBeInTheDocument();
    expect(screen.getByText("Parcheggio limitato")).toBeInTheDocument();
    expect(screen.queryByText("Fondale basso")).not.toBeInTheDocument();
    expect(screen.queryByText("Sabbia e ciottoli")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /scopri la spiaggia/i }),
    ).toHaveAttribute(
      "href",
      "/spiagge/cala-del-gelsomino?date=2026-08-15&period=all-day",
    );
  });

  it("changes the live weather signal when the selected forecast changes", () => {
    const rainyRecommendation = {
      ...demoRecommendations[0],
      conditions: {
        ...demoRecommendations[0].conditions,
        weather: "pioggia" as const,
      },
    };

    render(
      <BeachCard
        recommendation={rainyRecommendation}
        date="2026-08-15"
        period="all-day"
      />,
    );

    expect(screen.getByText("Pioggia possibile")).toBeInTheDocument();
    expect(screen.queryByText("Cielo sereno")).not.toBeInTheDocument();
  });
});
