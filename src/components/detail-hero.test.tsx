import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { demoRecommendations } from "../data/demo-beaches";
import { getDemoBeachDetail } from "../data/demo-beach-details";
import { DetailHero } from "./detail-hero";

describe("DetailHero", () => {
  it("keeps the score out of the hero and opens the vertical beach feed", () => {
    const recommendation = demoRecommendations[0];
    const detail = getDemoBeachDetail(recommendation.beach.slug)!;

    render(
      <DetailHero
        recommendation={recommendation}
        detail={detail}
        date="2026-08-15"
        period="all-day"
      />,
    );

    expect(screen.queryByLabelText(/Voto .* su 10/)).not.toBeInTheDocument();
    expect(screen.getByText(`${detail.distanceKm} km da te`)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: `Guarda i video · ${detail.reels.length}` }));
    expect(screen.getByRole("dialog", { name: "Video della spiaggia" })).toBeInTheDocument();
    expect(screen.getAllByText(/Scorri per il prossimo video/)).toHaveLength(detail.reels.length - 1);

    fireEvent.click(screen.getByRole("button", { name: "Chiudi video" }));
    expect(screen.queryByRole("dialog", { name: "Video della spiaggia" })).not.toBeInTheDocument();
  });
});
