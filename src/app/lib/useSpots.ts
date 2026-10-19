import { useQuery } from "@tanstack/react-query";
import { getSpots } from "./spotRepository";

export function useSpots() {
  return useQuery({ queryKey: ["spots"], queryFn: getSpots });
}
