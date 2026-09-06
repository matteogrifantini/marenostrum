import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_BEACH_FILTERS, type BeachFilters } from "../domain/beach-filters";
import { FilterSheet } from "./filter-sheet";

describe("FilterSheet", () => {
  it("keeps multiple filters selected and only shows checks on active chips", () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    const { rerender } = render(
      <FilterSheet open filters={DEFAULT_BEACH_FILTERS} onChange={onChange} onClose={onClose} />,
    );

    const sand = screen.getByRole("button", { name: "Sabbia" });
    expect(sand).toHaveAttribute("aria-pressed", "false");
    expect(sand.querySelector("svg")).toBeNull();

    fireEvent.click(sand);
    expect(onChange).toHaveBeenLastCalledWith({
      ...DEFAULT_BEACH_FILTERS,
      tags: ["sabbia"],
    });

    const withSand: BeachFilters = { ...DEFAULT_BEACH_FILTERS, tags: ["sabbia"] };
    rerender(<FilterSheet open filters={withSand} onChange={onChange} onClose={onClose} />);
    expect(screen.getByRole("button", { name: "Sabbia" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Sabbia" }).querySelector("svg")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Snorkeling" }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...DEFAULT_BEACH_FILTERS,
      tags: ["sabbia", "snorkeling"],
    });
  });

  it("renders and triggers sheltered and webcam filters when provided", () => {
    const onToggleSheltered = vi.fn();
    const onToggleWebcam = vi.fn();
    const onChange = vi.fn();
    const onClose = vi.fn();

    render(
      <FilterSheet
        open
        filters={DEFAULT_BEACH_FILTERS}
        onChange={onChange}
        onClose={onClose}
        onlySheltered={false}
        onToggleSheltered={onToggleSheltered}
        onlyWebcam={false}
        onToggleWebcam={onToggleWebcam}
      />,
    );

    const shelteredBtn = screen.getByRole("button", { name: /Riparate oggi dal vento/i });
    const webcamBtn = screen.getByRole("button", { name: /Con webcam/i });

    expect(shelteredBtn).toBeInTheDocument();
    expect(webcamBtn).toBeInTheDocument();
    expect(screen.getByText("Condizioni & webcam")).toBeInTheDocument();

    fireEvent.click(shelteredBtn);
    expect(onToggleSheltered).toHaveBeenCalledOnce();

    fireEvent.click(webcamBtn);
    expect(onToggleWebcam).toHaveBeenCalledOnce();
  });
});
