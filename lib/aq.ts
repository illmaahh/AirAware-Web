export type AQBand = "Good" | "Moderate" | "Unhealthy for Sensitive Groups" | "Unhealthy" | "Very Unhealthy" | "Hazardous";
export function aqBand(aqi: number | null): { label: AQBand | "Unavailable"; description: string; level: number } {
  if (aqi === null || !Number.isFinite(aqi) || aqi < 0) return { label: "Unavailable", description: "No valid modelled AQI is available.", level: 0 };
  if (aqi <= 50) return { label: "Good", description: "Lower end of the displayed US AQI scale.", level: 1 };
  if (aqi <= 100) return { label: "Moderate", description: "Moderate range in the displayed US AQI scale.", level: 2 };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", description: "Higher range for sensitive groups in the displayed US AQI scale.", level: 3 };
  if (aqi <= 200) return { label: "Unhealthy", description: "Unhealthy range in the displayed US AQI scale.", level: 4 };
  if (aqi <= 300) return { label: "Very Unhealthy", description: "Very unhealthy range in the displayed US AQI scale.", level: 5 };
  return { label: "Hazardous", description: "Hazardous range in the displayed US AQI scale.", level: 6 };
}
export function signedTrend(values: number[]) {
  const clean = values.filter(v => Number.isFinite(v) && v >= 0);
  if (clean.length < 4) return { label: "No clear signal", delta: 0 };
  const half = Math.floor(clean.length / 2), first = clean.slice(0, half), second = clean.slice(half);
  const delta = second.reduce((s,v)=>s+v,0)/second.length - first.reduce((s,v)=>s+v,0)/first.length;
  if (Math.abs(delta) < 2) return { label: "Holding steady", delta };
  return delta > 0 ? { label: "Trending higher", delta } : { label: "Trending lower", delta };
}