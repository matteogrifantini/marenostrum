import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getBeachRecommendationsMock,
  notFoundMock,
} = vi.hoisted(() => ({
  getBeachRecommendationsMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("not found");
  }),
}));

vi.mock("next/navigation", () => ({ notFound: notFoundMock }));
vi.mock("../../../data/beach-repository", () => ({
  ForecastDataUnavailableError: class ForecastDataUnavailableError extends Error {},
  getBeachRecommendations: getBeachRecommendationsMock,
}));
vi.mock("../../../components/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("../../../components/mobile-nav", () => ({
  MobileNav: () => <nav aria-label="Mobile nav" />,
}));
vi.mock("../../../components/beach-card", () => ({
  BeachCard: () => <div>Beach card</div>,
}));

import TerritoryHubPage from "./page";

describe("TerritoryHubPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-03T09:00:00+02:00"));
    getBeachRecommendationsMock.mockReset();
    getBeachRecommendationsMock.mockResolvedValue([]);
    notFoundMock.mockClear();
  });

  it("keeps the territory page shell national while the hub remains location-specific", async () => {
    render(
      await TerritoryHubPage({
        params: Promise.resolve({ slug: "palermo" }),
      }),
    );

    expect(screen.getByRole("link", { name: "Mare Nostrum" })).toHaveAttribute("href", "/");
    expect(
      screen.getByText(
        "Stiamo verificando le prime spiagge di Palermo e provincia. Nel frattempo puoi esplorare la mappa nazionale.",
      ),
    ).toBeInTheDocument();
  });
});
