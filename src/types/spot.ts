export type SpotType = "park" | "street" | "diy";

export type Feature = "ledge" | "rail" | "plaza" | "stairs" | "skatepark";

export type Status = "active" | "pending" | "closed";

export type Spot = {
  id: number;
  name: string;
  city: string;
  spot_type: SpotType;
  description?: string;
  features: Feature[];
  is_skateable: boolean;
  rating: number;
  lat_lng: { lat: number; lng: number };
  photo?: string;
  status: Status;
  created_at: string;
};
