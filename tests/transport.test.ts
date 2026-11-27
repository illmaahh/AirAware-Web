import { describe, expect, it } from "vitest";
import { calculateCommute, MODES, monthlyDistance, type TransportMode } from "../lib/transport";

describe("monthly distance", () => {
  it("converts one-way distance and weekly trips to a monthly estimate", () => {
    expect(Math.round(monthlyDistance(8, 10))).toBe(693);
  });

  it("returns zero for non-finite inputs", () => {
    expect(monthlyDistance(Number.NaN, 10)).toBe(0);
    expect(monthlyDistance(8, Number.POSITIVE_INFINITY)).toBe(0);
    expect(monthlyDistance(Number.NEGATIVE_INFINITY, 10)).toBe(0);
  });

  it("clamps negative values and extreme values to safe limits", () => {
    expect(monthlyDistance(-8, 10)).toBe(0);
    expect(monthlyDistance(8, -2)).toBe(0);
    expect(monthlyDistance(10_000, 20)).toBe(monthlyDistance(5_000, 14));
  });
});

describe("commute emissions", () => {
  const petrolCar = {
    mode: "Petrol car" as const,
    distanceKm: 8,
    tripsPerWeek: 10,
    occupants: 1,
    fuelEfficiency: 15,
  };

  it("computes positive petrol emissions and a consistent annual estimate", () => {
    const result = calculateCommute(petrolCar);
    expect(result.monthlyCo2Kg).toBeGreaterThan(0);
    expect(result.annualCo2Tonnes).toBeCloseTo((result.monthlyCo2Kg * 12) / 1_000);
  });

  it("reduces per-person car emissions when occupants share a vehicle", () => {
    const solo = calculateCommute(petrolCar);
    const shared = calculateCommute({ ...petrolCar, occupants: 2 });
    expect(shared.monthlyCo2Kg).toBeCloseTo(solo.monthlyCo2Kg / 2);
  });

  it("uses finite defaults for invalid efficiency and occupancy values", () => {
    const result = calculateCommute({
      ...petrolCar,
      occupants: Number.NaN,
      fuelEfficiency: Number.POSITIVE_INFINITY,
    });
    expect(Number.isFinite(result.monthlyCo2Kg)).toBe(true);
    expect(result.monthlyCo2Kg).toBeGreaterThan(0);
  });

  it("assigns zero direct operational emissions to walking and cycling", () => {
    const result = calculateCommute({ ...petrolCar, mode: "Bicycle / walk" });
    expect(result.monthlyCo2Kg).toBe(0);
  });

  it("returns finite, non-negative values for every supported mode", () => {
    for (const mode of MODES) {
      const result = calculateCommute({ ...petrolCar, mode });
      expect(Number.isFinite(result.monthlyKm)).toBe(true);
      expect(Number.isFinite(result.monthlyCo2Kg)).toBe(true);
      expect(Number.isFinite(result.annualCo2Tonnes)).toBe(true);
      expect(result.monthlyCo2Kg).toBeGreaterThanOrEqual(0);
    }
  });

  it("rejects unsupported runtime transport modes", () => {
    expect(() => calculateCommute({
      ...petrolCar,
      mode: "Helicopter" as TransportMode,
    })).toThrow("Unsupported transport mode");
  });
});
