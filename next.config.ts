import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  htmlLimitedBots:
    /Googlebot|Google-InspectionTool|Bingbot|Slurp|DuckDuckBot|baiduspider|yandex|facebookexternalhit|twitterbot/i,
  images: {
    localPatterns: [{ pathname: "/images/**" }],
  },
};

export default nextConfig;
