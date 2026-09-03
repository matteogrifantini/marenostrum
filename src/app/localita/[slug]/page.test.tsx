import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAllPublishedBeachesMock,
  getBeachRecommendationsMock,
  notFoundMock,
} = vi.hoisted(() => ({
  getAllPublishedBeachesMock: vi.fn(),
  getBeachRecommendationsMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("not found");
  }),
}));

vi.mock("next/navigation", () => ({ notFound: notFoundMock }));
vi.mock("../../../data/beach-repository", () => ({
  ForecastDataUnavailableError: class ForecastDataUnavailableError extends Error {},
  getAllPublishedBeaches: getAllPublishedBeachesMock,
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

import TerritoryHubPage, { generateMetadata } from "./page";

describe("TerritoryHubPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-03T09:00:00+02:00"));
    getAllPublishedBeachesMock.mockReset();
    getAllPublishedBeachesMock.mockResolvedValue([]);
    getBeachRecommendationsMock.mockReset();
    getBeachRecommendationsMock.mockResolvedValue([]);
    notFoundMock.mockClear();
  });

  it("marks an empty territory hub as noindex", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "messina" }),
    });

    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it("keeps the territory page shell national while the hub remains location-specific", async () => {
    render(
      await TerritoryHubPage({
        params: Promise.resolve({ slug: "palermo" }),
      }),
    );

    expect(screen.getByRole("link", { name: "Mare Nostrum" })).toHaveAttribute("href", "/");
    expect(getBeachRecommendationsMock).toHaveBeenCalledWith(expect.objectContaining({
      scope: { kind: "province", provinceCode: "PA" },
    }));
    expect(
      screen.getByText(
        "Stiamo verificando le prime spiagge di Palermo e provincia. Nel frattempo puoi esplorare la mappa nazionale.",
      ),
    ).toBeInTheDocument();
  });
});
