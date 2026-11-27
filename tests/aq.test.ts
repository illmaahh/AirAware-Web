import { describe, expect, it } from "vitest";
import { aqBand, signedTrend } from "../lib/aq";

describe("AQI classification", () => {
  it.each([
    [0, "Good"], [50, "Good"], [51, "Moderate"], [100, "Moderate"],
    [101, "Unhealthy for Sensitive Groups"], [150, "Unhealthy for Sensitive Groups"],
    [151, "Unhealthy"], [200, "Unhealthy"], [201, "Very Unhealthy"],
    [300, "Very Unhealthy"], [301, "Hazardous"], [500, "Hazardous"],
  ] as const)("classifies AQI %i as %s", (aqi, label) => {
    expect(aqBand(aqi).label).toBe(label);
  });

  it.each([null, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "marks invalid AQI %s as unavailable",
    (aqi) => {
      expect(aqBand(aqi).label).toBe("Unavailable");
      expect(aqBand(aqi).level).toBe(0);
    },
  );
});

describe("hourly AQI trend", () => {
  it("detects rising and falling averages", () => {
    expect(signedTrend([10, 12, 20, 22]).label).toBe("Trending higher");
    expect(signedTrend([20, 22, 10, 12]).label).toBe("Trending lower");
  });

  it("treats small changes as steady", () => {
    expect(signedTrend([10, 11, 11, 12]).label).toBe("Holding steady");
  });

  it("ignores invalid observations before comparing", () => {
    expect(signedTrend([10, Number.NaN, 12, -1, 20, 22]).label).toBe("Trending higher");
  });

  it("requires at least four valid observations", () => {
    expect(signedTrend([10, Number.NaN, -1, 12, 14]).label).toBe("No clear signal");
  });
});
