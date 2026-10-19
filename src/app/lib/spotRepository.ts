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
  throw new Error("createSpot is not implemented yet");
}
