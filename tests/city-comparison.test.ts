import { describe, expect, it } from "vitest";
import { parseCityList, rankCityReadings } from "../lib/city-comparison";

describe("parseCityList", () => {
  it("trims names and removes case-insensitive duplicates", () => {
    expect(parseCityList(" Delhi, Mumbai , delhi, Dubai ")).toEqual(["Delhi", "Mumbai", "Dubai"]);
  });

  it("limits the number of requested cities", () => {
    expect(parseCityList("A, B, C, D, E, F")).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("rejects invalid limits", () => {
    expect(parseCityList("A, B", 1)).toEqual([]);
  });
});

describe("rankCityReadings", () => {
  const city = (name: string, us_aqi: number | null) => ({
    location: { name, country: "Test" },
    current: { us_aqi },
  });

  it("ranks lower valid AQI first and unavailable readings last", () => {
    const input = [city("Delhi", 180), city("Dubai", null), city("Mumbai", 75), city("London", Number.NaN)];
    expect(rankCityReadings(input).map((item) => item.location.name)).toEqual([
      "Mumbai", "Delhi", "Dubai", "London",
    ]);
  });

  it("does not mutate the input array", () => {
    const input = [city("B", 100), city("A", 50)];
    rankCityReadings(input);
    expect(input.map((item) => item.location.name)).toEqual(["B", "A"]);
  });
});
