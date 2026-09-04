import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getDemoBeachDetail } from "../data/demo-beach-details";
import { BeachCommunitySections } from "./beach-community-sections";

describe("BeachCommunitySections", () => {
  it("keeps internal review text, totals and publishing controls out of the detail", () => {
    const detail = getDemoBeachDetail("cala-del-gelsomino")!;
    render(<BeachCommunitySections detail={detail} />);

    const reviews = screen.getByRole("region", { name: "Recensioni" });
    expect(within(reviews).getAllByRole("heading", { name: "Recensioni" })).toHaveLength(1);
    expect(within(reviews).getByText("Recensioni su Google Maps")).toBeInTheDocument();
    expect(within(reviews).queryByText("Recensioni della community")).not.toBeInTheDocument();
    expect(within(reviews).queryByText(`${detail.reviews.total} recensioni`)).not.toBeInTheDocument();
    for (const review of detail.reviews.items) {
      expect(within(reviews).queryByText(`“${review.text}”`)).not.toBeInTheDocument();
    }
    expect(within(reviews).queryByText("La tua valutazione")).not.toBeInTheDocument();
    expect(within(reviews).queryByRole("textbox")).not.toBeInTheDocument();
    expect(within(reviews).queryByText("Accedi per recensire")).not.toBeInTheDocument();
  });

  it("renders verified stars and Google Maps review link for verified profile", () => {
    const detail = getDemoBeachDetail("cala-del-gelsomino")!;
    render(
      <BeachCommunitySections
        beachName="Cala del Gelsomino"
        detail={{
          ...detail,
          reviews: null,
          reviewProfile: {
            provider: "google",
            mapsUrl: "https://maps.google.com/?cid=1",
            verificationStatus: "verified",
          },
        }}
      />,
    );

    const reviews = screen.getByRole("region", { name: "Recensioni" });
    expect(within(reviews).getByText("★★★★★")).toBeInTheDocument();
    expect(
      within(reviews).getByRole("link", { name: "Vedi recensioni di Cala del Gelsomino su Google Maps" }),
    ).toHaveAttribute("href", "https://maps.google.com/?cid=1");
  });

  it("renders an accessible link to Google Maps even for draft review profiles", () => {
    const detail = getDemoBeachDetail("cala-del-gelsomino")!;
    render(
      <BeachCommunitySections
        beachName="Cala del Gelsomino"
        detail={{
          ...detail,
          reviews: null,
          reviewProfile: {
            provider: "google",
            mapsUrl: "https://www.google.com/maps/search/?api=1&query=Cala%20del%20Gelsomino",
            verificationStatus: "draft",
          },
        }}
      />,
    );

    const reviews = screen.getByRole("region", { name: "Recensioni" });
    expect(within(reviews).getByText("Recensioni su Google Maps")).toBeInTheDocument();
    expect(
      within(reviews).getByRole("link", { name: "Vedi recensioni di Cala del Gelsomino su Google Maps" }),
    ).toHaveAttribute("href", "https://www.google.com/maps/search/?api=1&query=Cala%20del%20Gelsomino");
  });

  it("keeps recent beach photos in their separate content section", () => {
    const detail = getDemoBeachDetail("cala-del-gelsomino")!;
    render(<BeachCommunitySections beachName="Cala del Gelsomino" detail={detail} />);

    const photos = screen.getByRole("region", { name: "Foto aggiunte di recente" });
    expect(within(photos).getAllByRole("img")).toHaveLength(detail.recentPhotos.length);

    fireEvent.click(within(photos).getByRole("button", { name: `Apri foto di ${detail.recentPhotos[0].alt}` }));
    const dialog = screen.getByRole("dialog", { name: "Foto di Cala del Gelsomino" });
    expect(within(dialog).getByRole("img", { name: detail.recentPhotos[0].alt })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Chiudi foto" }));
    expect(screen.queryByRole("dialog", { name: "Foto di Cala del Gelsomino" })).not.toBeInTheDocument();
  });
});
