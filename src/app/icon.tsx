import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0d3b4c 0%, #061c23 100%)",
          borderRadius: "110px",
        }}
      >
        <div
          style={{
            width: "360px",
            height: "360px",
            borderRadius: "180px",
            background: "linear-gradient(135deg, #ffc247, #ff9f1c)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.3)",
          }}
        >
          <span style={{ fontSize: "200px" }}>🌊</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
