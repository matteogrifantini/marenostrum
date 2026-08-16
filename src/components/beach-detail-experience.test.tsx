import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { demoRecommendations } from "../data/demo-beaches";
import { BeachDetailExperience } from "./beach-detail-experience";

vi.mock("next/navigation", () => ({
  usePathname: () => "/spiagge/cala-del-gelsomino",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("BeachDetailExperience", () => {
  it("keeps the detail view focused without duplicate score or dashboard copy", () => {
    render(
      <BeachDetailExperience
        recommendation={demoRecommendations[0]}
        date="2026-08-15"
        period="all-day"
      />,
    );

    expect(screen.queryByText("Condizioni leggibili")).not.toBeInTheDocument();
    expect(screen.getAllByText("Sicilia score")).toHaveLength(1);
    expect(screen.getByRole("list", { name: "Previsioni orarie" })).toBeInTheDocument();
  });
});
