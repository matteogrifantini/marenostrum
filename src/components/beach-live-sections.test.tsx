import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { demoRecommendations } from "../data/demo-beaches";
import { getDemoBeachDetail } from "../data/demo-beach-details";
import { BeachLiveSections } from "./beach-live-sections";

describe("BeachLiveSections", () => {
  it("shows three reports first without redundant live-status copy", () => {
    const recommendation = demoRecommendations[0];
    const detail = getDemoBeachDetail(recommendation.beach.slug)!;
    render(<BeachLiveSections beach={recommendation.beach} detail={detail} />);

    expect(screen.getByRole("heading", { name: "Segnalazioni" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "In tempo reale" })).not.toBeInTheDocument();
    expect(screen.queryByText("3 più recenti")).not.toBeInTheDocument();
    expect(screen.queryByText("Aggiornamenti da chi è sul posto")).not.toBeInTheDocument();

    const reports = screen.getByRole("list", { name: "Segnalazioni recenti" });
    expect(within(reports).getAllByRole("listitem")).toHaveLength(3);
    expect(within(reports).getByText("12 min fa")).toHaveClass("text-xs");

    fireEvent.click(screen.getByRole("button", { name: `Mostra tutte · ${detail.reports.length}` }));
    expect(within(reports).getAllByRole("listitem")).toHaveLength(detail.reports.length);
    fireEvent.click(screen.getByRole("button", { name: "Mostra meno" }));
    expect(within(reports).getAllByRole("listitem")).toHaveLength(3);

    const reportAction = screen.getByRole("button", { name: "Pronta" });
    expect(reportAction).toHaveClass("bg-[var(--sea-soft)]/65");
  });

  it("keeps parking and permanent beach information visible", () => {
    const recommendation = demoRecommendations[0];
    const detail = getDemoBeachDetail(recommendation.beach.slug)!;
    render(<BeachLiveSections beach={recommendation.beach} detail={detail} />);

    const parking = screen.getByRole("region", { name: "Parcheggi vicini" });
    for (const option of detail.parkings) {
      expect(within(parking).getByText(option.name)).toBeInTheDocument();
      expect(within(parking).getByText(option.price)).toBeInTheDocument();
    }

    const general = screen.getByRole("region", { name: "Informazioni generali" });
    expect(within(general).queryByText("informazioni generali")).not.toBeInTheDocument();
    for (const fact of detail.facts) {
      expect(within(general).getByText(fact.label)).toBeInTheDocument();
      expect(within(general).getByText(fact.value)).toBeInTheDocument();
    }
  });
});
