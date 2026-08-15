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
    expect(screen.getAllByText("Ottima scelta")).toHaveLength(2);
    expect(screen.getByText("10.0")).toBeInTheDocument();
    expect(screen.getByText(/Noto/)).toBeInTheDocument();
    expect(screen.getAllByText(/Sud-est/)).toHaveLength(2);
    expect(screen.getByText("7 km/h")).toBeInTheDocument();
    expect(screen.getByText("12 km/h")).toBeInTheDocument();
    expect(screen.getByText("0.2 m")).toBeInTheDocument();
    expect(screen.getByText("30°")).toBeInTheDocument();
    expect(screen.getByText(/riparata dal Maestrale/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /scopri la spiaggia/i }),
    ).toHaveAttribute(
      "href",
      "/spiagge/cala-del-gelsomino?date=2026-08-15&period=all-day",
    );
  });
});
