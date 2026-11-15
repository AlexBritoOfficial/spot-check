import { useQuery } from "@tanstack/react-query";
import { getSpots, NearbyParams } from "./spotRepository";

export function useSpots(nearby?: NearbyParams) {
  return useQuery({
    queryKey: ["spots", nearby?.lat, nearby?.lng, nearby?.radius],
    queryFn: () => getSpots(nearby),
  });
}
