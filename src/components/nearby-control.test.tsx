import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NearbyControl, type NearbySelection } from "./nearby-control";

const userLocation = { latitude: 36.8, longitude: 15.1 };

describe("NearbyControl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requests browser geolocation immediately upon clicking 'Vicino a me'", () => {
    const onChange = vi.fn<(selection: NearbySelection | null) => void>();
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
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
    });

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition },
    });

    render(<NearbyControl value={null} onChange={onChange} />);

    // Single click triggers location immediately
    fireEvent.click(screen.getByRole("button", { name: "Vicino a me" }));

    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ coordinates: userLocation, radiusKm: 25 });
  });

  it("toggles off when clicked while already active", () => {
    const onChange = vi.fn<(selection: NearbySelection | null) => void>();
    render(
      <NearbyControl
        value={{ coordinates: userLocation, radiusKm: 25 }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Vicino a me" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("centers the location icon and label inside the control", () => {
    const onChange = vi.fn<(selection: NearbySelection | null) => void>();

    render(<NearbyControl value={null} onChange={onChange} />);

    const button = screen.getByRole("button", { name: "Vicino a me" });
    expect(button).toHaveClass("justify-center");
    expect(button.querySelector("svg")).toHaveClass("shrink-0");
  });

  it("displays alert if location permission is denied by user", () => {
    const onChange = vi.fn<(selection: NearbySelection | null) => void>();
    const getCurrentPosition = vi.fn((_success: PositionCallback, error?: PositionErrorCallback) => {
      error?.({
        code: 1,
        message: "User denied Geolocation",
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError);
    });

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition },
    });

    render(<NearbyControl value={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Vicino a me" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Posizione negata nel browser");
    expect(onChange).not.toHaveBeenCalled();
  });
});
