import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BeachPeriod } from "../domain/beach";
import { PeriodPicker } from "./period-picker";

describe("PeriodPicker", () => {
  it("renders the period choices as a full-width segmented selector", () => {
    render(<PeriodPicker value="all-day" onChange={vi.fn()} />);

    const group = screen.getByRole("group", { name: "Periodo" });
    expect(group).toHaveClass("grid", "grid-cols-3", "w-full");
    expect(screen.queryByRole("combobox", { name: "Periodo" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tutto il giorno" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Mattina" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Pomeriggio" })).toHaveAttribute("aria-pressed", "false");
  });

  it("emits the selected period", () => {
    const onChange = vi.fn<(value: BeachPeriod) => void>();
    render(<PeriodPicker value="all-day" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Pomeriggio" }));

    expect(onChange).toHaveBeenCalledWith("afternoon");
  });
});
