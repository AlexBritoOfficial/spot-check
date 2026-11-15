import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSpot } from "./spotRepository";
import { Spot } from "@/types/spot";

export function useUpdateSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, spot }: { id: string; spot: Omit<Spot, "id"> }) =>
      updateSpot(id, spot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spots"] });
    },
  });
}
