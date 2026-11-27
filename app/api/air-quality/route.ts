import { NextRequest, NextResponse } from "next/server";
import { normalizeCityName } from "@/lib/city";

export const runtime = "nodejs";
export const revalidate = 600;

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(request: NextRequest) {
  const rawCity = request.nextUrl.searchParams.get("city");
  if (!rawCity?.trim()) {
    return NextResponse.json({ error: "Enter a city name." }, { status: 400 });
  }

  const city = normalizeCityName(rawCity);
  if (!city) {
    return NextResponse.json({ error: "Enter a valid city name (up to 100 characters)." }, { status: 400 });
  }

  try {
    const geocodingUrl = new URL(GEO_URL);
    geocodingUrl.search = new URLSearchParams({
      name: city,
      count: "1",
      language: "en",
      format: "json",
    }).toString();

    const geocodingResponse = await fetch(geocodingUrl, {
      next: { revalidate: 3_600 },
      signal: AbortSignal.timeout(8_000),
    });
    if (!geocodingResponse.ok) throw new Error("Geocoding provider unavailable.");

    const geocodingPayload: unknown = await geocodingResponse.json();
    const firstResult = isRecord(geocodingPayload) && Array.isArray(geocodingPayload.results)
      ? geocodingPayload.results[0]
      : null;

    if (
      !isRecord(firstResult)
      || typeof firstResult.latitude !== "number"
      || !Number.isFinite(firstResult.latitude)
      || typeof firstResult.longitude !== "number"
      || !Number.isFinite(firstResult.longitude)
    ) {
      return NextResponse.json({ error: "City not found. Try a larger nearby city." }, { status: 404 });
    }

    const params = new URLSearchParams({
      latitude: String(firstResult.latitude),
      longitude: String(firstResult.longitude),
      current: "us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone",
      hourly: "us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone",
      forecast_hours: "24",
      timezone: "auto",
    });

    const airQualityResponse = await fetch(AIR_QUALITY_URL + "?" + params.toString(), {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!airQualityResponse.ok) throw new Error("Air-quality provider unavailable.");

    const airQualityPayload: unknown = await airQualityResponse.json();
    const current = isRecord(airQualityPayload) && isRecord(airQualityPayload.current)
      ? airQualityPayload.current
      : {};
    const currentUnits = isRecord(airQualityPayload) && isRecord(airQualityPayload.current_units)
      ? airQualityPayload.current_units
      : {};
    const hourly = isRecord(airQualityPayload) && isRecord(airQualityPayload.hourly)
      ? airQualityPayload.hourly
      : {};

    if (Object.keys(current).length === 0 && Object.keys(hourly).length === 0) {
      throw new Error("Air-quality provider returned no usable readings.");
    }

    return NextResponse.json({
      source: "Open-Meteo Air Quality API",
      sourceType: "modelled",
      location: {
        name: typeof firstResult.name === "string" ? firstResult.name : city,
        country: typeof firstResult.country === "string" ? firstResult.country : "",
        latitude: firstResult.latitude,
        longitude: firstResult.longitude,
        timezone: typeof firstResult.timezone === "string" ? firstResult.timezone : "",
      },
      retrievedAt: new Date().toISOString(),
      current,
      currentUnits,
      hourly,
    }, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" },
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError"
      ? "The air-quality service took too long to respond. Please try again."
      : "Air-quality data could not be loaded right now. Please try again shortly.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
