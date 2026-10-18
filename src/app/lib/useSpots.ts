import { useQuery } from "@tanstack/react-query";
import { getSpots } from "./repositories/SpotRepository";

export function useSpots() {
  return useQuery({ queryKey: ["spots"], queryFn: getSpots });
}
