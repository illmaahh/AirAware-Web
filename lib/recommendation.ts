import { normalizeCityName } from "./city";
import { MODES, type TransportMode } from "./transport";

export type AirQualityKey = "us_aqi" | "pm2_5" | "pm10" | "nitrogen_dioxide" | "ozone";

export type RecommendationContext = {
  city: string;
  airQuality: Partial<Record<AirQualityKey, number>>;
  commute: {
    mode: TransportMode;
    monthlyKm: number;
    monthlyCo2Kg: number;
    annualCo2Tonnes: number;
  };
  comparison: Array<{ mode: TransportMode; monthlyCo2Kg: number }>;
};

const AIR_QUALITY_KEYS: AirQualityKey[] = [
  "us_aqi", "pm2_5", "pm10", "nitrogen_dioxide", "ozone",
];
const MAX_DISTANCE_KM = 1_000_000;
const MAX_EMISSIONS_KG = 10_000_000;
const MAX_ANNUAL_EMISSIONS_TONNES = 100_000;
const MAX_POLLUTANT_VALUE = 100_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegativeNumber(value: unknown, max: number): value is number {
  return typeof value === "number"
    && Number.isFinite(value)
    && value >= 0
    && value <= max;
}

/** Validates and projects untrusted client data into the small context sent to Gemini. */
export function parseRecommendationContext(value: unknown): RecommendationContext | null {
  if (!isRecord(value) || !isRecord(value.airQuality) || !isRecord(value.commute)) return null;

  const city = normalizeCityName(typeof value.city === "string" ? value.city : null);
  if (!city) return null;

  const commute = value.commute;
  if (typeof commute.mode !== "string" || !MODES.includes(commute.mode as TransportMode)) return null;
  if (
    !isNonNegativeNumber(commute.monthlyKm, MAX_DISTANCE_KM)
    || !isNonNegativeNumber(commute.monthlyCo2Kg, MAX_EMISSIONS_KG)
    || !isNonNegativeNumber(commute.annualCo2Tonnes, MAX_ANNUAL_EMISSIONS_TONNES)
  ) return null;

  const airQuality: RecommendationContext["airQuality"] = {};
  for (const key of AIR_QUALITY_KEYS) {
    const reading = value.airQuality[key];
    // Open-Meteo can legitimately return null when a pollutant has no modelled reading.
    if (reading === null || reading === undefined) continue;
    if (!isNonNegativeNumber(reading, MAX_POLLUTANT_VALUE)) return null;
    airQuality[key] = reading;
  }

  if (!Array.isArray(value.comparison) || value.comparison.length > MODES.length) return null;

  const seenModes = new Set<TransportMode>();
  const comparison: RecommendationContext["comparison"] = [];
  for (const item of value.comparison) {
    if (!isRecord(item) || typeof item.mode !== "string" || !MODES.includes(item.mode as TransportMode)) {
      return null;
    }
    const mode = item.mode as TransportMode;
    if (seenModes.has(mode) || !isNonNegativeNumber(item.monthlyCo2Kg, MAX_EMISSIONS_KG)) return null;
    seenModes.add(mode);
    comparison.push({ mode, monthlyCo2Kg: item.monthlyCo2Kg });
  }

  return {
    city,
    airQuality,
    commute: {
      mode: commute.mode as TransportMode,
      monthlyKm: commute.monthlyKm,
      monthlyCo2Kg: commute.monthlyCo2Kg,
      annualCo2Tonnes: commute.annualCo2Tonnes,
    },
    comparison,
  };
}
