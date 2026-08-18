import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getDemoBeachDetail } from "../data/demo-beach-details";
import { BeachCommunitySections } from "./beach-community-sections";

describe("BeachCommunitySections", () => {
  it("shows review previews and records a local like or dislike", () => {
    const detail = getDemoBeachDetail("cala-del-gelsomino")!;
    render(<BeachCommunitySections detail={detail} />);

    const reviews = screen.getByRole("region", { name: "Recensioni" });
    expect(within(reviews).getByText(detail.reviews.rating.toFixed(1))).toBeInTheDocument();
    expect(within(reviews).getByText(`${detail.reviews.total} recensioni`)).toBeInTheDocument();
    for (const review of detail.reviews.items.slice(0, 2)) {
      expect(within(reviews).getByText(`“${review.text}”`)).toBeInTheDocument();
    }

    const like = within(reviews).getByRole("button", { name: "Mi piace" });
    fireEvent.click(like);
    expect(like).toHaveAttribute("aria-pressed", "true");
    expect(within(reviews).getByRole("button", { name: "Non mi piace" })).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps recent photos separate from the nearest webcam", () => {
    const detail = getDemoBeachDetail("cala-del-gelsomino")!;
    render(<BeachCommunitySections detail={detail} />);

    const photos = screen.getByRole("region", { name: "Foto aggiunte di recente" });
    expect(within(photos).getAllByRole("img")).toHaveLength(detail.recentPhotos.length);

    const webcam = screen.getByRole("region", { name: "Webcam più vicina" });
    expect(within(webcam).getByText(detail.webcam.name)).toBeInTheDocument();
    expect(within(webcam).getByText(`${detail.webcam.distanceKm.toFixed(1)} km`)).toBeInTheDocument();
    expect(within(webcam).getByText(detail.webcam.updated)).toBeInTheDocument();
  });
});
