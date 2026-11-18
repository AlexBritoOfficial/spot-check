import { describe, expect, it } from "vitest";
import { geocodeQuerySchema } from "./geocodeQuerySchema";

describe("geocodeQuerySchema", () => {
  it("accepts a non-empty query", () => {
    const result = geocodeQuerySchema.safeParse({ q: "Barcelona" });
    expect(result.success).toBe(true);
  });

  it("trims surrounding whitespace", () => {
    const result = geocodeQuerySchema.safeParse({ q: "  Barcelona  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("Barcelona");
    }
  });

  it("rejects an empty query", () => {
    const result = geocodeQuerySchema.safeParse({ q: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only query", () => {
    const result = geocodeQuerySchema.safeParse({ q: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects a missing q", () => {
    const result = geocodeQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
