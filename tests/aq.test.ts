import { describe, expect, it } from "vitest";
import { aqBand } from "../lib/aq";

describe("AQI bands", () => {
  it("maps the displayed US AQI values", () => {
    expect(aqBand(30).label).toBe("Good");
    expect(aqBand(80).label).toBe("Moderate");
    expect(aqBand(170).label).toBe("Unhealthy");
    expect(aqBand(320).label).toBe("Hazardous");
  });
});
