import { directionsQuerySchema } from "@/app/lib/directionsQuerySchema";
import { NextRequest, NextResponse } from "next/server";

const ORS_DIRECTIONS_URL =
  "https://api.openrouteservice.org/v2/directions/cycling-regular/geojson";

type OrsStep = {
  instruction: string;
  distance: number;
  duration: number;
  way_points: [number, number];
};

type OrsRouteFeature = {
  geometry: { coordinates: [number, number][] };
  properties: {
    summary: { distance: number; duration: number };
    segments: { steps: OrsStep[] }[];
  };
};

type OrsResponse = { features: OrsRouteFeature[] };

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPEN_ROUTE_SERVICE;
  if (!apiKey) {
    console.error("OPEN_ROUTE_SERVICE is not set");
    return NextResponse.json(
      { error: "Directions are not configured" },
      { status: 500 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const result = directionsQuerySchema.safeParse({
    fromLat: searchParams.get("fromLat") ?? undefined,
    fromLng: searchParams.get("fromLng") ?? undefined,
    toLat: searchParams.get("toLat") ?? undefined,
    toLng: searchParams.get("toLng") ?? undefined,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 },
    );
  }

  const { fromLat, fromLng, toLat, toLng } = result.data;

  let response: Response;
  try {
    response = await fetch(ORS_DIRECTIONS_URL, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [fromLng, fromLat],
          [toLng, toLat],
        ],
        instructions: true,
      }),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to reach directions service" },
      { status: 502 },
    );
  }

  if (!response.ok) {
    console.error(`OpenRouteService responded with ${response.status}`);
    // ORS has no route between the two points (e.g. across an ocean) — a
    // real, expected outcome for a "beginner" skate spot map, not a server
    // failure, so give it its own status rather than a generic 502.
    if (response.status === 404 || response.status === 400) {
      return NextResponse.json(
        { error: "No route found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Directions service error" },
      { status: 502 },
    );
  }

  const data: OrsResponse = await response.json();
  const route = data.features[0];

  if (!route) {
    return NextResponse.json({ error: "No route found" }, { status: 404 });
  }

  const steps = route.properties.segments.flatMap((segment) =>
    segment.steps.map((step) => ({
      instruction: step.instruction,
      distanceMeters: step.distance,
      durationSeconds: step.duration,
      wayPointIndex: step.way_points[0],
    })),
  );

  return NextResponse.json({
    coordinates: route.geometry.coordinates,
    distanceMeters: route.properties.summary.distance,
    durationSeconds: route.properties.summary.duration,
    steps,
  });
}
