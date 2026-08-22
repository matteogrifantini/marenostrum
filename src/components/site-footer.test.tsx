import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("shows the public disclaimer, sources, and legal navigation", () => {
    render(<SiteFooter />);

    expect(screen.getByRole("contentinfo", { name: "Informazioni e link legali" })).toHaveTextContent(
      "Le informazioni sono orientative",
    );
    expect(screen.getByRole("link", { name: "Open-Meteo" })).toHaveAttribute(
      "href",
      "https://open-meteo.com/",
    );
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "Cookie" })).toHaveAttribute("href", "/cookie");
    expect(screen.getByRole("link", { name: "Termini e condizioni" })).toHaveAttribute(
      "href",
      "/termini",
    );
  });
});
