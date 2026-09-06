import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the municipality without an invented user distance and opens the vertical beach feed", () => {
    const detail = getDemoBeachDetail(beach.slug)!;

    render(
      <DetailHero
        beach={beach}
        detail={detail}
        period="all-day"
      />,
    );

    expect(screen.getByText("Noto")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Meteo del mare a Cala del Gelsomino" })).not.toBeInTheDocument();
    expect(screen.queryByText(/km da te/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: `Guarda i video · ${detail.reels.length}` }));
    expect(screen.getByRole("dialog", { name: "Video della spiaggia" })).toBeInTheDocument();
    expect(screen.getAllByText(/Scorri per il prossimo video/)).toHaveLength(detail.reels.length - 1);

    fireEvent.click(screen.getByRole("button", { name: "Chiudi video" }));
    expect(screen.queryByRole("dialog", { name: "Video della spiaggia" })).not.toBeInTheDocument();
  });

  it("opens the beach photo in an accessible viewer", () => {
    const detail = getDemoBeachDetail(beach.slug)!;

    render(
      <DetailHero
        beach={beach}
        detail={detail}
        period="all-day"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: `Apri foto di ${beach.name}` }));

    const photoViewer = screen.getByRole("dialog", { name: `Foto di ${beach.name}` });
    expect(photoViewer).toBeInTheDocument();
    expect(within(photoViewer).getByRole("img", { name: `Foto di ${beach.name}` })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Chiudi foto" }));
    expect(screen.queryByRole("dialog", { name: `Foto di ${beach.name}` })).not.toBeInTheDocument();
  });

  it("turns the favorite heart red when the beach is saved", () => {
    const detail = getDemoBeachDetail(beach.slug)!;

    render(
      <DetailHero
        beach={beach}
        detail={detail}
        period="all-day"
      />,
    );

    const favorite = screen.getByRole("button", { name: `Salva ${beach.name}` });
    fireEvent.click(favorite);

    expect(favorite).toHaveAttribute("aria-pressed", "true");
    expect(favorite).toHaveClass("text-[var(--score-poor)]");
  });

  it("keeps the Google Maps action as a pin beside the favorite without a duplicate directions label", () => {
    const detail = getDemoBeachDetail(beach.slug)!;

    render(
      <DetailHero
        beach={{ ...beach, latitude: 38.1982, longitude: 13.3269 }}
        detail={detail}
        period="all-day"
      />,
    );

    const mapsLink = screen.getByRole("link", { name: "Apri in Google Maps" });
    expect(mapsLink).toHaveAttribute(
      "href",
      "https://www.google.com/maps/dir/?api=1&destination=38.1982,13.3269",
    );
    expect(screen.queryByText("Indicazioni")).not.toBeInTheDocument();
    expect(screen.queryByText("🗺️")).not.toBeInTheDocument();
  });

  it("does not substitute another beach image when the catalog image is missing", () => {
    const detail = getDemoBeachDetail(beach.slug)!;

    render(
      <DetailHero
        beach={{ ...beach, image: undefined }}
        detail={{ ...detail, reels: [] }}
        period="all-day"
      />,
    );

    expect(screen.getByRole("img", { name: `Foto non disponibile per ${beach.name}` })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: `Foto di ${beach.name}` })).not.toBeInTheDocument();
  });

  it("returns to the homepage without carrying a date selected in the detail", () => {
    const detail = getDemoBeachDetail(beach.slug)!;

    render(
      <DetailHero
        beach={beach}
        detail={detail}
        period="afternoon"
      />,
    );

    expect(screen.getByRole("link", { name: "Torna alle spiagge" })).toHaveAttribute(
      "href",
      "/?period=all-day#classifica",
    );
  });

  it("returns to the homepage with the date selected there", () => {
    const detail = getDemoBeachDetail(beach.slug)!;

    render(
      <DetailHero
        beach={beach}
        detail={detail}
        homeDate="2026-08-23"
        period="morning"
      />,
    );

    expect(screen.getByRole("link", { name: "Torna alle spiagge" })).toHaveAttribute(
      "href",
      "/?date=2026-08-23&period=all-day#classifica",
    );
  });

  it("triggers navigator.share with beach details when clicked", async () => {
    const detail = getDemoBeachDetail(beach.slug)!;
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: shareMock,
      writable: true,
      configurable: true,
    });

    render(
      <DetailHero
        beach={beach}
        detail={detail}
        period="all-day"
      />,
    );

    const shareButton = screen.getByRole("button", { name: "Condividi spiaggia" });
    await act(async () => {
      fireEvent.click(shareButton);
    });

    expect(shareMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining(beach.name),
        text: expect.stringContaining(beach.name),
      }),
    );
  });
});
