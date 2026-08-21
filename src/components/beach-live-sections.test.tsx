import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { demoRecommendations } from "../data/demo-beaches";
import { getDemoBeachDetail } from "../data/demo-beach-details";
import { BeachLiveSections } from "./beach-live-sections";

describe("BeachLiveSections", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

    const reportAction = screen.getByRole("button", { name: "Aggiungi" });
    expect(reportAction).toHaveClass("bg-[var(--sea-soft)]/65");
  });

  it("opens a report composer and publishes a new report", async () => {
    const recommendation = demoRecommendations[0];
    const detail = getDemoBeachDetail(recommendation.beach.slug)!;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        report: {
          id: "community-1",
          emoji: "🌊",
          title: "Acqua",
          detail: "Acqua limpida",
          age: "adesso",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<BeachLiveSections beach={recommendation.beach} detail={detail} />);

    fireEvent.click(screen.getByRole("button", { name: "Aggiungi" }));

    const composer = screen.getByRole("form", { name: "Aggiungi una segnalazione" });
    expect(within(composer).queryByRole("textbox", { name: "Dettaglio (opzionale)" })).not.toBeInTheDocument();
    expect(within(composer).getByRole("button", { name: "Pubblica" })).toBeDisabled();
    expect(within(composer).getByRole("radio", { name: "Acqua" })).toBeInTheDocument();
    fireEvent.click(within(composer).getByRole("radio", { name: "Acqua" }));
    const detailChoices = within(composer).getByRole("group", { name: "Scegli il dettaglio" });
    expect(within(detailChoices).getByRole("radio", { name: "Acqua limpida" })).toBeInTheDocument();
    expect(within(detailChoices).getByRole("radio", { name: "Acqua torbida" })).toBeInTheDocument();

    fireEvent.click(within(composer).getByRole("radio", { name: "Vento" }));
    expect(within(composer).queryByRole("radio", { name: "Acqua limpida" })).not.toBeInTheDocument();
    expect(within(composer).getByRole("radio", { name: "Vento forte" })).toBeInTheDocument();

    fireEvent.click(within(composer).getByRole("radio", { name: "Acqua" }));
    fireEvent.click(within(composer).getByRole("radio", { name: "Acqua limpida" }));
    fireEvent.click(within(composer).getByRole("button", { name: "Pubblica" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/community/reports",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          slug: recommendation.beach.slug,
          category: "water",
          detail: "Acqua limpida",
        }),
      }),
    ));
    await waitFor(() => expect(within(screen.getByRole("list", { name: "Segnalazioni recenti" })).getByText("Acqua limpida")).toBeInTheDocument());
    expect(screen.queryByRole("form", { name: "Aggiungi una segnalazione" })).not.toBeInTheDocument();
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
