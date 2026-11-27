export type AQBand =
  | "Good"
  | "Moderate"
  | "Unhealthy for Sensitive Groups"
  | "Unhealthy"
  | "Very Unhealthy"
  | "Hazardous";

export interface AQBandResult {
  label: AQBand | "Unavailable";
  description: string;
  level: number;
}

export function aqBand(aqi: number | null): AQBandResult {
  if (aqi === null || !Number.isFinite(aqi) || aqi < 0) {
    return { label: "Unavailable", description: "No valid modelled AQI is available.", level: 0 };
  }
  if (aqi <= 50) return { label: "Good", description: "Lower end of the displayed US AQI scale.", level: 1 };
  if (aqi <= 100) return { label: "Moderate", description: "Moderate range in the displayed US AQI scale.", level: 2 };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", description: "Higher range for sensitive groups in the displayed US AQI scale.", level: 3 };
  if (aqi <= 200) return { label: "Unhealthy", description: "Unhealthy range in the displayed US AQI scale.", level: 4 };
  if (aqi <= 300) return { label: "Very Unhealthy", description: "Very unhealthy range in the displayed US AQI scale.", level: 5 };
  return { label: "Hazardous", description: "Hazardous range in the displayed US AQI scale.", level: 6 };
}

export interface TrendResult {
  label: "No clear signal" | "Holding steady" | "Trending higher" | "Trending lower";
  delta: number;
}

/** Compares the average of the first and second halves of valid hourly readings. */
export function signedTrend(values: number[]): TrendResult {
  const clean = values.filter((value) => Number.isFinite(value) && value >= 0);
  if (clean.length < 4) return { label: "No clear signal", delta: 0 };

  const midpoint = Math.floor(clean.length / 2);
  const firstHalf = clean.slice(0, midpoint);
  const secondHalf = clean.slice(midpoint);
  const average = (items: number[]) => items.reduce((sum, value) => sum + value, 0) / items.length;
  const delta = average(secondHalf) - average(firstHalf);

  if (Math.abs(delta) < 2) return { label: "Holding steady", delta };
  return delta > 0
    ? { label: "Trending higher", delta }
    : { label: "Trending lower", delta };
}
