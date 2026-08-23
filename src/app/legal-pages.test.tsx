import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PrivacyPage, { metadata as privacyMetadata } from "./privacy/page";
import CookiePage, { metadata as cookieMetadata } from "./cookie/page";
import TerminiPage, { metadata as terminiMetadata } from "./termini/page";

describe("Legal Pages", () => {
  describe("/privacy", () => {
    it("renders the privacy policy page with headings and GDPR context", () => {
      render(<PrivacyPage />);

      expect(
        screen.getByRole("heading", { level: 1, name: "Informativa sulla Privacy" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: /Titolare del Trattamento/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: /Dati Trattati e Finalità/ }),
      ).toBeInTheDocument();
      expect(screen.getAllByText(/contatto privacy prossimamente/).length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText(/Torna alle spiagge/)).toBeInTheDocument();
    });

    it("declares proper canonical metadata for privacy", () => {
      expect(privacyMetadata.title).toBe("Informativa sulla Privacy");
      expect(privacyMetadata.alternates).toEqual({
        canonical: "https://marenostrum.app/privacy",
      });
    });
  });

  describe("/cookie", () => {
    it("renders the cookie policy with technical storage table", () => {
      render(<CookiePage />);

      expect(
        screen.getByRole("heading", { level: 1, name: "Informativa sui Cookie" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Nessun Cookie di Profilazione o Pubblicità/),
      ).toBeInTheDocument();
      expect(
        screen.getByText("marenostrum_community_reporter_v1"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("marenostrum:favorites:v1"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("marenostrum:preferences:v1"),
      ).toBeInTheDocument();
    });

    it("declares proper canonical metadata for cookie", () => {
      expect(cookieMetadata.title).toBe("Informativa sui Cookie");
      expect(cookieMetadata.alternates).toEqual({
        canonical: "https://marenostrum.app/cookie",
      });
    });
  });

  describe("/termini", () => {
    it("renders the terms of service with maritime safety disclaimer and open data credits", () => {
      render(<TerminiPage />);

      expect(
        screen.getByRole("heading", { level: 1, name: "Termini e Condizioni d'Uso" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Disclaimer Fondamentale sulla Sicurezza Balneare/),
      ).toBeInTheDocument();
      expect(
        screen.getAllByText(/Open-Meteo/).length,
      ).toBeGreaterThanOrEqual(1);
      expect(
        screen.getAllByText(/OpenStreetMap/).length,
      ).toBeGreaterThanOrEqual(1);
    });

    it("declares proper canonical metadata for terms", () => {
      expect(terminiMetadata.title).toBe("Termini e Condizioni d'Uso");
      expect(terminiMetadata.alternates).toEqual({
        canonical: "https://marenostrum.app/termini",
      });
    });
  });
});
