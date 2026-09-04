import { beforeEach, describe, expect, it, vi } from "vitest";

const { getBeachRecommendationsMock, mapExperienceProps } = vi.hoisted(() => ({
  getBeachRecommendationsMock: vi.fn(),
  mapExperienceProps: { current: undefined as Record<string, unknown> | undefined },
}));

vi.mock("../../data/beach-repository", () => ({
  ForecastDataUnavailableError: class ForecastDataUnavailableError extends Error {},
  getBeachRecommendations: getBeachRecommendationsMock,
}));

vi.mock("../../components/map-experience", () => ({
  MapExperience: (props: Record<string, unknown>) => {
    mapExperienceProps.current = props;
    return <div data-testid="map-experience" />;
  },
}));

import MappaPage, { metadata } from "./page";

describe("map page", () => {
  beforeEach(() => {
    getBeachRecommendationsMock.mockReset();
    getBeachRecommendationsMock.mockResolvedValue([]);
    mapExperienceProps.current = undefined;
  });

  it("publishes national social metadata with a share image", () => {
    expect(metadata).toMatchObject({
      title: "Mappa delle spiagge d’Italia",
      description:
        "Esplora la mappa delle spiagge italiane: confronta vento, onde, temperatura dell’acqua, punti utili e condizioni del mare, regione per regione.",
      openGraph: expect.objectContaining({
        images: [
          expect.objectContaining({
            url: "https://marenostrum.app/opengraph-image",
            width: 1200,
            height: 630,
          }),
        ],
      }),
      twitter: expect.objectContaining({
        card: "summary_large_image",
        images: ["https://marenostrum.app/opengraph-image"],
      }),
    });
  });

  it("requests the national preview catalog when no scope filter is provided", async () => {
    await MappaPage({ searchParams: Promise.resolve({}) });

    expect(getBeachRecommendationsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: null,
        nationalPreview: true,
      }),
    );
  });

  it("requests scoped recommendations without national preview when province is provided", async () => {
    await MappaPage({ searchParams: Promise.resolve({ province: "PA" }) });

    expect(getBeachRecommendationsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: { kind: "province", provinceCode: "PA" },
        nationalPreview: false,
      }),
    );
  });
});
