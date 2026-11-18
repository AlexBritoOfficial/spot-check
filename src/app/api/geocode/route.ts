import { geocodeQuerySchema } from "@/app/lib/geocodeQuerySchema";
import { NextRequest, NextResponse } from "next/server";

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const result = geocodeQuerySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 },
    );
  }

  const url = new URL(NOMINATIM_SEARCH_URL);
  url.searchParams.set("q", result.data.q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  let response: Response;
  try {
    response = await fetch(url, {
      // Nominatim's usage policy requires an identifying User-Agent; requests without one get rejected.
      headers: { "User-Agent": "spot-check (learning project)" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to reach geocoding service" },
      { status: 502 },
    );
  }

  if (!response.ok) {
    console.error(`Nominatim responded with ${response.status}`);
    return NextResponse.json(
      { error: "Geocoding service error" },
      { status: 502 },
    );
  }

  const [place]: NominatimResult[] = await response.json();

  if (!place) {
    return NextResponse.json({ error: "No results found" }, { status: 404 });
  }

  return NextResponse.json({
    lat: Number(place.lat),
    lng: Number(place.lon),
    displayName: place.display_name,
  });
}
