import z from "zod";

export const geocodeQuerySchema = z.object({
  q: z.string().trim().min(1, "q is required"),
});

export type GeocodeQuery = z.infer<typeof geocodeQuerySchema>;
