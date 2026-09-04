"use client";

import { Loader2, LocateFixed } from "lucide-react";
import { useState } from "react";
import type { Coordinates } from "../lib/geo";

const DEFAULT_RADIUS_KM = 25;
const NEARBY_STORAGE_KEY = "marenostrum:nearby:v1";

export function getStoredNearbySelection(): NearbySelection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(NEARBY_STORAGE_KEY) || localStorage.getItem(NEARBY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.radiusKm === "number" &&
      parsed.coordinates &&
      typeof parsed.coordinates.latitude === "number" &&
      typeof parsed.coordinates.longitude === "number"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export function setStoredNearbySelection(selection: NearbySelection | null) {
  if (typeof window === "undefined") return;
  try {
    if (selection) {
      const serialized = JSON.stringify(selection);
      sessionStorage.setItem(NEARBY_STORAGE_KEY, serialized);
      localStorage.setItem(NEARBY_STORAGE_KEY, serialized);
    } else {
      sessionStorage.removeItem(NEARBY_STORAGE_KEY);
      localStorage.removeItem(NEARBY_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

type LocationState = "idle" | "requesting" | "granted" | "denied" | "unsupported";

export type NearbySelection = {
  coordinates: Coordinates;
  radiusKm: number;
};

type NearbyControlProps = {
  value: NearbySelection | null;
  onChange: (selection: NearbySelection | null) => void;
  className?: string;
};

export function NearbyControl({ value, onChange, className = "" }: NearbyControlProps) {
  const [locationState, setLocationState] = useState<LocationState>(value ? "granted" : "idle");
  const isActive = value !== null;

  const handleClick = () => {
    if (isActive) {
      onChange(null);
      setLocationState("idle");
      return;
    }

    if (!navigator.geolocation) {
      setLocationState("unsupported");
      return;
    }

    setLocationState("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocationState("granted");
        const radiusKm = DEFAULT_RADIUS_KM;
        onChange({ coordinates: nextCoordinates, radiusKm });
        setTimeout(() => {
          if (typeof document !== "undefined") {
            document.getElementById("classifica")?.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      },
      () => {
        setLocationState("denied");
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 10_000 },
    );
  };

  return (
    <div data-testid="nearby-control" className={`relative shrink-0 ${className}`.trim()}>
      <button
        type="button"
        aria-pressed={isActive}
        onClick={handleClick}
        disabled={locationState === "requesting"}
        className={[
          "inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full text-sm font-bold transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
          isActive
            ? "bg-[var(--ink)] px-4 text-white shadow-[0_8px_20px_rgba(20,44,57,0.16)]"
            : "bg-[var(--surface)] px-3 text-[var(--ink-soft)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] sm:px-4",
        ].join(" ")}
      >
        {locationState === "requesting" ? (
          <Loader2 aria-hidden="true" size={15} className="shrink-0 animate-spin text-blue-500" />
        ) : (
          <LocateFixed aria-hidden="true" size={15} className={`shrink-0 ${isActive ? "text-blue-400" : ""}`.trim()} />
        )}
        <span>{locationState === "requesting" ? "Posizione in corso…" : "Vicino a me"}</span>
      </button>

      {locationState === "denied" && !isActive ? (
        <span role="alert" className="absolute left-0 top-[calc(100%+0.3rem)] z-30 whitespace-nowrap rounded-md bg-red-600 px-2 py-1 text-[0.68rem] font-bold text-white shadow-md">
          Posizione negata nel browser
        </span>
      ) : null}
    </div>
  );
}
