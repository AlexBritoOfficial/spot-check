import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSpot } from "./spotRepository";

export function useDeleteSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSpot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spots"] });
    },
  });
}
