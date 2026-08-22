import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NearbyControl, type NearbySelection } from "./nearby-control";

const userLocation = { latitude: 36.8, longitude: 15.1 };

describe("NearbyControl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("asks for location before showing distance choices", () => {
    render(<NearbyControl value={null} onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Vicino a me" }));

    expect(screen.getByRole("button", { name: "Autorizza la posizione" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Distanza da me" })).not.toBeInTheDocument();
  });

  it("shows distance choices only after location authorization", () => {
    const onChange = vi.fn<(selection: NearbySelection | null) => void>();
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success: PositionCallback) => {
          success({
            coords: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
              toJSON: () => ({}),
            },
            timestamp: Date.now(),
            toJSON: () => ({}),
          });
        }),
      },
    });

    render(<NearbyControl value={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Vicino a me" }));
    fireEvent.click(screen.getByRole("button", { name: "Autorizza la posizione" }));

    expect(screen.getByRole("combobox", { name: "Distanza da me" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Entro 25 km" })).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Distanza da me" }), {
      target: { value: "50" },
    });

    expect(onChange).toHaveBeenLastCalledWith({ coordinates: userLocation, radiusKm: 50 });
  });
});
