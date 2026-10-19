import { prisma } from "@/app/lib/prisma";
import {
  Difficulty,
  Feature,
  SpotType,
  Status,
} from "@/generated/prisma/enums";
import { Spot } from "@/types/spot";
import { NextResponse } from "next/server";

export async function GET() {
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

  const rawSpots = await prisma.$queryRaw<RawSpotRow[]>`
        SELECT  "id",
                "name",
                "spotId", 
                "city", 
                "spotType",
                "description",
                "features",
                "difficulty",
                "isSkateable",
                "isPublic",
                "rating",
                ST_X("latLng") AS lng,
                ST_Y("latLng") AS lat,
                "photo",
                "status",
                "createdAt"

        FROM "Spot" 
    `;

  const spots: Spot[] = rawSpots.map(({ spotId, lat, lng, ...rest }) => ({
    ...rest,
    id: spotId,
    latLng: { lat, lng },
  }));

  return NextResponse.json(spots);
}
