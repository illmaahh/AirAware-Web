import { describe, expect, it } from "vitest";
import { parseRecommendationContext } from "../lib/recommendation";

const validContext = {
  city: "  New Delhi ",
  airQuality: {
    us_aqi: 145,
    pm2_5: 55.2,
    pm10: null,
    nitrogen_dioxide: 12,
    ozone: null,
  },
  commute: {
    mode: "Petrol car",
    monthlyKm: 693.3,
    monthlyCo2Kg: 90.5,
    annualCo2Tonnes: 1.086,
  },
  comparison: [
    { mode: "Petrol car", monthlyCo2Kg: 90.5 },
    { mode: "Metro / rail", monthlyCo2Kg: 34.6 },
  ],
};

describe("parseRecommendationContext", () => {
  it("accepts valid context and trims the city name", () => {
    const result = parseRecommendationContext(validContext);
    expect(result?.city).toBe("New Delhi");
    expect(result?.airQuality.pm10).toBeUndefined();
    expect(result?.airQuality.us_aqi).toBe(145);
    expect(result?.comparison).toHaveLength(2);
  });

  it("rejects missing objects and malformed payloads", () => {
    expect(parseRecommendationContext(null)).toBeNull();
    expect(parseRecommendationContext([])).toBeNull();
    expect(parseRecommendationContext({ ...validContext, airQuality: null })).toBeNull();
    expect(parseRecommendationContext({ ...validContext, commute: null })).toBeNull();
    expect(parseRecommendationContext({ ...validContext, comparison: {} })).toBeNull();
  });

  it.each(["", "  ", "x".repeat(101), "<script>bad</script>", "Delhi\nMumbai"])(
    "rejects an invalid city: %s",
    (city) => {
      expect(parseRecommendationContext({ ...validContext, city })).toBeNull();
    },
  );

  it("rejects unknown transport modes", () => {
    expect(parseRecommendationContext({
      ...validContext,
      commute: { ...validContext.commute, mode: "Rocket" },
    })).toBeNull();
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, "90", 10_000_001])(
    "rejects invalid commute values: %s",
    (monthlyCo2Kg) => {
      expect(parseRecommendationContext({
        ...validContext,
        commute: { ...validContext.commute, monthlyCo2Kg },
      })).toBeNull();
    },
  );

  it("rejects invalid pollutant values but permits provider nulls", () => {
    expect(parseRecommendationContext({
      ...validContext,
      airQuality: { ...validContext.airQuality, pm2_5: -1 },
    })).toBeNull();
    expect(parseRecommendationContext(validContext)?.airQuality.pm10).toBeUndefined();
  });

  it("rejects duplicate comparison modes and excessive entries", () => {
    expect(parseRecommendationContext({
      ...validContext,
      comparison: [
        { mode: "Bus", monthlyCo2Kg: 10 },
        { mode: "Bus", monthlyCo2Kg: 10 },
      ],
    })).toBeNull();
    expect(parseRecommendationContext({
      ...validContext,
      comparison: Array.from({ length: 8 }, (_, index) => ({
        mode: ["Petrol car", "Diesel car", "Petrol motorcycle", "Electric vehicle", "Bus", "Metro / rail", "Bicycle / walk", "Bus"][index],
        monthlyCo2Kg: 1,
      })),
    })).toBeNull();
  });
});
