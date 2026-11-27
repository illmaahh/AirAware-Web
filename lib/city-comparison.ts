export type CityAQReading = {
  location: { name: string; country: string };
  current: { us_aqi?: number | null };
};

/** Parse a comma-separated city list, normalize whitespace and remove duplicates. */
export function parseCityList(input: string, maxCities = 5): string[] {
  if (!Number.isInteger(maxCities) || maxCities < 2 || maxCities > 10) return [];
  const seen = new Set<string>();
  const cities: string[] = [];

  for (const part of input.split(",")) {
    const city = part.trim().replace(/\s+/g, " ");
    const key = city.toLocaleLowerCase();
    if (!city || seen.has(key)) continue;
    seen.add(key);
    cities.push(city);
    if (cities.length === maxCities) break;
  }

  return cities;
}

/** Sort valid AQI readings from lower to higher; unavailable values always remain last. */
export function rankCityReadings<T extends CityAQReading>(readings: readonly T[]): T[] {
  return [...readings].sort((a, b) => {
    const aqiA = a.current.us_aqi;
    const aqiB = b.current.us_aqi;
    const validA = typeof aqiA === "number" && Number.isFinite(aqiA) && aqiA >= 0;
    const validB = typeof aqiB === "number" && Number.isFinite(aqiB) && aqiB >= 0;

    if (validA && validB) return aqiA - aqiB;
    if (validA) return -1;
    if (validB) return 1;
    return 0;
  });
}
