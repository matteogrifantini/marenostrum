import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: "40px",
        }}
      >
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "60px",
            background: "linear-gradient(135deg, #ffc247, #ff9f1c)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 18px rgba(0, 0, 0, 0.3)",
          }}
        >
          <span style={{ fontSize: "70px" }}>🌊</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
