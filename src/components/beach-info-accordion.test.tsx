import { render, screen } from "@testing-library/react";
import { useRef } from "react";
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

function AccordionHarness() {
  const panelRef = useRef<HTMLElement | null>(null);

  return (
    <BeachInfoAccordion
      beach={beach}
      detail={detail}
      open
      onToggle={() => undefined}
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
});
