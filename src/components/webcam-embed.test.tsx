import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WebcamEmbed } from "./webcam-embed";

describe("WebcamEmbed", () => {
  it("keeps unverified webcams honest while preserving the provider link", () => {
    const { container } = render(
      <WebcamEmbed
        beachName="Mondello"
        webcam={{
          title: "Spiaggia e Golfo di Mondello",
          embedUrl: "https://provider.example/embed",
          liveUrl: "https://provider.example/live",
          posterUrl: "https://provider.example/poster.jpg",
          provider: "Provider test",
          verifiedLive: false,
        }}
      />,
    );

    expect(container).not.toHaveTextContent(/in diretta|streaming in tempo reale/i);
    expect(screen.queryByText("LIVE")).not.toBeInTheDocument();
    expect(screen.getByRole("heading")).toHaveTextContent("Webcam · Spiaggia e Golfo di Mondello");
    expect(screen.getByRole("img")).toHaveAttribute(
      "alt",
      "Anteprima webcam per Spiaggia e Golfo di Mondello",
    );
    expect(screen.getByText("Fonte esterna; verifica la disponibilità sul sito del provider")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /guarda lo streaming in diretta/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Apri la pagina del provider" })).toHaveLength(2);

    fireEvent.error(screen.getByRole("img"));

    expect(screen.getByText("Anteprima non disponibile")).toBeInTheDocument();
    for (const link of screen.getAllByRole("link", { name: "Apri la pagina del provider" })) {
      expect(link).toHaveAttribute("href", "https://provider.example/live");
    }
  });
});
