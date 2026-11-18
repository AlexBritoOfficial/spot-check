import { useMutation } from "@tanstack/react-query";
import { getDirections } from "./directionsRepository";

interface DirectionsParams {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
}

export function useDirections() {
  return useMutation({
    mutationFn: ({ from, to }: DirectionsParams) => getDirections(from, to),
  });
}
