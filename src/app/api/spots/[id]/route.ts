import { prisma } from "@/app/lib/prisma";
import { spotSchema } from "@/app/lib/spotSchema";
import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;

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
    const spot = await prisma.spot.update({
      where: { spotId: id },
      data: {
        ...rest,
      },
    });

    await prisma.$executeRaw`UPDATE "Spot"
      SET "latLng" = ST_SetSRID(ST_MakePoint(${latLng.lng}, ${latLng.lat}), 4326) WHERE "id" = ${spot.id}`;

    const { spotId, ...spotFields } = spot;
    const updatedSpot = { ...spotFields, id: spotId, latLng };

    return NextResponse.json(updatedSpot);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Spot not found" }, { status: 404 });
    }

    console.error(error);
    return NextResponse.json(
      { error: "Failed to update spot" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    await prisma.spot.delete({ where: { spotId: id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Spot not found" }, { status: 404 });
    }

    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete spot" },
      { status: 500 },
    );
  }
}
