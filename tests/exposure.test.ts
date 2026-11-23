import { describe, expect, it } from "vitest";
import { getExposureGuidance } from "../lib/exposure";

describe("getExposureGuidance", () => {
  it("handles missing and invalid readings", () => {
    expect(getExposureGuidance(null).level).toBe("unavailable");
    expect(getExposureGuidance(Number.NaN).level).toBe("unavailable");
    expect(getExposureGuidance(-1).level).toBe("unavailable");
  });

  it.each([
    [0, "good"],
    [50, "good"],
    [51, "moderate"],
    [100, "moderate"],
    [101, "sensitive"],
    [150, "sensitive"],
    [151, "unhealthy"],
    [200, "unhealthy"],
    [201, "very-unhealthy"],
    [300, "very-unhealthy"],
    [301, "hazardous"],
    [500, "hazardous"],
  ] as const)("maps AQI %i to %s", (aqi, level) => {
    expect(getExposureGuidance(aqi).level).toBe(level);
  });

  it("returns practical actions for a hazardous reading", () => {
    expect(getExposureGuidance(350).actions.join(" ")).toContain("official");
  });
});
