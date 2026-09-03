import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "../domain/seo/site-copy";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mare Nostrum — Scegli il mare giusto oggi",
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
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
