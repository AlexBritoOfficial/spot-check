const EARTH_RADIUS_METERS = 6_371_000;

type LngLat = [number, number];

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance between two [lng, lat] points, in meters. */
export function haversineMeters(a: LngLat, b: LngLat): number {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Index of the route coordinate closest to `point`. */
export function nearestPointIndex(
  point: LngLat,
  coordinates: LngLat[],
): number {
  let bestIndex = 0;
  let bestDistance = Infinity;
  coordinates.forEach((coord, index) => {
    const distance = haversineMeters(point, coord);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

/** Closest distance from `point` to any vertex of the route — a reasonable
 * approximation of distance-to-route given ORS returns densely-spaced
 * points, used only for an off-course threshold check, not for rendering. */
export function distanceToRoute(point: LngLat, coordinates: LngLat[]): number {
  const index = nearestPointIndex(point, coordinates);
  return haversineMeters(point, coordinates[index]);
}

/** Sum of segment lengths between two coordinate indices (inclusive). */
export function distanceAlongRoute(
  coordinates: LngLat[],
  fromIndex: number,
  toIndex: number,
): number {
  let total = 0;
  for (let i = fromIndex; i < toIndex; i++) {
    total += haversineMeters(coordinates[i], coordinates[i + 1]);
  }
  return total;
}
