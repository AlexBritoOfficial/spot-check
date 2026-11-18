import { useMutation } from "@tanstack/react-query";
import { geocodeLocation } from "./geocodeRepository";

export function useGeocode() {
  return useMutation({
    mutationFn: geocodeLocation,
  });
}
