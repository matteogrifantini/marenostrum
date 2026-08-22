import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BeachConditions } from "../domain/beach";
import { HourlyForecast } from "./hourly-forecast";

const hourly: NonNullable<BeachConditions["hourly"]> = [
  {
    time: "08:00",
    windSpeedKmh: 5,
    gustSpeedKmh: 8,
    waveHeightMeters: 0.2,
    temperatureCelsius: 28,
    cloudCoverPercent: 10,
  },
  {
    time: "10:00",
    windSpeedKmh: 6,
    gustSpeedKmh: 9,
    waveHeightMeters: 0.2,
    temperatureCelsius: 30,
    cloudCoverPercent: 12,
  },
];

describe("HourlyForecast", () => {
  it("presents the next hours as a connected timeline", () => {
    render(<HourlyForecast hourly={hourly} />);

    const timeline = screen.getByRole("list", { name: "Previsioni orarie" });
    const scroller = screen.getByRole("region", { name: "Previsioni orarie scorrevoli" });

    expect(timeline).toBeInTheDocument();
    expect(scroller).toHaveClass("hourly-rail");
    expect(timeline).toHaveClass("gap-3");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("08:00")).toBeInTheDocument();
    expect(screen.getByText("10:00")).toBeInTheDocument();
    const firstHour = screen.getByText("08:00").parentElement;
    const firstCard = firstHour?.querySelector("div.mt-3");
    expect(firstCard).toHaveClass("bg-[var(--surface)]");
    expect(firstCard?.querySelectorAll("p")[1]).toHaveClass("text-[var(--ink)]");
    const dots = timeline.querySelectorAll(".hourly-timeline-dot");
    expect(dots).toHaveLength(2);
    dots.forEach((dot) => expect(dot).toHaveClass("bg-[var(--sea)]"));
    expect(screen.queryByText("Andamento")).not.toBeInTheDocument();
    expect(screen.queryByText("Le prossime ore")).not.toBeInTheDocument();
    expect(screen.queryByText("ogni 2 ore")).not.toBeInTheDocument();
    expect(screen.queryByText("Scorri per vedere le altre ore")).not.toBeInTheDocument();
  });

  it("renders an em dash for a missing hourly wave value", () => {
    render(
      <HourlyForecast
        hourly={[
          {
            ...hourly[0],
            waveHeightMeters: null,
          },
        ]}
      />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
