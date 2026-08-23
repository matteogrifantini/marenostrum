import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MobileNav } from "./mobile-nav";

describe("MobileNav", () => {
  it("keeps beaches, map, and settings destinations", () => {
    render(<MobileNav />);

    expect(screen.getByRole("link", { name: "Spiagge" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mappa" })).toHaveAttribute(
      "href",
      "/mappa",
    );
    expect(screen.getByRole("link", { name: "Impostazioni" })).toHaveAttribute(
      "href",
      "/impostazioni",
    );
    expect(screen.queryByText("Zone")).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Navigazione mobile" })).toHaveClass("lg:hidden");
  });
});
