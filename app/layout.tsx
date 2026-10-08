import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AirAware — Smart Commute & Air Quality Advisor",
  description:
    "A climate-tech decision layer combining modelled air quality, commute emissions and AI-assisted actions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
