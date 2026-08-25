import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PwaRegister } from "../components/pwa-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://marenostrum.app"),
  title: {
    default: "Mare Nostrum — scegli il mare giusto oggi",
    template: "%s | Mare Nostrum",
  },
  description:
    "Condizioni, vento e accessibilità delle spiagge siciliane in un’unica scelta chiara.",
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://marenostrum.app",
    siteName: "Mare Nostrum",
    title: "Mare Nostrum — scegli il mare giusto oggi",
    description:
      "Condizioni, vento e accessibilità delle spiagge siciliane in un’unica scelta chiara.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mare Nostrum — scegli il mare giusto oggi",
    description:
      "Condizioni, vento e accessibilità delle spiagge siciliane in un’unica scelta chiara.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mare Nostrum",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="it"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
