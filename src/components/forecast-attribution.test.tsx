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

  it("can place the parking source beside the weather sources", () => {
    render(<ForecastAttribution includeParkingSource />);

    expect(screen.getByText("Fonti meteo:")).toBeInTheDocument();
    expect(screen.getByText("Parcheggi:")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "© OpenStreetMap contributors" })).toHaveAttribute(
      "href",
      "https://www.openstreetmap.org/copyright",
    );
  });

  it("keeps the update time and score note below the source links", () => {
    render(
      <ForecastAttribution
        freshnessText="Ultimo aggiornamento: 3 settembre 2026, 10:00."
        disclaimer="Indice orientativo · non è un bollettino ufficiale e non misura la qualità dell’acqua."
      />,
    );

    const footer = screen.getByRole("contentinfo", { name: "Attribuzione previsioni" });
    expect(footer).toHaveTextContent("Fonti meteo:");
    expect(footer).toHaveTextContent("Ultimo aggiornamento: 3 settembre 2026, 10:00.");
    expect(footer).toHaveTextContent(/Indice orientativo · non è un bollettino ufficiale/i);
  });

  it("is a neutral footer rather than a card", () => {
    render(<ForecastAttribution />);

    const footer = screen.getByRole("contentinfo", { name: "Attribuzione previsioni" });
    expect(footer.querySelector("article")).toBeNull();
    expect(footer.querySelector("h1, h2, h3, h4, h5, h6")).toBeNull();
  });
});
