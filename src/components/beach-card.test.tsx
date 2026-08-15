import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { demoRecommendations } from "../data/demo-beaches";
import { BeachCard } from "./beach-card";

describe("BeachCard", () => {
  it("shows the decision data without relying on color alone", () => {
    render(<BeachCard recommendation={demoRecommendations[0]} />);

    expect(
      screen.getByRole("heading", { name: "Cala del Gelsomino" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ottima scelta")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText(/riparata dal Maestrale/i)).toBeInTheDocument();
    expect(screen.getByText("Aggiornati")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /apri scheda/i }),
    ).toHaveAttribute("href", "/spiagge/cala-del-gelsomino");
  });
});
