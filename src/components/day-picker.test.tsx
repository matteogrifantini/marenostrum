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
});
