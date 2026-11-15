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

export async function createSpot(spot: Omit<Spot, "id">): Promise<Spot> {
  const response = await fetch("/api/spots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(spot),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
}

export async function updateSpot(
  id: string,
  spot: Omit<Spot, "id">,
): Promise<Spot> {
  const response = await fetch(`/api/spots/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(spot),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
}

export async function deleteSpot(id: string): Promise<void> {
  const response = await fetch(`/api/spots/${id}`, { method: "DELETE" });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }
}

async function extractErrorMessage(response: Response): Promise<string> {
  const body = await response.json().catch(() => null);
  const message =
    typeof body?.error === "string" ? body.error : JSON.stringify(body?.error);
  return message ?? `Request failed with status ${response.status}`;
}
