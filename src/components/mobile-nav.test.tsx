import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MobileNav } from "./mobile-nav";

describe("MobileNav", () => {
  it("keeps only today, map, and settings destinations", () => {
    render(<MobileNav />);

    expect(screen.getByRole("link", { name: "Oggi" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mappa" })).toHaveAttribute(
      "href",
      "/mappa",
    );
    expect(screen.getByRole("button", { name: /Impostazioni/ })).toBeInTheDocument();
    expect(screen.queryByText("Zone")).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Navigazione mobile" })).toHaveClass("lg:hidden");
  });
});
