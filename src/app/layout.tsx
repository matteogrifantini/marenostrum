import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PwaRegister } from "../components/pwa-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://marenostrum.app"),
  title: {
    default: "Mare Nostrum — Scegli il mare giusto oggi in Sicilia",
    template: "%s | Mare Nostrum",
  },
  description:
    "Previsioni meteo mare in tempo reale per tutte le spiagge della Sicilia. Scopri dove il mare è calmo e quali spiagge sono riparate dal vento oggi.",
  keywords: [
    "spiagge sicilia",
    "previsioni mare sicilia",
    "mare calmo sicilia",
    "vento spiagge sicilia",
    "migliori spiagge sicilia",
    "webcam spiagge sicilia",
    "meteo mare sicilia",
    "mare nostrum",
    "mare calmo palermo",
    "mare calmo trapani",
    "mare calmo catania",
    "mare calmo siracusa",
    "mare calmo messina",
    "mare calmo ragusa",
    "mare calmo agrigento",
  ],
  alternates: {
    canonical: "https://marenostrum.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://marenostrum.app",
    siteName: "Mare Nostrum",
    title: "Mare Nostrum — Scegli il mare giusto oggi in Sicilia",
    description:
      "Previsioni meteo mare in tempo reale per tutte le spiagge della Sicilia. Scopri dove il mare è calmo e quali spiagge sono riparate dal vento oggi.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mare Nostrum — Scegli il mare giusto oggi in Sicilia",
    description:
      "Previsioni meteo mare in tempo reale per tutte le spiagge della Sicilia. Scopri dove il mare è calmo e quali spiagge sono riparate dal vento oggi.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mare Nostrum",
  },
  verification: {
    google: "google8695ec30da15de9c",
  },
  category: "travel",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://marenostrum.app/#website",
      "url": "https://marenostrum.app",
      "name": "Mare Nostrum",
      "description":
        "Previsioni meteo mare in tempo reale per tutte le spiagge della Sicilia. Scopri dove il mare è calmo e quali spiagge sono riparate dal vento oggi.",
      "inLanguage": "it-IT",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://marenostrum.app/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://marenostrum.app/#organization",
      "name": "Mare Nostrum",
      "url": "https://marenostrum.app",
      "logo": "https://marenostrum.app/icon.png",
    },
    {
      "@type": "WebApplication",
      "name": "Mare Nostrum",
      "url": "https://marenostrum.app",
      "applicationCategory": "TravelApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="it"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

