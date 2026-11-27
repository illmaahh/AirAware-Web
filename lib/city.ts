const CITY_NAME_PATTERN = /^[\p{L}\p{M}\p{N}\s,.'’&()\-]+$/u;

/**
 * Trims and validates a city query before it is sent to the geocoding provider.
 * Supports international names while rejecting control characters and markup.
 */
export function normalizeCityName(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const city = value.trim().replace(/\s+/g, " ");
  if (!city || city.length > 100 || !CITY_NAME_PATTERN.test(city)) return null;
  return city;
}
