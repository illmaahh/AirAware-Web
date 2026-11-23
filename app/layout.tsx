import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AirAware | Urban Air Quality & Commute Assistant",
  description:
    "Explore modelled city air quality, understand outdoor activity guidance, compare commute emissions and get practical AI-assisted actions.",
  applicationName: "AirAware",
  keywords: [
    "urban air quality",
    "air quality assistant",
    "AQI",
    "commute emissions",
    "sustainable transport",
    "climate technology",
  ],
  openGraph: {
    title: "AirAware | Urban Air Quality & Commute Assistant",
    description:
      "Understand city air-quality signals, compare commute choices and plan practical climate actions.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
