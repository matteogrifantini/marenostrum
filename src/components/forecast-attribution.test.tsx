import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ForecastAttribution } from "./forecast-attribution";

describe("ForecastAttribution", () => {
  it("exposes official forecast sources without the verbose disclaimer", () => {
    render(<ForecastAttribution />);

    expect(screen.getByRole("link", { name: "Open-Meteo" })).toHaveAttribute(
      "href",
      "https://open-meteo.com/",
    );
    expect(screen.getByRole("link", { name: "DWD" })).toHaveAttribute(
      "href",
      "https://www.dwd.de/",
    );
    expect(screen.queryByText("Previsioni indicative: non usare per la navigazione.")).not.toBeInTheDocument();
  });

  it("credits the data providers and license", () => {
    render(<ForecastAttribution />);

    expect(screen.getByRole("link", { name: "Open-Meteo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "DWD" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "CC BY 4.0" })).toHaveAttribute(
      "href",
      "https://creativecommons.org/licenses/by/4.0/",
    );
    expect(screen.queryByText("Mare Nostrum aggrega ed elabora i dati.")).not.toBeInTheDocument();
  });

  it("is a neutral footer rather than a card", () => {
    render(<ForecastAttribution />);

    const footer = screen.getByRole("contentinfo", { name: "Attribuzione previsioni" });
    expect(footer.querySelector("article")).toBeNull();
    expect(footer.querySelector("h1, h2, h3, h4, h5, h6")).toBeNull();
  });
});
