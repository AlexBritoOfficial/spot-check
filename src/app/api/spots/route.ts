import { prisma } from "@/app/lib/prisma";
import { nearbySpotsQuerySchema } from "@/app/lib/nearbySpotsQuerySchema";
import { spotSchema } from "@/app/lib/spotSchema";
import {
  Difficulty,
  Feature,
  SpotType,
  Status,
} from "@/generated/prisma/enums";
import { Spot } from "@/types/spot";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_RADIUS_METERS = 8000;

type RawSpotRow = {
  id: number;
  spotId: string;
  name: string;
  city: string;
  spotType: SpotType;
  description: string;
  features: Feature[];
  difficulty: Difficulty;
  isSkateable: boolean;
  isPublic: boolean;
  rating: number;
  lng: number;
  lat: number;
  photo: string;
  status: Status;
  createdAt: string;
};

type RawNearbySpotRow = RawSpotRow & { distanceMeters: number };

function reshapeSpot({
  spotId,
  lat,
  lng,
  ...rest
}: RawSpotRow | RawNearbySpotRow): Spot {
  return { ...rest, id: spotId, latLng: { lat, lng } };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const result = nearbySpotsQuerySchema.safeParse({
    lat: searchParams.get("lat") ?? undefined,
    lng: searchParams.get("lng") ?? undefined,
    radius: searchParams.get("radius") ?? undefined,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 },
    );
  }

  const { lat, lng, radius } = result.data;

  try {
    if (lat !== undefined && lng !== undefined) {
      const rawSpots = await prisma.$queryRaw<RawNearbySpotRow[]>`
        SELECT  "id",
                "name",
                "spotId",
                "city",
                "spotType",
                "description",
                "features"::text[] AS features,
                "difficulty",
                "isSkateable",
                "isPublic",
                "rating",
                ST_X("latLng"::geometry) AS lng,
                ST_Y("latLng"::geometry) AS lat,
                "photo",
                "status",
                "createdAt",
                ST_Distance("latLng", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) AS "distanceMeters"
        FROM "Spot"
        WHERE ST_DWithin("latLng", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radius ?? DEFAULT_RADIUS_METERS})
        ORDER BY "distanceMeters" ASC
      `;

      return NextResponse.json(rawSpots.map(reshapeSpot));
    }

    const rawSpots = await prisma.$queryRaw<RawSpotRow[]>`
        SELECT  "id",
                "name",
                "spotId",
                "city",
                "spotType",
                "description",
                "features"::text[] AS features,
                "difficulty",
                "isSkateable",
                "isPublic",
                "rating",
                ST_X("latLng"::geometry) AS lng,
                ST_Y("latLng"::geometry) AS lat,
                "photo",
                "status",
                "createdAt"

        FROM "Spot"
    `;

    return NextResponse.json(rawSpots.map(reshapeSpot));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch spots" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = spotSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 },
    );
  }

  const { latLng, ...rest } = result.data;

  try {
    const spot = await prisma.spot.create({
      data: {
        ...rest,
      },
    });

    await prisma.$executeRaw`UPDATE "Spot"
      SET "latLng" = ST_SetSRID(ST_MakePoint(${latLng.lng}, ${latLng.lat}), 4326) WHERE "id" = ${spot.id}`;

    const { spotId, ...spotFields } = spot;
    const createdSpot = { ...spotFields, id: spotId, latLng };

    return NextResponse.json(createdSpot, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create spot" },
      { status: 500 },
    );
  }
}
