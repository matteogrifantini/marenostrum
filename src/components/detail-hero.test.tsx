import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getDemoBeachDetail } from "../data/demo-beach-details";
import { DetailHero } from "./detail-hero";

const beach = {
  slug: "cala-del-gelsomino",
  name: "Cala del Gelsomino",
  municipality: "Noto",
  coast: "Sud-est",
  description: "Una baia luminosa.",
  orientationDegrees: 120,
  shelter: ["maestrale"],
  tags: ["relax"],
  access: "facile" as const,
  image: "/images/beaches/cala-del-gelsomino.jpg",
};

describe("DetailHero", () => {
  it("shows the municipality without an invented user distance and opens the vertical beach feed", () => {
    const detail = getDemoBeachDetail(beach.slug)!;

    render(
      <DetailHero
        beach={beach}
        detail={detail}
        date="2026-08-20"
        period="all-day"
      />,
    );

    expect(screen.getByText("Noto")).toBeInTheDocument();
    expect(screen.queryByText(/km da te/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: `Guarda i video · ${detail.reels.length}` }));
    expect(screen.getByRole("dialog", { name: "Video della spiaggia" })).toBeInTheDocument();
    expect(screen.getAllByText(/Scorri per il prossimo video/)).toHaveLength(detail.reels.length - 1);

    fireEvent.click(screen.getByRole("button", { name: "Chiudi video" }));
    expect(screen.queryByRole("dialog", { name: "Video della spiaggia" })).not.toBeInTheDocument();
  });

  it("turns the favorite heart red when the beach is saved", () => {
    const detail = getDemoBeachDetail(beach.slug)!;

    render(
      <DetailHero
        beach={beach}
        detail={detail}
        date="2026-08-20"
        period="all-day"
      />,
    );

    const favorite = screen.getByRole("button", { name: `Salva ${beach.name}` });
    fireEvent.click(favorite);

    expect(favorite).toHaveAttribute("aria-pressed", "true");
    expect(favorite).toHaveClass("text-[var(--score-poor)]");
  });
});
