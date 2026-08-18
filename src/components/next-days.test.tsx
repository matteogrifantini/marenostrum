import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BeachPeriod } from "../domain/beach";
import { NextDays, type NextDay } from "./next-days";

const days: NextDay[] = [
  { iso: "2026-08-15", label: "Oggi", score: 92, wind: "7 km/h vento" },
  { iso: "2026-08-16", label: "Domani", score: 88, wind: "9 km/h vento" },
  { iso: "2026-08-17", label: "lun 17", score: 79, wind: "12 km/h vento" },
  { iso: "2026-08-18", label: "mar 18", score: 90, wind: "8 km/h vento" },
];

describe("NextDays", () => {
  it("presents the forecast days as a horizontal timeline", () => {
    render(
      <NextDays
        slug="cala-demo"
        days={days}
        selectedDate="2026-08-15"
        period={"all-day" satisfies BeachPeriod}
      />,
    );

    expect(screen.getByRole("list", { name: "Timeline delle previsioni" })).toBeInTheDocument();
    expect(screen.getByText("Prossimi giorni")).toBeInTheDocument();
    expect(screen.queryByText("Previsioni")).not.toBeInTheDocument();
    expect(screen.queryByText("Scorri per vedere gli altri giorni")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Oggi.*9\.2.*7 km\/h vento/ })).toBeInTheDocument();
  });
});
