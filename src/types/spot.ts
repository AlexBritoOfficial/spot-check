import type {
  SpotType,
  Feature,
  Status,
  Difficulty,
} from "@/generated/prisma/enums";

export type { SpotType, Feature, Status, Difficulty };

export type Spot = {
  id: string;
  ownerId?: number;
  name: string;
  city: string;
  spotType: SpotType;
  description?: string;
  features: Feature[];
  difficulty: Difficulty;
  isSkateable: boolean;
  isPublic: boolean;
  rating: number;
  latLng: { lat: number; lng: number };
  photo?: string;
  status: Status;
  createdAt: string;
};
