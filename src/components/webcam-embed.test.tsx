import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WebcamEmbed } from "./webcam-embed";

describe("WebcamEmbed", () => {
  it("keeps unverified webcams honest while preserving the provider link", () => {
    render(
      <WebcamEmbed
        beachName="Mondello"
        webcam={{
          title: "Spiaggia e Golfo di Mondello",
          embedUrl: "https://provider.example/embed",
          liveUrl: "https://provider.example/live",
          posterUrl: "https://provider.example/poster.jpg",
          provider: "Provider test",
        }}
      />,
    );

    expect(screen.queryByText("LIVE")).not.toBeInTheDocument();

    fireEvent.error(screen.getByRole("img", { name: /anteprima webcam in diretta per spiaggia e golfo di mondello/i }));

    expect(screen.getByText("Anteprima non disponibile")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Apri la pagina della webcam" })).toHaveAttribute(
      "href",
      "https://provider.example/live",
    );
  });
});
