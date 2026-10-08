import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 600;

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const AQ_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim();

  if (!city) {
    return NextResponse.json({ error: "Enter a city name." }, { status: 400 });
  }

  try {
    const geoResponse = await fetch(
      `${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
      { next: { revalidate: 3600 } },
    );
    if (!geoResponse.ok) throw new Error("Location lookup failed.");

    const geo = await geoResponse.json();
    const place = geo.results?.[0];
    if (!place) {
      return NextResponse.json(
        { error: "City not found. Try a larger nearby city." },
        { status: 404 },
      );
    }

    const params = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      current: "us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone",
      hourly: "us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone",
      forecast_hours: "24",
      timezone: "auto",
    });

    const aqResponse = await fetch(`${AQ_URL}?${params.toString()}`, {
      next: { revalidate: 600 },
    });
    if (!aqResponse.ok) throw new Error("Air-quality provider unavailable.");

    const payload = await aqResponse.json();

    return NextResponse.json({
      source: "Open-Meteo Air Quality API",
      sourceType: "modelled",
      location: {
        name: place.name,
        country: place.country,
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: place.timezone,
      },
      retrievedAt: new Date().toISOString(),
      current: payload.current ?? {},
      currentUnits: payload.current_units ?? {},
      hourly: payload.hourly ?? {},
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected data error." },
      { status: 502 },
    );
  }
}
