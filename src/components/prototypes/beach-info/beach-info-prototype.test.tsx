import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BeachInfoPrototype } from "./beach-info-prototype";

describe("BeachInfoPrototype", () => {
  it("offers four genuinely different beach-information directions", () => {
    render(<BeachInfoPrototype initialVariant={0} />);

    const picker = screen.getByRole("navigation", { name: "Prototype variants" });
    expect(within(picker).getByRole("button", { name: "Slider" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("tablist", { name: "Vista spiaggia" })).toBeInTheDocument();

    fireEvent.click(within(picker).getByRole("button", { name: "Pannello" }));
    expect(screen.getByRole("button", { name: "Apri informazioni" })).toBeInTheDocument();
    expect(screen.queryByRole("tablist", { name: "Vista spiaggia" })).not.toBeInTheDocument();

    fireEvent.click(within(picker).getByRole("button", { name: "Espandi" }));
    expect(screen.getByRole("button", { name: "Scopri la spiaggia" })).toBeInTheDocument();

    fireEvent.click(within(picker).getByRole("button", { name: "Foto + info" }));
    expect(screen.getByRole("button", { name: "Scopri la spiaggia" })).toBeInTheDocument();
  });

  it("opens and closes the information panel in the panel direction", () => {
    render(<BeachInfoPrototype initialVariant={1} />);

    fireEvent.click(screen.getByRole("button", { name: "Apri informazioni" }));

    expect(screen.getByRole("dialog", { name: "Informazioni sulla spiaggia" })).toBeInTheDocument();
    expect(screen.getByText("Caratteristiche della spiaggia")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Chiudi informazioni" }));
    expect(screen.queryByRole("dialog", { name: "Informazioni sulla spiaggia" })).not.toBeInTheDocument();
  });

  it("reveals the information list inline in the expandable direction", () => {
    render(<BeachInfoPrototype initialVariant={2} />);

    expect(screen.queryByText("Caratteristiche della spiaggia")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Scopri la spiaggia" }));

    expect(screen.getByText("Caratteristiche della spiaggia")).toBeInTheDocument();
    expect(screen.getByText("Sabbia chiara e ciottoli fini")).toBeInTheDocument();
  });

  it("reveals the information list from the beach hero in the photo direction", () => {
    const originalScrollIntoView = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });

    render(<BeachInfoPrototype initialVariant={3} />);

    expect(screen.queryByText("Caratteristiche della spiaggia")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Scopri la spiaggia" }));

    expect(screen.getByText("Caratteristiche della spiaggia")).toBeInTheDocument();
    expect(screen.getByText("Sabbia chiara e ciottoli fini")).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    fireEvent.click(screen.getByRole("button", { name: "Nascondi le informazioni" }));
    expect(screen.queryByText("Caratteristiche della spiaggia")).not.toBeInTheDocument();

    if (originalScrollIntoView) {
      Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScrollIntoView);
    } else {
      Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: undefined });
    }
  });
});
