import { describe, expect, it } from "vitest";
import {
  DEFAULT_USER_PREFERENCES,
  formatDistanceKm,
  formatTemperatureCelsius,
  formatWaveHeightMeters,
  formatWindSpeedKmh,
  parseUserPreferences,
} from "./user-preferences";

describe("user preferences", () => {
  it("keeps safe defaults and ignores unsupported values", () => {
    expect(parseUserPreferences(null)).toEqual(DEFAULT_USER_PREFERENCES);
    expect(parseUserPreferences(JSON.stringify({ distanceUnit: "yards", temperatureUnit: "kelvin" }))).toEqual(
      DEFAULT_USER_PREFERENCES,
    );
  });

  it("formats the selectable units from the canonical forecast values", () => {
    expect(formatDistanceKm(10, "mi")).toBe("6.2 mi");
    expect(formatWindSpeedKmh(10, "mi")).toBe("6.2 mph");
    expect(formatTemperatureCelsius(25, "fahrenheit")).toBe("77°F");
    expect(formatWaveHeightMeters(0.5, "feet")).toBe("1.6 ft");
    expect(formatWindSpeedKmh(10, "km")).toBe("10 km/h");
  });
});
