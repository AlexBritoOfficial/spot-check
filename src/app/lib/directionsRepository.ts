import { extractErrorMessage } from "./spotRepository";

export interface DirectionsStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  wayPointIndex: number;
}

export interface DirectionsResult {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  steps: DirectionsStep[];
}

export async function getDirections(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<DirectionsResult> {
  const response = await fetch(
    `/api/directions?${new URLSearchParams({
      fromLat: String(from.lat),
      fromLng: String(from.lng),
      toLat: String(to.lat),
      toLng: String(to.lng),
    })}`,
  );

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
}
