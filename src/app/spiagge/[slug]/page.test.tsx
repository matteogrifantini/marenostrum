import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BeachForecastBundle } from "../../../data/beach-repository";

const {
  getBeachForecastBundleBySlugMock,
  notFoundMock,
  renderedDetailProps,
} = vi.hoisted(() => ({
  getBeachForecastBundleBySlugMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("not found");
  }),
  renderedDetailProps: {
    current: undefined as unknown,
  },
}));

vi.mock("next/navigation", () => ({ notFound: notFoundMock }));
vi.mock("../../../data/beach-repository", () => ({
  ForecastDataUnavailableError: class ForecastDataUnavailableError extends Error {},
  getBeachForecastBundleBySlug: getBeachForecastBundleBySlugMock,
}));
vi.mock("../../../components/beach-detail-experience", () => ({
  BeachDetailExperience: (props: {
    beach: { name: string };
    dataUnavailable?: boolean;
  }) => {
    renderedDetailProps.current = props;

    return (
      <output>
        {props.beach.name}: {props.dataUnavailable
        ? "Condizioni temporaneamente non disponibili. Riprova tra qualche minuto."
        : "condizioni disponibili"}
      </output>
    );
  },
}));

import { ForecastDataUnavailableError } from "../../../data/beach-repository";
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
  dataUnavailable: false,
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
    renderedDetailProps.current = undefined;
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
    expect(renderedDetailProps.current).toMatchObject({
      beach,
      recommendation: bundle.selected,
      morningRecommendation: bundle.morning,
      afternoonRecommendation: bundle.afternoon,
      date: "2026-08-20",
      period: "morning",
      dataUnavailable: false,
    });
    const props = renderedDetailProps.current as {
      dateOptions: Array<{ iso: string }>;
      detail: Record<string, unknown>;
    };
    expect(props.dateOptions).toEqual(expect.arrayContaining([
      expect.objectContaining({ iso: "2026-08-20" }),
      expect.objectContaining({ iso: "2026-08-21" }),
    ]));
    expect(props.detail).toMatchObject({
      reports: expect.any(Array),
      parkings: expect.any(Array),
      facts: expect.any(Array),
      reviews: expect.any(Object),
      recentPhotos: expect.any(Array),
      reels: expect.any(Array),
      webcam: expect.any(Object),
    });
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
      dataUnavailable: true,
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

  it("passes a repository-declared forecast outage through to the detail experience", async () => {
    getBeachForecastBundleBySlugMock.mockResolvedValue({
      ...bundle,
      dataUnavailable: true,
    });

    render(
      await BeachPage({
        params: Promise.resolve({ slug: beach.slug }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(renderedDetailProps.current).toMatchObject({ dataUnavailable: true });
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it("renders a generic degraded state when even the published catalog is unavailable", async () => {
    getBeachForecastBundleBySlugMock.mockRejectedValue(
      new ForecastDataUnavailableError("Supabase public configuration is missing"),
    );

    render(
      await BeachPage({
        params: Promise.resolve({ slug: beach.slug }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Condizioni non disponibili" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Supabase/)).not.toBeInTheDocument();
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it("keeps a known beach with no community fixture on its live detail page", async () => {
    const repositoryBeach = {
      ...beach,
      slug: "spiaggia-pubblicata-senza-fixture",
      name: "Spiaggia pubblicata",
    };
    const repositoryBundle: BeachForecastBundle = {
      ...bundle,
      beach: repositoryBeach,
      selected: bundle.selected ? { ...bundle.selected, beach: repositoryBeach } : undefined,
    };
    getBeachForecastBundleBySlugMock.mockResolvedValue(repositoryBundle);

    render(
      await BeachPage({
        params: Promise.resolve({ slug: repositoryBeach.slug }),
        searchParams: Promise.resolve({ period: "afternoon" }),
      }),
    );

    expect(screen.getByText(`${repositoryBeach.name}: condizioni disponibili`)).toBeInTheDocument();
    expect(notFoundMock).not.toHaveBeenCalled();
    expect(renderedDetailProps.current).toMatchObject({
      beach: repositoryBeach,
      recommendation: repositoryBundle.selected,
      period: "afternoon",
      detail: {
        reports: [],
        parkings: [],
        facts: [],
        reviews: null,
        recentPhotos: [],
        reels: [],
        webcam: null,
      },
    });
  });
});
