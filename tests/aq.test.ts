import {describe,expect,it} from "vitest";
import {aqBand,signedTrend} from "../lib/aq";
describe("AQI bands",()=>{
 it("maps all US AQI bands",()=>{expect(aqBand(30).label).toBe("Good");expect(aqBand(80).label).toBe("Moderate");expect(aqBand(120).label).toBe("Unhealthy for Sensitive Groups");expect(aqBand(170).label).toBe("Unhealthy");expect(aqBand(250).label).toBe("Very Unhealthy");expect(aqBand(320).label).toBe("Hazardous");});
 it.each([null,-1,Number.NaN,Number.POSITIVE_INFINITY])("rejects invalid AQI %s",v=>{expect(aqBand(v).label).toBe("Unavailable");expect(aqBand(v).level).toBe(0);});
});
describe("hourly trend",()=>{
 it("detects rising and falling trends",()=>{expect(signedTrend([10,12,20,22]).label).toBe("Trending higher");expect(signedTrend([20,22,10,12]).label).toBe("Trending lower");});
 it("handles insufficient and invalid observations",()=>expect(signedTrend([1,Number.NaN,-2]).label).toBe("No clear signal"));
});