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

    fireEvent.click(screen.getByRole("button", { name: "Aggiungi" }));
    const composer = screen.getByRole("form", { name: "Aggiungi una segnalazione" });
    fireEvent.click(within(composer).getByRole("radio", { name: "Acqua" }));
    expect(within(composer).getByRole("radio", { name: "Mare calmo" })).toBeInTheDocument();
    expect(within(composer).getByRole("radio", { name: "Mare mosso" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Chiudi" }));

    fireEvent.click(screen.getByRole("button", { name: `Mostra tutte · ${detail.reports.length}` }));
    expect(within(reports).getAllByRole("listitem")).toHaveLength(detail.reports.length);
    fireEvent.click(screen.getByRole("button", { name: "Mostra meno" }));
    expect(within(reports).getAllByRole("listitem")).toHaveLength(3);

    const reportAction = screen.getByRole("button", { name: "Aggiungi" });
    expect(reportAction).toHaveClass("bg-[var(--sun-soft)]", "text-[var(--ink)]");
  });

  it("hides the show-all action when there are only three reports", () => {
    const recommendation = demoRecommendations[0];
    const baseDetail = getDemoBeachDetail(recommendation.beach.slug)!;
    const detail = { ...baseDetail, reports: baseDetail.reports.slice(0, 3) };
    render(<BeachLiveSections beach={recommendation.beach} detail={detail} />);

    expect(screen.queryByRole("button", { name: /Mostra tutte/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aggiungi" })).toHaveClass("bg-[var(--sun-soft)]", "text-[var(--ink)]");
  });

  it("shows how many users reported the same community update", () => {
    const recommendation = demoRecommendations[0];
    const baseDetail = getDemoBeachDetail(recommendation.beach.slug)!;
    const detail = {
      ...baseDetail,
      reports: baseDetail.reports.map((report, index) =>
        index === 0 ? { ...report, confirmations: 3 } : report,
      ),
    };

    render(<BeachLiveSections beach={recommendation.beach} detail={detail} />);

    expect(screen.getByText("3 utenti")).toBeInTheDocument();
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

  it("shows the server rate-limit message when the anonymous daily allowance is exhausted", async () => {
    const recommendation = demoRecommendations[0];
    const detail = getDemoBeachDetail(recommendation.beach.slug)!;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ ok: false, error: "Hai raggiunto il limite giornaliero di segnalazioni" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<BeachLiveSections beach={recommendation.beach} detail={detail} />);

    fireEvent.click(screen.getByRole("button", { name: "Aggiungi" }));
    const composer = screen.getByRole("form", { name: "Aggiungi una segnalazione" });
    fireEvent.click(within(composer).getByRole("radio", { name: "Acqua" }));
    fireEvent.click(within(composer).getByRole("radio", { name: "Mare mosso" }));
    fireEvent.click(within(composer).getByRole("button", { name: "Pubblica" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Hai raggiunto il limite giornaliero di segnalazioni");
  });

  it("keeps parking information visible", () => {
    const recommendation = demoRecommendations[0];
    const detail = getDemoBeachDetail(recommendation.beach.slug)!;
    render(<BeachLiveSections beach={recommendation.beach} detail={detail} />);

    const parking = screen.getByRole("region", { name: "Parcheggi vicini" });
    for (const option of detail.parkings) {
      expect(within(parking).getByText(option.name)).toBeInTheDocument();
      expect(within(parking).queryByText(option.price)).not.toBeInTheDocument();
      expect(
        within(parking).getByRole("link", {
          name: `Cerca per ${option.name} su Google Maps`,
        }),
      ).toBeInTheDocument();
    }

  });

  it("offers an honest Google Maps search when no parking is verified", () => {
    const recommendation = demoRecommendations[0];
    const baseDetail = getDemoBeachDetail(recommendation.beach.slug)!;
    const detail = { ...baseDetail, parkings: [] };
    render(<BeachLiveSections beach={recommendation.beach} detail={detail} />);

    const parking = screen.getByRole("region", { name: "Parcheggi vicini" });
    expect(within(parking).getByText("Nessun parcheggio verificato per questa spiaggia.")).toBeInTheDocument();
    expect(within(parking).getByRole("link", { name: "Cerca parcheggi vicini su Google Maps" })).toHaveAttribute(
      "href",
      "https://www.google.com/maps/search/?api=1&query=Parcheggi%20vicino%20a%20Cala%20del%20Gelsomino%2C%20Noto",
    );
  });

  it("uses a coordinate-based Google Maps route for each parking facility", () => {
    const recommendation = demoRecommendations[0];
    const baseDetail = getDemoBeachDetail(recommendation.beach.slug)!;
    const firstParking = baseDetail.parkings[0];
    const detail = {
      ...baseDetail,
      parkings: baseDetail.parkings.map((parking, index) =>
        index === 0
          ? {
              ...parking,
              directionsUrl:
                "https://www.google.com/maps/dir/?api=1&destination=38.177057%2C12.732108&travelmode=driving",
            }
          : parking,
      ),
    };

    render(<BeachLiveSections beach={recommendation.beach} detail={detail} />);

    expect(
      screen.getByRole("link", {
        name: `Apri percorso per ${firstParking.name} su Google Maps`,
      }),
    ).toHaveAttribute(
      "href",
      "https://www.google.com/maps/dir/?api=1&destination=38.177057%2C12.732108&travelmode=driving",
    );
  });

  it("keeps parking source attribution out of the parking cards", () => {
    const recommendation = demoRecommendations[0];
    const baseDetail = getDemoBeachDetail(recommendation.beach.slug)!;
    const detail = {
      ...baseDetail,
      parkings: baseDetail.parkings.map((parking) => ({
        ...parking,
        sourceUrl: "https://www.openstreetmap.org/way/123",
      })),
    };
    render(<BeachLiveSections beach={recommendation.beach} detail={detail} />);

    expect(within(screen.getByRole("region", { name: "Parcheggi vicini" })).queryByRole("link", { name: "© OpenStreetMap contributors" })).not.toBeInTheDocument();
  });
});
