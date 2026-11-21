import { useMutation } from "@tanstack/react-query";
import { uploadPhoto } from "./photoRepository";

export function useUploadPhoto() {
  return useMutation({
    mutationFn: uploadPhoto,
  });
}
