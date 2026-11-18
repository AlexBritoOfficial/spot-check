import z from "zod";

export const MAX_RADIUS_METERS = 100_000;

export const nearbySpotsQuerySchema = z
  .object({
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    radius: z.coerce.number().positive().max(MAX_RADIUS_METERS).optional(),
  })
  .refine((data) => (data.lat === undefined) === (data.lng === undefined), {
    message: "lat and lng must be provided together",
    path: ["lat"],
  });

export type NearbySpotsQuery = z.infer<typeof nearbySpotsQuerySchema>;
