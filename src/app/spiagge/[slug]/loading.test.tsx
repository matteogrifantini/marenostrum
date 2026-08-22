import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Loading from "./loading";

describe("Beach detail loading state", () => {
  it("shows an immediate, accessible loading shell", () => {
    render(<Loading />);

    expect(screen.getByRole("main", { name: "Caricamento scheda spiaggia" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("status", { name: "Caricamento scheda spiaggia" })).toBeInTheDocument();
  });
});
