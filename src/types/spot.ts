export type SpotType = "park" | "street" | "diy";

export type Feature = "ledge" | "rail" | "plaza" | "stairs" | "skatepark";

export type Status = "active" | "pending" | "closed";

export type Difficulty = "beginner" | "intermediate" | "advanced" | "pro";

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
