import { Spot } from "@/types/spot";

export async function getSpots(): Promise<Spot[]> {
  const response = await fetch("/api/spots");

  if (!response.ok) {
    throw new Error(`HTTP Error: Status ${response.status}`);
  }

  const json = await response.json();

  return toSpots(json);
}

function toSpots(json: unknown): Spot[] {
  return json as Spot[];
}

// Phase 8 wires this into NewSpotCard's onSave via useMutation.
export async function createSpot(spot: Omit<Spot, "id">): Promise<Spot> {
  const response = await fetch("/api/spots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(spot),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      typeof body?.error === "string"
        ? body.error
        : JSON.stringify(body?.error);
    throw new Error(message ?? `Request failed with status ${response.status}`);
  }

  return response.json();
}
