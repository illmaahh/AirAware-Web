import { describe, expect, it } from "vitest";
import { calculateCommute, monthlyDistance } from "../lib/transport";

describe("transport calculations", () => {
  it("computes monthly distance", () => {
    expect(Math.round(monthlyDistance(8, 10))).toBe(693);
  });

  it("computes positive petrol emissions", () => {
    const r = calculateCommute({
      mode: "Petrol car",
      distanceKm: 8,
      tripsPerWeek: 10,
      occupants: 1,
      fuelEfficiency: 15,
    });
    expect(r.monthlyCo2Kg).toBeGreaterThan(0);
  });

  it("shared occupancy lowers per-person estimate", () => {
    const a = calculateCommute({
      mode: "Petrol car", distanceKm: 8, tripsPerWeek: 10, occupants: 1, fuelEfficiency: 15,
    });
    const b = calculateCommute({
      mode: "Petrol car", distanceKm: 8, tripsPerWeek: 10, occupants: 2, fuelEfficiency: 15,
    });
    expect(b.monthlyCo2Kg).toBeLessThan(a.monthlyCo2Kg);
  });

  it("active travel has zero direct operational estimate", () => {
    const r = calculateCommute({ mode: "Bicycle / walk", distanceKm: 8, tripsPerWeek: 10, occupants: 1 });
    expect(r.monthlyCo2Kg).toBe(0);
  });
});
