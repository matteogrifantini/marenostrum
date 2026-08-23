import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getDemoBeachDetail } from "../data/demo-beach-details";
import { BeachCommunitySections } from "./beach-community-sections";

describe("BeachCommunitySections", () => {
  it("shows review previews without duplicate headings or voting copy", () => {
    const detail = getDemoBeachDetail("cala-del-gelsomino")!;
    render(<BeachCommunitySections detail={detail} />);

    const reviews = screen.getByRole("region", { name: "Recensioni" });
    expect(within(reviews).getAllByRole("heading", { name: "Recensioni" })).toHaveLength(1);
    expect(within(reviews).getByText(detail.reviews.rating.toFixed(1))).toBeInTheDocument();
    expect(within(reviews).getByText(`${detail.reviews.total} recensioni`)).toBeInTheDocument();
    for (const review of detail.reviews.items.slice(0, 2)) {
      expect(within(reviews).getByText(`“${review.text}”`)).toBeInTheDocument();
    }
    expect(within(reviews).queryByText("Questa spiaggia fa per te?")).not.toBeInTheDocument();
    expect(within(reviews).queryByRole("button", { name: "Mi piace" })).not.toBeInTheDocument();
    expect(within(reviews).queryByRole("button", { name: "Non mi piace" })).not.toBeInTheDocument();
  });

  it("keeps recent photos separate from the nearest webcam", () => {
    const detail = getDemoBeachDetail("cala-del-gelsomino")!;
    render(<BeachCommunitySections detail={detail} />);

    const photos = screen.getByRole("region", { name: "Foto aggiunte di recente" });
    expect(within(photos).getAllByRole("img")).toHaveLength(detail.recentPhotos.length);

    const webcam = screen.getByRole("region", { name: "Webcam più vicina" });
    const webcamName = within(webcam).getByText(detail.webcam.name);
    const webcamDistance = within(webcam).getByText(`${detail.webcam.distanceKm!.toFixed(1)} km`);
    expect(webcamDistance.parentElement).toBe(webcamName.parentElement);
    expect(within(webcam).getByText(detail.webcam.updated)).toBeInTheDocument();
  });

  it("opens a recent beach photo in the viewer", () => {
    const detail = getDemoBeachDetail("cala-del-gelsomino")!;
    render(<BeachCommunitySections beachName="Cala del Gelsomino" detail={detail} />);

    const photos = screen.getByRole("region", { name: "Foto aggiunte di recente" });
    fireEvent.click(within(photos).getByRole("button", { name: `Apri foto di ${detail.recentPhotos[0].alt}` }));

    const dialog = screen.getByRole("dialog", { name: "Foto di Cala del Gelsomino" });
    expect(within(dialog).getByRole("img", { name: detail.recentPhotos[0].alt })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Chiudi foto" }));
    expect(screen.queryByRole("dialog", { name: "Foto di Cala del Gelsomino" })).not.toBeInTheDocument();
  });

  it("links to a verified external review profile without fabricating local reviews", () => {
    const detail = getDemoBeachDetail("cala-del-gelsomino")!;
    render(
      <BeachCommunitySections
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
    expect(within(reviews).getByText("Nessuna recensione locale disponibile.")).toBeInTheDocument();
    expect(within(reviews).getByRole("link", { name: "Apri recensioni Google" })).toHaveAttribute(
      "href",
      "https://maps.google.com/?cid=1",
    );
  });

  it("labels an unverified Google search honestly", () => {
    const detail = getDemoBeachDetail("cala-del-gelsomino")!;
    render(
      <BeachCommunitySections
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
    expect(within(reviews).getByText("Profilo Google da confermare.")).toBeInTheDocument();
    expect(within(reviews).getByRole("link", { name: "Cerca su Google Maps" })).toHaveAttribute(
      "href",
      "https://www.google.com/maps/search/?api=1&query=Cala%20del%20Gelsomino",
    );
  });
});
