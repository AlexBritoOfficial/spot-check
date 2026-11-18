import { describe, expect, it } from "vitest";
import {
  MAX_RADIUS_METERS,
  nearbySpotsQuerySchema,
} from "./nearbySpotsQuerySchema";

describe("nearbySpotsQuerySchema", () => {
  it("accepts no params at all (falls back to the unfiltered list)", () => {
    const result = nearbySpotsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts lat/lng/radius as query-string strings and coerces them", () => {
    const result = nearbySpotsQuerySchema.safeParse({
      lat: "42.36",
      lng: "-71.05",
      radius: "5000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ lat: 42.36, lng: -71.05, radius: 5000 });
    }
  });

  it("rejects lat without lng", () => {
    const result = nearbySpotsQuerySchema.safeParse({ lat: "42.36" });
    expect(result.success).toBe(false);
  });

  it("rejects lng without lat", () => {
    const result = nearbySpotsQuerySchema.safeParse({ lng: "-71.05" });
    expect(result.success).toBe(false);
  });

  it("rejects an out-of-range latitude", () => {
    const result = nearbySpotsQuerySchema.safeParse({
      lat: "91",
      lng: "0",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a radius beyond MAX_RADIUS_METERS", () => {
    const result = nearbySpotsQuerySchema.safeParse({
      lat: "42.36",
      lng: "-71.05",
      radius: String(MAX_RADIUS_METERS + 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-positive radius", () => {
    const result = nearbySpotsQuerySchema.safeParse({
      lat: "42.36",
      lng: "-71.05",
      radius: "0",
    });
    expect(result.success).toBe(false);
  });
});
