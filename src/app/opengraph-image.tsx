import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Mare Nostrum — Scegli il mare giusto oggi in Sicilia";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
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
              width: "56px",
              height: "56px",
              borderRadius: "28px",
              background: "linear-gradient(135deg, #ffc247, #ff9f1c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 18px rgba(255, 194, 71, 0.4)",
            }}
          >
            <span style={{ fontSize: "28px" }}>🌊</span>
          </div>
          <span style={{ fontSize: "36px", fontWeight: "700", letterSpacing: "-0.04em" }}>
            Mare Nostrum
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#ffc247",
            }}
          >
            Sicilia · Previsioni Meteomarine Reali
          </div>
          <div
            style={{
              fontSize: "60px",
              fontWeight: "800",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            Scegli il mare giusto oggi.
          </div>
          <div
            style={{
              fontSize: "24px",
              lineHeight: 1.4,
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            Vento, onde e qualità del mare per le migliori spiagge della Sicilia in un&apos;unica scelta chiara.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            fontSize: "20px",
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          <span>✨ Modello Matematico Open-Meteo</span>
          <span>·</span>
          <span>📍 21 Spiagge Monitorate</span>
          <span>·</span>
          <span>📱 Mobile-First</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
