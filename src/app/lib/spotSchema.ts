import {
  Difficulty,
  Feature,
  SpotType,
  Status,
} from "@/generated/prisma/enums";

import z from "zod";

export const spotSchema = z.object({
  name: z.string().min(1),
  city: z.string(),
  spotType: z.enum(SpotType),
  description: z.string().optional(),
  features: z.array(z.enum(Feature)),
  difficulty: z.enum(Difficulty),
  isSkateable: z.boolean(),
  isPublic: z.boolean(),
  rating: z.number().min(0).max(5),
  latLng: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  photo: z.string().optional(),
  status: z.enum(Status),
  createdAt: z.string(),
  ownerId: z.string().optional(),
});

export type NewSpot = z.infer<typeof spotSchema>;
