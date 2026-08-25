import NewSpotCard from "./components/card/NewSpotCard";
import SpotDetailCard from "./components/card/SpotDetailCard";
import SpotCheckNav from "./components/spot-check-nav-bar/SpotCheckNav.component";
import FilterBar from "./components/filter-bar/FilterBar";
import { useState } from "react";
import { Spot } from "@/types/spot";

let spot: Spot = {
  id: 1,
  name: "Eggs",
  city: "Boston",
  spot_type: "street",
  description: "Ledges by the water",
  features: ["plaza", "ledge", "stairs"],
  difficulty: "intermediate",
  is_skateable: true,
  rating: 5,
  lat_lng: { lat: 42.3677894, lng: -71.0666299 },
  photo: "",
  status: "active",
  created_at: "2026-08-02",
};

// const [spotData, setSpotData] = useState<SpotData>()

export default function Home() {
  return (
    <div>
      <SpotCheckNav />
      <FilterBar />
      {/* <SpotDetailCard spot={spot} /> */}
      {/* <NewSpotCard /> */}
    </div>
  );
}
