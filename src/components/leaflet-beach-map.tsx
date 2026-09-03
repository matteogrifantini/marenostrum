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
  sortMappableRecommendations,
  type MappableRecommendation,
} from "../domain/map-markers";

type LeafletBeachMapProps = {
  recommendations: BeachRecommendation[];
  selectedSlug: string | null;
  onSelectBeach: (slug: string) => void;
  nearbySelection: MapNearbySelection | null;
  poiEnabled?: boolean;
  activePoiCategories?: MapPoiCategory[];
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

export function createBeachPopup(recommendation: MappableRecommendation) {
  const { beach, score, conditions } = recommendation;
  const scoreValue = formatScoreOutOf100(score);
  const location = `${beach.municipality}${beach.provinceCode ? ` (${beach.provinceCode})` : ""}`;
  const webcamBadge = beach.webcam
    ? '<span style="background:#e2e8f0;color:#0f172a;padding:2px 6px;border-radius:999px;font-size:10px;font-weight:800;margin-left:4px;">Webcam</span>'
    : "";
  const dateParam = encodeURIComponent(conditions.date ?? "");
  const periodParam = encodeURIComponent(conditions.period ?? "all-day");
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${beach.latitude},${beach.longitude}`;

  return `<div class="map-popup map-popup--beach" style="min-width:200px;">
    <div class="map-popup__eyebrow" style="display:flex;align-items:center;justify-content:space-between;gap:4px;font-size:11px;color:#64748b;">
      <span>${escapeHtml(location)}</span>
      ${webcamBadge}
    </div>
    <strong style="font-size:15px;display:block;margin:3px 0 6px;color:#0f172a;">${escapeHtml(beach.name)}</strong>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
      <span class="map-popup__score" style="font-weight:800;font-size:17px;color:#082f3d;">${scoreValue}/100</span>
      <span style="font-size:11px;font-weight:600;color:#475569;text-transform:capitalize;">${escapeHtml(conditions.weather || "")}</span>
    </div>
    <div style="display:flex;gap:6px;margin-top:6px;">
      <a href="/spiagge/${encodeURIComponent(beach.slug)}?date=${dateParam}&period=${periodParam}&source=map" style="flex:1;text-align:center;background:#082f3d;color:white;padding:7px 10px;border-radius:10px;font-weight:700;font-size:12px;text-decoration:none;display:inline-block;">Vedi spiaggia</a>
      <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="background:#f1f5f9;color:#082f3d;padding:7px 10px;border-radius:10px;font-weight:700;font-size:12px;text-decoration:none;display:inline-flex;align-items:center;" title="Indicazioni stradali Google Maps">🗺️</a>
    </div>
  </div>`;
}

function isPoiResponse(value: unknown): value is PoiResponse {
  return typeof value === "object" && value !== null;
}

type BeachMarkerModel = {
  recommendation: MappableRecommendation;
  className: string;
  html: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
  title: string;
  alt: string;
  tooltip: string;
  zIndexOffset: number;
};

export function buildBeachMarkerModels(
  recommendations: BeachRecommendation[],
  selectedSlug: string | null,
): BeachMarkerModel[] {
  return sortMappableRecommendations(recommendations).map((recommendation) => {
    const { beach, score } = recommendation;
    const scoreValue = formatScoreOutOf100(score);
    const selected = beach.slug === selectedSlug;

    return {
      recommendation,
      className: `map-rating-marker map-rating-marker--${scoreTone(score)}${selected ? " map-rating-marker--selected" : ""}`,
      html: `<span>${scoreValue}</span>`,
      iconSize: [44, 30],
      iconAnchor: [22, 15],
      title: `${beach.name}: voto ${scoreValue}`,
      alt: `${beach.name}: voto ${scoreValue}`,
      tooltip: `${beach.name} · ${scoreValue}`,
      zIndexOffset: selected ? 10000 : Math.round(score * 10),
    };
  });
}

export function LeafletBeachMap({
  recommendations,
  selectedSlug,
  onSelectBeach,
  nearbySelection,
  poiEnabled = false,
  activePoiCategories = [...MAP_POI_CATEGORIES],
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

      if (!poiEnabled || activePoiCategories.length === 0) {
        requestControllerRef.current?.abort();
        poiLayer.clearLayers();
        setPoiState("idle");
        return;
      }

      if (map.getZoom() < 12.5) {
        requestControllerRef.current?.abort();
        poiLayer.clearLayers();
        setPoiState("zoom-in");
        return;
      }

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

      const categoriesParam = encodeURIComponent(activePoiCategories.join(","));

      void fetch(
        `/api/map/places?bbox=${bbox}&zoom=${map.getZoom().toFixed(1)}&categories=${categoriesParam}`,
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
  }, [poiEnabled, activePoiCategories]);

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
    for (const markerModel of buildBeachMarkerModels(recommendations, selectedSlug)) {
      const { recommendation, className, html, iconSize, iconAnchor, title, alt, tooltip, zIndexOffset } = markerModel;
      const { beach } = recommendation;
      const marker = leaflet.marker([beach.latitude, beach.longitude], {
        icon: leaflet.divIcon({
          className,
          html,
          iconSize,
          iconAnchor,
        }),
        title,
        alt,
        keyboard: true,
        zIndexOffset,
      });
      marker.on("click", () => onSelectBeach(beach.slug));
      marker.bindTooltip(tooltip, {
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
