import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Loading from "./loading";

describe("Impostazioni loading state", () => {
  it("shows an immediate, accessible loading shell", () => {
    render(<Loading />);

    expect(screen.getByRole("main", { name: "Caricamento impostazioni" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("status", { name: "Caricamento impostazioni" })).toBeInTheDocument();
  });
});
