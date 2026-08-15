import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeExperience } from "../components/home-experience";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("HomeExperience", () => {
  it("shows four days and updates the ranking heading when the day changes", () => {
    render(
      <HomeExperience initialDate="2026-08-15" initialPeriod="all-day" />,
    );

    expect(screen.getByRole("button", { name: "Oggi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Domani" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "lun 17" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "mar 18" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Le migliori scelte di oggi/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Domani" }));

    expect(
      screen.getByRole("heading", { name: /Le migliori scelte di domani/i }),
    ).toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith("/?date=2026-08-16&period=all-day");
  });

  it("uses period controls and does not expose intent categories", () => {
    render(
      <HomeExperience initialDate="2026-08-15" initialPeriod="all-day" />,
    );

    expect(screen.getByRole("button", { name: "Tutto il giorno" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mattina" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pomeriggio" })).toBeInTheDocument();
    expect(screen.queryByText("Famiglia")).not.toBeInTheDocument();
    expect(screen.queryByText("Selvaggia")).not.toBeInTheDocument();
    expect(screen.queryByText("Acqua calma")).not.toBeInTheDocument();
  });
});
