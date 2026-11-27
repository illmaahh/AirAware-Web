import { describe, expect, it } from "vitest";
import { normalizeCityName } from "../lib/city";

describe("normalizeCityName", () => {
  it.each([
    ["  New   Delhi  ", "New Delhi"],
    ["São Paulo", "São Paulo"],
    ["St. John's", "St. John's"],
    ["Washington, D.C.", "Washington, D.C."],
    ["A&B (Central)", "A&B (Central)"],
  ])("normalizes the city query %s", (input, expected) => {
    expect(normalizeCityName(input)).toBe(expected);
  });

  it.each([null, undefined, "", "   ", "<script>alert(1)</script>", "Delhi\nMumbai", "x".repeat(101)])(
    "rejects an invalid city query",
    (input) => {
      expect(normalizeCityName(input)).toBeNull();
    },
  );

  it("accepts a city name at the 100-character limit", () => {
    expect(normalizeCityName("A".repeat(100))).toBe("A".repeat(100));
  });
});
