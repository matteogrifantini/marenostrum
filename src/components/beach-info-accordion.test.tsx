import { fireEvent, render, screen, within } from "@testing-library/react";
import { useRef, useState } from "react";
import { describe, expect, it } from "vitest";
import type { Beach } from "../domain/beach";
import type { BeachDetailContent } from "../domain/beach-detail-content";
import { BeachInfoAccordion } from "./beach-info-accordion";

const beach: Beach = {
  slug: "cala-rossa-favignana",
  name: "Cala Rossa",
  municipality: "Favignana",
  coast: "Nord-est",
  description: "Una baia tra scogli e acqua trasparente.",
  orientationDegrees: 45,
  shelter: [],
  tags: [],
  access: "difficile",
};

const detail: BeachDetailContent = {
  reports: [],
  parkings: [],
  facts: [
    { emoji: "🏖️", label: "Suolo", value: "Scogli" },
    { emoji: "🌊", label: "Fondale", value: "Roccioso" },
    { emoji: "🧭", label: "Esposizione", value: "Nord-est" },
    { emoji: "🧺", label: "Servizi", value: "Nessuno" },
    { emoji: "🥾", label: "Accesso", value: "Discesa rocciosa" },
    { emoji: "🌿", label: "Ambiente", value: "Costa naturale" },
  ],
  reviews: null,
  reviewProfile: null,
  recentPhotos: [],
  reels: [],
  webcam: null,
};

function AccordionHarness({ open = true }: { open?: boolean }) {
  const panelRef = useRef<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(open);

  return (
    <BeachInfoAccordion
      beach={beach}
      detail={detail}
      open={isOpen}
      onToggle={() => setIsOpen((current) => !current)}
      panelRef={panelRef}
    />
  );
}

describe("BeachInfoAccordion", () => {
  it("separates every row when all six beach categories are present", () => {
    render(<AccordionHarness />);

    const labels = ["Suolo", "Fondale", "Esposizione", "Servizi", "Accesso", "Ambiente"];
    const cells = labels.map((label) => screen.getByText(label).parentElement?.parentElement);

    expect(cells.slice(0, 4).every((cell) => cell?.className.includes("border-b"))).toBe(true);
    expect(cells.slice(4).every((cell) => !cell?.className.includes("border-b"))).toBe(true);
  });

  it("keeps a short preview visible while the full beach information slides open", () => {
    render(<AccordionHarness open={false} />);

    const panel = screen.getByRole("region", { name: "La spiaggia" });
    const preview = within(panel).getByRole("group", { name: "Anteprima della spiaggia" });
    expect(within(preview).getByText("Una baia tra scogli e acqua trasparente.")).toBeInTheDocument();
    expect(within(preview).getByText("Cala Rossa")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scopri la spiaggia" })).toHaveAttribute("aria-expanded", "false");
    expect(panel.querySelector("#beach-info-accordion-content")).toHaveAttribute("aria-hidden", "true");

    fireEvent.click(screen.getByRole("button", { name: "Scopri la spiaggia" }));

    expect(screen.getByRole("button", { name: "Scopri la spiaggia" })).toHaveAttribute("aria-expanded", "true");
    expect(panel.querySelector("#beach-info-accordion-content")).toHaveAttribute("aria-hidden", "false");
    expect(within(panel).getByText("Esposizione")).toBeInTheDocument();
  });
});
