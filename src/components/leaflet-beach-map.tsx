"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import type { BeachRecommendation } from "../domain/beach";
import { formatScoreOutOf100 } from "../domain/score";
import {
  MAP_POI_CATEGORIES,
  type MapPoi,
  type MapPoiCategory,
} from "../domain/map-poi";
import type { MapNearbySelection } from "../domain/map-filtering";
import {
  hasMapCoordinates,
  type MappableRecommendation,
} from "../domain/map-markers";

type LeafletBeachMapProps = {
  recommendations: BeachRecommendation[];
  selectedSlug: string | null;
  onSelectBeach: (slug: string) => void;
  nearbySelection: MapNearbySelection | null;
};

type PoiState =
  | "idle"
  | "loading"
  | "ready"
  | "zoom-in"
  | "viewport-too-large"
  | "provider-unavailable";

type PoiResponse = {
  places?: MapPoi[];
  reason?: PoiState | null;
  degraded?: boolean;
};

const SICILY_BOUNDS: Leaflet.LatLngBoundsExpression = [
  [36.35, 11.25],
  [38.85, 15.75],
];

const ESRI_IMAGERY_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const ESRI_LABEL_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
const MAP_ATTRIBUTION =
  '<a href="https://leafletjs.com/" target="_blank" rel="noreferrer">Leaflet</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>, Powered by <a href="https://www.esri.com/" target="_blank" rel="noreferrer">Esri</a> | Earthstar Geographics, Esri, TomTom, Garmin, FAO, METI/NASA, USGS';

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

function scoreTone(score: number) {
  if (score >= 80) return "good";
  if (score >= 60) return "fair";
  return "poor";
}

function poiIcon(category: MapPoiCategory) {
  if (category === "parking") return "🅿️";
  if (category === "lido") return "🏖️";
  return "🚿";
}

function poiLabel(category: MapPoiCategory) {
  if (category === "parking") return "Parcheggio";
  if (category === "lido") return "Lido";
  return "Servizio mare";
}

function createPoiPopup(place: MapPoi) {
  const name = escapeHtml(place.name);
  const label = poiLabel(place.category);
  return `<div class="map-popup map-popup--poi"><div class="map-popup__eyebrow">${poiIcon(place.category)} ${label}</div><strong>${name}</strong><a href="${escapeHtml(place.sourceUrl)}" target="_blank" rel="noreferrer">Fonte OpenStreetMap</a></div>`;
}

function createBeachPopup(recommendation: MappableRecommendation) {
  const { beach, score } = recommendation;
  const scoreValue = formatScoreOutOf100(score);
  return `<div class="map-popup map-popup--beach"><div class="map-popup__eyebrow">Rating Mare Nostrum</div><strong>${escapeHtml(beach.name)}</strong><span class="map-popup__score">${scoreValue}</span><a href="/spiagge/${encodeURIComponent(beach.slug)}?date=${encodeURIComponent(recommendation.conditions.date ?? "")}&period=${encodeURIComponent(recommendation.conditions.period ?? "all-day")}&source=map">Apri la spiaggia</a></div>`;
}

function isPoiResponse(value: unknown): value is PoiResponse {
  return typeof value === "object" && value !== null;
}

export function LeafletBeachMap({
  recommendations,
  selectedSlug,
  onSelectBeach,
  nearbySelection,
}: LeafletBeachMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const ratingLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const poiLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const userLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const ratingMarkersRef = useRef(new Map<string, Leaflet.Marker>());
  const requestPlacesRef = useRef<((map: Leaflet.Map) => void) | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [poiState, setPoiState] = useState<PoiState>("idle");

  useEffect(() => {
    requestPlacesRef.current = (map) => {
      const leaflet = leafletRef.current;
      const poiLayer = poiLayerRef.current;
      if (!leaflet || !poiLayer) return;

      const bounds = map.getBounds();
      const bbox = [
        bounds.getSouth(),
        bounds.getWest(),
        bounds.getNorth(),
        bounds.getEast(),
      ]
        .map((coordinate) => coordinate.toFixed(5))
        .join(",");
      const controller = new AbortController();
      requestControllerRef.current?.abort();
      requestControllerRef.current = controller;
      setPoiState("loading");

      void fetch(
        `/api/map/places?bbox=${bbox}&zoom=${map.getZoom().toFixed(1)}`,
        { signal: controller.signal },
      )
        .then(async (response) => {
          if (!response.ok) throw new Error("POI request failed");
          const payload: unknown = await response.json();
          return isPoiResponse(payload) ? payload : {};
        })
        .then((payload) => {
          if (controller.signal.aborted) return;
          poiLayer.clearLayers();

          if (payload.reason === "zoom-in" || payload.reason === "viewport-too-large") {
            setPoiState(payload.reason);
            return;
          }
          if (payload.degraded || payload.reason === "provider-unavailable") {
            setPoiState("provider-unavailable");
            return;
          }

          for (const place of Array.isArray(payload.places) ? payload.places : []) {
            if (!MAP_POI_CATEGORIES.includes(place.category)) continue;

            const marker = leaflet.marker([place.latitude, place.longitude], {
              icon: leaflet.divIcon({
                className: `map-poi-marker map-poi-marker--${place.category}`,
                html: `<span aria-hidden="true">${poiIcon(place.category)}</span>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
              }),
              title: `${poiLabel(place.category)}: ${place.name}`,
              alt: `${poiLabel(place.category)}: ${place.name}`,
              keyboard: true,
            });
            marker.bindPopup(createPoiPopup(place), { className: "map-popup-wrapper" });
            marker.addTo(poiLayer);
          }
          setPoiState("ready");
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          poiLayer.clearLayers();
          setPoiState(error instanceof Error ? "provider-unavailable" : "provider-unavailable");
        });
    };

    if (mapRef.current) requestPlacesRef.current(mapRef.current);
  }, []);

  useEffect(() => {
    let disposed = false;
    let map: Leaflet.Map | null = null;
    const ratingMarkers = ratingMarkersRef.current;

    void import("leaflet").then((leaflet) => {
      if (disposed || !containerRef.current) return;

      leafletRef.current = leaflet;
      map = leaflet.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 6,
        maxZoom: 19,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
      });
      mapRef.current = map;

      leaflet
        .tileLayer(ESRI_IMAGERY_TILES, {
          attribution: MAP_ATTRIBUTION,
          maxZoom: 19,
          maxNativeZoom: 18,
        })
        .addTo(map);
      leaflet
        .tileLayer(ESRI_LABEL_TILES, {
          maxZoom: 19,
          maxNativeZoom: 18,
          opacity: 0.92,
        })
        .addTo(map);
      leaflet.control.zoom({ position: "topright" }).addTo(map);
      leaflet.control.attribution({ prefix: false }).addTo(map);

      ratingLayerRef.current = leaflet.layerGroup().addTo(map);
      poiLayerRef.current = leaflet.layerGroup().addTo(map);
      userLayerRef.current = leaflet.layerGroup().addTo(map);
      map.fitBounds(SICILY_BOUNDS, { padding: [16, 16], maxZoom: 8.5 });

      const handleViewportChange = () => requestPlacesRef.current?.(map as Leaflet.Map);
      map.on("moveend", handleViewportChange);
      setMapReady(true);
      requestPlacesRef.current?.(map);
    });

    return () => {
      disposed = true;
      requestControllerRef.current?.abort();
      requestControllerRef.current = null;
      map?.remove();
      mapRef.current = null;
      leafletRef.current = null;
      ratingLayerRef.current = null;
      poiLayerRef.current = null;
      userLayerRef.current = null;
      ratingMarkers.clear();
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const ratingLayer = ratingLayerRef.current;
    if (!mapReady || !leaflet || !ratingLayer) return;

    ratingLayer.clearLayers();
    ratingMarkersRef.current.clear();
    for (const recommendation of recommendations) {
      if (!hasMapCoordinates(recommendation)) continue;
      const { beach, score } = recommendation;
      const scoreValue = formatScoreOutOf100(score);
      const selected = beach.slug === selectedSlug;
      const marker = leaflet.marker([beach.latitude, beach.longitude], {
        icon: leaflet.divIcon({
          className: `map-rating-marker map-rating-marker--${scoreTone(score)}${selected ? " map-rating-marker--selected" : ""}`,
          html: `<span>${scoreValue}</span>`,
          iconSize: [58, 38],
          iconAnchor: [29, 19],
        }),
        title: `${beach.name}: voto ${scoreValue}`,
        alt: `${beach.name}: voto ${scoreValue}`,
        keyboard: true,
        zIndexOffset: selected ? 1000 : 0,
      });
      marker.on("click", () => onSelectBeach(beach.slug));
      marker.bindTooltip(`${beach.name} · ${scoreValue}`, {
        direction: "top",
        offset: [0, -16],
        className: "map-tooltip",
      });
      marker.bindPopup(createBeachPopup(recommendation), { className: "map-popup-wrapper" });
      marker.addTo(ratingLayer);
      ratingMarkersRef.current.set(beach.slug, marker);
    }
  }, [mapReady, onSelectBeach, recommendations, selectedSlug]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedSlug) return;

    const marker = ratingMarkersRef.current.get(selectedSlug);
    if (!marker) return;

    const map = mapRef.current;
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 12), { duration: 0.45 });
    marker.openPopup();
  }, [mapReady, selectedSlug]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    const userLayer = userLayerRef.current;
    if (!mapReady || !leaflet || !map || !userLayer) return;

    userLayer.clearLayers();
    if (!nearbySelection) return;

    const { latitude, longitude } = nearbySelection.coordinates;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    const radius = Math.max(0.5, nearbySelection.radiusKm) * 1000;
    const circle = leaflet.circle([latitude, longitude], {
      radius,
      color: "#0f7890",
      weight: 2,
      opacity: 0.85,
      fillColor: "#52bfd0",
      fillOpacity: 0.14,
      interactive: false,
    }).addTo(userLayer);
    leaflet
      .circleMarker([latitude, longitude], {
        radius: 8,
        color: "#ffffff",
        weight: 3,
        fillColor: "#0f7890",
        fillOpacity: 1,
        bubblingMouseEvents: false,
      })
      .bindTooltip("La tua posizione", { direction: "top", offset: [0, -8] })
      .addTo(userLayer);

    map.fitBounds(circle.getBounds(), { padding: [44, 44], maxZoom: 14 });
  }, [mapReady, nearbySelection]);

  return (
    <div className="relative h-[clamp(31rem,68vh,47rem)] min-h-[31rem] w-full">
      <div
        ref={containerRef}
        role="application"
        aria-label="Mappa interattiva delle spiagge, dei rating e dei punti utili"
        className="leaflet-map h-full w-full"
      />
      {poiState !== "idle" && poiState !== "ready" ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-full bg-[var(--ink)]/90 px-3 py-2 text-center text-[0.68rem] font-bold text-white shadow-lg backdrop-blur-md"
        >
          {poiState === "loading"
            ? "Carico i punti utili…"
            : poiState === "zoom-in" || poiState === "viewport-too-large"
              ? "Ingrandisci la mappa per vedere parcheggi, lidi e servizi"
              : "Punti utili temporaneamente non disponibili"}
        </div>
      ) : null}
      {nearbySelection ? (
        <div className="sr-only" role="status" aria-live="polite">
          La tua posizione è visibile sulla mappa. Mostro le spiagge entro {nearbySelection.radiusKm} km.
        </div>
      ) : null}
    </div>
  );
}
