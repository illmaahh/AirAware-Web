import {describe,expect,it} from "vitest";
import {calculateCommute,monthlyDistance,MODES} from "../lib/transport";
describe("transport calculations",()=>{
 it("computes monthly distance",()=>expect(Math.round(monthlyDistance(8,10))).toBe(693));
 it("normalizes invalid distance inputs",()=>{expect(monthlyDistance(-8,10)).toBe(0);expect(monthlyDistance(Number.NaN,10)).toBe(0);expect(monthlyDistance(8,Number.POSITIVE_INFINITY)).toBe(0);});
 it("computes consistent petrol emissions",()=>{const r=calculateCommute({mode:"Petrol car",distanceKm:8,tripsPerWeek:10,occupants:1,fuelEfficiency:15});expect(r.monthlyCo2Kg).toBeGreaterThan(0);expect(r.annualCo2Tonnes).toBeCloseTo(r.monthlyCo2Kg*12/1000);});
 it("reduces per-person emissions for shared occupancy",()=>{const a=calculateCommute({mode:"Petrol car",distanceKm:8,tripsPerWeek:10,occupants:1,fuelEfficiency:15}),b=calculateCommute({mode:"Petrol car",distanceKm:8,tripsPerWeek:10,occupants:2,fuelEfficiency:15});expect(b.monthlyCo2Kg).toBeLessThan(a.monthlyCo2Kg);});
 it("assigns zero direct operational emissions to walking and cycling",()=>expect(calculateCommute({mode:"Bicycle / walk",distanceKm:8,tripsPerWeek:10,occupants:1}).monthlyCo2Kg).toBe(0));
 it("returns finite non-negative results for every mode",()=>{for(const mode of MODES){const r=calculateCommute({mode,distanceKm:12,tripsPerWeek:5,occupants:2});expect(Number.isFinite(r.monthlyCo2Kg)).toBe(true);expect(r.monthlyCo2Kg).toBeGreaterThanOrEqual(0);}});
});