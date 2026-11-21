import { extractErrorMessage } from "./spotRepository";

export async function uploadPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  const { url } = await response.json();
  return url;
}
