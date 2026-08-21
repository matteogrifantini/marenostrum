import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getDateOptions } from "../domain/date-selection";
import { DayPicker } from "./day-picker";

describe("DayPicker", () => {
  it("marks the selected day and emits a new ISO date", () => {
    const onChange = vi.fn();
    const options = getDateOptions(new Date("2026-08-15T10:00:00+02:00"));

    render(
      <DayPicker options={options} value="2026-08-15" onChange={onChange} />,
    );

    expect(screen.getByRole("button", { name: "Oggi" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: "Domani" }));

    expect(onChange).toHaveBeenCalledWith("2026-08-16");
  });

  it("keeps all four day targets in an equal-width 44px grid", () => {
    const options = getDateOptions(new Date("2026-08-15T10:00:00+02:00"));

    render(<DayPicker options={options} value="2026-08-15" onChange={vi.fn()} />);

    expect(screen.getByRole("group", { name: "Scegli il giorno" })).toHaveClass(
      "grid",
      "grid-cols-4",
    );
    for (const option of options) {
      expect(screen.getByRole("button", { name: option.label })).toHaveClass(
        "min-h-11",
        "min-w-0",
      );
    }
  });

  it("keeps the desktop date control on one line without repeating future dates", () => {
    const options = getDateOptions(new Date("2026-08-15T10:00:00+02:00"));

    render(<DayPicker options={options} value="2026-08-15" onChange={vi.fn()} />);

    expect(screen.getByRole("group", { name: "Scegli il giorno" })).toHaveClass(
      "lg:flex-1",
      "lg:pb-0",
      "bg-[var(--surface-muted)]",
      "p-1",
    );
    expect(screen.getByRole("button", { name: "Oggi" })).toHaveClass(
      "lg:flex",
      "lg:whitespace-nowrap",
      "text-center",
    );
    expect(screen.getByRole("button", { name: "Oggi" })).not.toHaveTextContent("sab 15");
    expect(screen.getByRole("button", { name: "Domani" })).not.toHaveTextContent("dom 16");
    expect(screen.getAllByText("lun 17")).toHaveLength(1);
    expect(screen.getAllByText("mar 18")).toHaveLength(1);
  });
});
