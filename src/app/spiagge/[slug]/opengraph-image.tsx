import { ImageResponse } from "next/og";
import { getBeachForecastBundleBySlug } from "../../../data/beach-repository";
import { getDateOptions } from "../../../domain/date-selection";

export const runtime = "nodejs";
export const alt = "Mare Nostrum — Previsioni Meteomarine";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dateOptions = getDateOptions(new Date());
  const date = dateOptions[0].iso;

  let beachName = "Spiaggia della Sicilia";
  let municipality = "Sicilia";
  let score = "8.5";
  let label = "Ottima scelta";
  let wind = "10 km/h";
  let wave = "0.4 m";
  let weather = "Sereno";

  try {
    const bundle = await getBeachForecastBundleBySlug({
      slug,
      date,
      period: "all-day",
    });

    if (bundle?.beach) {
      beachName = bundle.beach.name;
      municipality = bundle.beach.municipality;
    }
    if (bundle?.selected) {
      score = (bundle.selected.score / 10).toFixed(1);
      label = bundle.selected.label;
      wind = `${bundle.selected.conditions.windSpeedKmh} km/h`;
      wave = `${bundle.selected.conditions.waveHeightMeters ?? "0.3"} m`;
      weather = bundle.selected.conditions.weather;
    }
  } catch {
    // fallback values
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: "linear-gradient(145deg, #0d3b4c 0%, #061c23 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "24px",
              background: "linear-gradient(135deg, #ffc247, #ff9f1c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(255, 194, 71, 0.4)",
            }}
          >
            <span style={{ fontSize: "24px" }}>🌊</span>
          </div>
          <span style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.03em" }}>
            Mare Nostrum
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "20px",
              fontWeight: "600",
              color: "rgba(255, 255, 255, 0.8)",
              background: "rgba(255, 255, 255, 0.12)",
              padding: "6px 18px",
              borderRadius: "20px",
            }}
          >
            Previsioni di Oggi
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              fontSize: "22px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#ffc247",
            }}
          >
            📍 {municipality} · Sicilia
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: "800",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            {beachName}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            background: "rgba(255, 255, 255, 0.08)",
            padding: "24px 32px",
            borderRadius: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "32px",
                background: "#15803d",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                fontWeight: "800",
              }}
            >
              {score}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.6)" }}>
                Voto Mare Nostrum
              </span>
              <span style={{ fontSize: "22px", fontWeight: "700" }}>{label}</span>
            </div>
          </div>

          <div
            style={{
              width: "1px",
              height: "48px",
              background: "rgba(255, 255, 255, 0.15)",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "15px", color: "rgba(255, 255, 255, 0.6)" }}>
              💨 Vento
            </span>
            <span style={{ fontSize: "20px", fontWeight: "700" }}>{wind}</span>
          </div>

          <div
            style={{
              width: "1px",
              height: "48px",
              background: "rgba(255, 255, 255, 0.15)",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "15px", color: "rgba(255, 255, 255, 0.6)" }}>
              🌊 Onde
            </span>
            <span style={{ fontSize: "20px", fontWeight: "700" }}>{wave}</span>
          </div>

          <div
            style={{
              width: "1px",
              height: "48px",
              background: "rgba(255, 255, 255, 0.15)",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "15px", color: "rgba(255, 255, 255, 0.6)" }}>
              ☀️ Meteo
            </span>
            <span style={{ fontSize: "20px", fontWeight: "700", textTransform: "capitalize" }}>
              {weather}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
