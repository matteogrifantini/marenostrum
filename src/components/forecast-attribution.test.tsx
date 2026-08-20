import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ForecastAttribution } from "./forecast-attribution";

describe("ForecastAttribution", () => {
  it("exposes official forecast sources and the exact disclaimer", () => {
    render(<ForecastAttribution />);

    expect(screen.getByRole("link", { name: "Open-Meteo" })).toHaveAttribute(
      "href",
      "https://open-meteo.com/",
    );
    expect(screen.getByRole("link", { name: "DWD" })).toHaveAttribute(
      "href",
      "https://www.dwd.de/",
    );
    expect(
      screen.getByText("Previsioni indicative: non usare per la navigazione."),
    ).toBeInTheDocument();
  });

  it("is a neutral footer rather than a card", () => {
    render(<ForecastAttribution />);

    const footer = screen.getByRole("contentinfo", { name: "Attribuzione previsioni" });
    expect(footer.querySelector("article")).toBeNull();
    expect(footer.querySelector("h1, h2, h3, h4, h5, h6")).toBeNull();
  });
});
