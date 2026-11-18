import { extractErrorMessage } from "./spotRepository";

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeLocation(query: string): Promise<GeocodeResult> {
  const response = await fetch(
    `/api/geocode?${new URLSearchParams({ q: query })}`,
  );

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
}
