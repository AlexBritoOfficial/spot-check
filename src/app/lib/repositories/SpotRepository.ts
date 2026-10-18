import { Spot } from "@/types/spot";

export async function getSpots(): Promise<Spot[]> {
  const response = await fetch("/api/spots");

  if (!response.ok) {
    throw new Error(`HTTP Error: Status ${response.status}`);
  }

  const data: Spot[] = await response.json();

  return data;
}

// export async function createSpot(spot: Omit<Spot, "id">): Promise<Spot>; {
//     return swait fetch("")
// }
