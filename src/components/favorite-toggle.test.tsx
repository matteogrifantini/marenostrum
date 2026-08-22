import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FavoriteToggle } from "./favorite-toggle";

const storageKey = "marenostrum:favorites:v1";

describe("FavoriteToggle", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("persists a favorite and reads it again after remount", () => {
    const { unmount } = render(
      <FavoriteToggle beachSlug="cala-rossa" beachName="Cala Rossa" />,
    );

    const favorite = screen.getByRole("button", { name: "Salva Cala Rossa" });
    expect(favorite).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(favorite);

    expect(screen.getByRole("button", { name: "Rimuovi Cala Rossa dai preferiti" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(JSON.parse(window.localStorage.getItem(storageKey) ?? "null")).toEqual([
      "cala-rossa",
    ]);

    unmount();
    render(<FavoriteToggle beachSlug="cala-rossa" beachName="Cala Rossa" />);

    expect(screen.getByRole("button", { name: "Rimuovi Cala Rossa dai preferiti" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
