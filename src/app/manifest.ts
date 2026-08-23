import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mare Nostrum — Scegli il mare giusto oggi",
    short_name: "Mare Nostrum",
    description:
      "Previsioni meteomarine in tempo reale, vento, onde e qualità del mare per le migliori spiagge della Sicilia.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfbf8",
    theme_color: "#082f3d",
    orientation: "portrait",
    categories: ["weather", "travel", "navigation"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
