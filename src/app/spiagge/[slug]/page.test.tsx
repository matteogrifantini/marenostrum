import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BeachForecastBundle } from "../../../data/beach-repository";

const {
  getBeachForecastBundleBySlugMock,
  notFoundMock,
} = vi.hoisted(() => ({
  getBeachForecastBundleBySlugMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("not found");
  }),
}));

vi.mock("next/navigation", () => ({ notFound: notFoundMock }));
vi.mock("../../../data/beach-repository", () => ({
  getBeachForecastBundleBySlug: getBeachForecastBundleBySlugMock,
}));
vi.mock("../../../components/beach-detail-experience", () => ({
  BeachDetailExperience: ({
    beach,
    dataUnavailable,
  }: {
    beach: { name: string };
    dataUnavailable?: boolean;
  }) => (
    <output>
      {beach.name}: {dataUnavailable
        ? "Condizioni temporaneamente non disponibili. Riprova tra qualche minuto."
        : "condizioni disponibili"}
    </output>
  ),
}));

import BeachPage from "./page";

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
const bundle: BeachForecastBundle = {
  beach,
  selected: {
    beach,
    conditions: {
      observedAt: "2026-08-20T08:00:00Z",
      sourceQuality: "high",
      windDirectionDegrees: 315,
      windSpeedKmh: 7,
      gustSpeedKmh: 10,
      waveHeightMeters: 0.2,
      weather: "sereno",
      temperatureCelsius: 28,
    },
    score: 92,
    label: "Ottima scelta",
    reason: "Mare calmo.",
    confidence: "alta",
    factors: { wind: 100, sea: 100, weather: 100, access: 100, fit: 100 },
  },
  morning: undefined,
  afternoon: undefined,
};

describe("BeachPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-20T08:00:00+02:00"));
    notFoundMock.mockClear();
  });

  afterEach(() => vi.useRealTimers());

  it("loads the real bundle for the current Rome date and selected period", async () => {
    getBeachForecastBundleBySlugMock.mockResolvedValue(bundle);

    render(
      await BeachPage({
        params: Promise.resolve({ slug: beach.slug }),
        searchParams: Promise.resolve({ period: "morning" }),
      }),
    );

    expect(getBeachForecastBundleBySlugMock).toHaveBeenCalledWith({
      slug: beach.slug,
      date: "2026-08-20",
      period: "morning",
    });
    expect(screen.getByText(`${beach.name}: condizioni disponibili`)).toBeInTheDocument();
  });

  it("uses notFound only when the beach slug is unknown", async () => {
    getBeachForecastBundleBySlugMock.mockResolvedValue(null);

    await expect(
      BeachPage({
        params: Promise.resolve({ slug: "spiaggia-inesistente" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("not found");

    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it("renders a known beach with unavailable forecast copy", async () => {
    getBeachForecastBundleBySlugMock.mockResolvedValue({
      beach,
      selected: undefined,
      morning: undefined,
      afternoon: undefined,
    });

    render(
      await BeachPage({
        params: Promise.resolve({ slug: beach.slug }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(
      screen.getByText(
        `${beach.name}: Condizioni temporaneamente non disponibili. Riprova tra qualche minuto.`,
      ),
    ).toBeInTheDocument();
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});
