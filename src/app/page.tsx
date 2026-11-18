"use client";

import { useState } from "react";
import SpotCheckNav from "./components/spot-check-nav-bar/SpotCheckNav.component";
import LeafLet from "./components/leaflet/LeafletMap";

export default function Home() {
  const [searchedLocation, setSearchedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  return (
    <div className="flex flex-col h-screen">
      <SpotCheckNav onLocationFound={setSearchedLocation} />
      <LeafLet searchedLocation={searchedLocation} />
    </div>
  );
}
