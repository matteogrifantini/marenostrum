import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DateOption } from "../domain/date-selection";
import { MapDayPeriodPicker } from "./map-day-period-picker";

const options: DateOption[] = [
  { iso: "2026-08-20", label: "Oggi", relativeLabel: "gio 20" },
  { iso: "2026-08-21", label: "Domani", relativeLabel: "ven 21" },
  { iso: "2026-08-22", label: "sab 22", relativeLabel: "sab 22" },
  { iso: "2026-08-23", label: "dom 23", relativeLabel: "dom 23" },
];

describe("MapDayPeriodPicker", () => {
  it("keeps the selected day and its period choices in one compound control", () => {
    render(
      <MapDayPeriodPicker
        options={options}
        date="2026-08-20"
        period="all-day"
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
      />,
    );

    const picker = screen.getByTestId("map-day-period-picker");
    expect(picker).toHaveAttribute("aria-label", "Scegli giorno e periodo");
    expect(screen.getByRole("button", { name: "Oggi" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("group", { name: "Periodo per Oggi" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Tutto il giorno" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Mattina" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Pomeriggio" })).toHaveLength(1);
  });

  it("moves the inline period choices to the newly selected day", () => {
    const onDateChange = vi.fn();
    const { rerender } = render(
      <MapDayPeriodPicker
        options={options}
        date="2026-08-20"
        period="all-day"
        onDateChange={onDateChange}
        onPeriodChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Domani" }));
    expect(onDateChange).toHaveBeenCalledWith("2026-08-21");

    rerender(
      <MapDayPeriodPicker
        options={options}
        date="2026-08-21"
        period="all-day"
        onDateChange={onDateChange}
        onPeriodChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Domani" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("group", { name: "Periodo per Domani" })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Periodo per Oggi" })).not.toBeInTheDocument();
  });

  it("emits a period change from the expanded day", () => {
    const onPeriodChange = vi.fn();

    render(
      <MapDayPeriodPicker
        options={options}
        date="2026-08-20"
        period="all-day"
        onDateChange={vi.fn()}
        onPeriodChange={onPeriodChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pomeriggio" }));
    expect(onPeriodChange).toHaveBeenCalledWith("afternoon");
  });
});
