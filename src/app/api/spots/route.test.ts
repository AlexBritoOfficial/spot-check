import { PrismaPg } from "@prisma/adapter-pg";
import { NextRequest } from "next/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { GET } from "./route";

// Exercises the real ST_DWithin/ST_Distance PostGIS query against a live
// database — mocking Prisma here would only prove the mock behaves as
// configured, not that the geo math is correct.
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const REFERENCE = { lat: 40, lng: -75 };

// Hand-placed at known distances from REFERENCE (not reusing mockSpots.ts,
// so this test doesn't silently break if that mock data changes):
// ~140m, ~1.4km, and ~140km away. Both the near/mid radius and the margin
// to "far" are generous enough to not depend on the precise PostGIS
// geography-vs-planar distance, just the rough ordering.
const fixtures = [
  { name: "__test_near__", lat: 40.001, lng: -75.001 },
  { name: "__test_mid__", lat: 40.01, lng: -75.01 },
  { name: "__test_far__", lat: 41, lng: -74 },
];

async function createFixtureSpot(fixture: (typeof fixtures)[number]) {
  const spot = await prisma.spot.create({
    data: {
      name: fixture.name,
      city: "Test City",
      spotType: "street",
      features: [],
      difficulty: "beginner",
      isSkateable: true,
      isPublic: true,
      rating: 0,
      status: "active",
      createdAt: new Date(),
    },
  });

  await prisma.$executeRaw`
    UPDATE "Spot"
    SET "latLng" = ST_SetSRID(ST_MakePoint(${fixture.lng}, ${fixture.lat}), 4326)
    WHERE "id" = ${spot.id}
  `;
}

describe("GET /api/spots — nearby PostGIS query", () => {
  beforeAll(async () => {
    for (const fixture of fixtures) {
      await createFixtureSpot(fixture);
    }
  });

  afterAll(async () => {
    await prisma.spot.deleteMany({
      where: { name: { in: fixtures.map((f) => f.name) } },
    });
    await prisma.$disconnect();
  });

  it("returns only spots within the radius, ordered nearest-first", async () => {
    const request = new NextRequest(
      `http://localhost/api/spots?lat=${REFERENCE.lat}&lng=${REFERENCE.lng}&radius=5000`,
    );

    const response = await GET(request);
    expect(response.status).toBe(200);

    const body: { name: string }[] = await response.json();
    const names = body.map((s) => s.name).filter((n) => n.startsWith("__test_"));

    expect(names).toEqual(["__test_near__", "__test_mid__"]);
  });

  it("excludes spots outside the radius", async () => {
    const request = new NextRequest(
      `http://localhost/api/spots?lat=${REFERENCE.lat}&lng=${REFERENCE.lng}&radius=5000`,
    );

    const response = await GET(request);
    const body: { name: string }[] = await response.json();
    const names = body.map((s) => s.name);

    expect(names).not.toContain("__test_far__");
  });
});
