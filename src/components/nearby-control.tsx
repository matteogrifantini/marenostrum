"use client";

import { ChevronDown, LocateFixed } from "lucide-react";
import { useState } from "react";
import type { Coordinates } from "../lib/geo";
import { formatDistanceKm, useUserPreferences } from "../lib/user-preferences";

const DISTANCE_OPTIONS = [5, 10, 25, 50, 100] as const;
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
};

export function NearbyControl({ value, onChange }: NearbyControlProps) {
  const preferences = useUserPreferences();
  const [open, setOpen] = useState(false);
  const [locationState, setLocationState] = useState<LocationState>(value ? "granted" : "idle");
  const [lastCoordinates, setLastCoordinates] = useState<Coordinates | null>(null);
  const coordinates = value?.coordinates ?? lastCoordinates;
  const hasLocation = coordinates !== null && (locationState === "granted" || value !== null);
  const radiusKm = value?.radiusKm ?? DEFAULT_RADIUS_KM;
  const isActive = value !== null;

  const requestLocation = () => {
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
        setLastCoordinates(nextCoordinates);
        setLocationState("granted");
        onChange({ coordinates: nextCoordinates, radiusKm });
      },
      () => setLocationState("denied"),
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 10_000 },
    );
  };

  const changeRadius = (nextRadiusKm: number) => {
    if (!coordinates) return;
    onChange({ coordinates, radiusKm: nextRadiusKm });
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-controls="nearby-filter-popover"
        aria-expanded={open}
        aria-pressed={isActive}
        onClick={() => setOpen((current) => !current)}
        className={[
          "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)] sm:px-4",
          isActive
            ? "bg-[var(--ink)] text-white shadow-[0_8px_20px_rgba(20,44,57,0.16)]"
            : "bg-[var(--surface)] text-[var(--ink-soft)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]",
        ].join(" ")}
      >
        <LocateFixed aria-hidden="true" size={15} />
        Vicino a me
        <ChevronDown aria-hidden="true" size={15} className={open ? "rotate-180" : ""} />
      </button>

      {open ? (
        <div
          id="nearby-filter-popover"
          role="dialog"
          aria-label="Filtro vicino a me"
          className="absolute left-0 top-[calc(100%+0.6rem)] z-30 w-[min(20rem,calc(100vw-2rem))] rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-4 text-left shadow-[0_18px_50px_rgba(20,44,57,0.18)] sm:left-auto sm:right-0"
        >
          {hasLocation && coordinates ? (
            <div>
              <p className="text-sm font-bold text-[var(--ink)]">Quanto vicino?</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                Mostro le spiagge nel raggio scelto e le ordino dalla più vicina.
              </p>
              <label className="mt-4 block text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--muted)]" htmlFor="nearby-radius">
                Distanza massima
              </label>
              <div className="relative mt-2">
                <select
                  id="nearby-radius"
                  aria-label="Distanza da me"
                  value={radiusKm}
                  onChange={(event) => changeRadius(Number(event.target.value))}
                  className="min-h-11 w-full appearance-none rounded-full bg-[var(--surface-muted)] px-4 pr-10 text-sm font-bold text-[var(--ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--sun)]"
                >
                  {DISTANCE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      Entro {formatDistanceKm(option, preferences.distanceUnit)}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                La posizione resta nel browser e serve solo a calcolare le distanze.
              </p>
              {isActive ? (
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="mt-3 min-h-10 text-xs font-bold text-[var(--muted)] underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sun)]"
                >
                  Disattiva filtro vicino a me
                </button>
              ) : null}
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-[var(--ink)]">Trova le spiagge più vicine</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                Autorizza la posizione per calcolare la distanza dalla tua posizione. Non viene salvata.
              </p>
              <button
                type="button"
                onClick={requestLocation}
                disabled={locationState === "requesting"}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-4 text-sm font-bold text-white transition-[transform,background-color] duration-200 ease-out hover:bg-[var(--sea-deep)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
              >
                <LocateFixed aria-hidden="true" size={16} />
                {locationState === "requesting" ? "Cerco la tua posizione…" : "Autorizza la posizione"}
              </button>
              {locationState === "denied" ? (
                <p role="alert" className="mt-3 text-xs leading-5 text-[var(--score-poor)]">
                  Posizione non autorizzata. Abilitala dalle impostazioni del browser e riprova.
                </p>
              ) : null}
              {locationState === "unsupported" ? (
                <p role="alert" className="mt-3 text-xs leading-5 text-[var(--score-poor)]">
                  Questo browser non rende disponibile la posizione.
                </p>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
