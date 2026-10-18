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

  const spots: Spot[] = rawSpots.map((spot) => {
    return {
      id: spot.spotId,
      name: spot.name,
      city: spot.city,
      spotType: spot.spotType,
      description: spot.description,
      features: spot.features,
      difficulty: spot.difficulty,
      isSkateable: spot.isSkateable,
      isPublic: spot.isPublic,
      rating: spot.rating,
      latLng: { lat: spot.lat, lng: spot.lng },
      photo: spot.photo,
      status: spot.status,
      createdAt: spot.createdAt,
    };
  });

  return NextResponse.json(spots);
}
