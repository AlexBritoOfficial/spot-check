"use client";

import { useState } from "react";
import SpotCheckNav from "./components/spot-check-nav-bar/SpotCheckNav.component";
import MapView from "./components/map/MapViewLoader";

export default function Home() {
  const [searchedLocation, setSearchedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  return (
    <div className="flex flex-col h-screen">
      <SpotCheckNav onLocationFound={setSearchedLocation} />
      <MapView searchedLocation={searchedLocation} />
    </div>
  );
}
