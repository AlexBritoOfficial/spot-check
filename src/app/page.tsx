"use client";

import { useState } from "react";
import SpotCheckNav from "./components/spot-check-nav-bar/SpotCheckNav.component";
import MapView from "./components/map/MapViewLoader";
import GetTheApp from "./components/get-the-app/GetTheApp";
import { useIsPhone } from "./lib/useIsPhone";

export default function Home() {
  const [searchedLocation, setSearchedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const isPhone = useIsPhone();

  // Unknown until mounted — render nothing rather than flash the wrong UI.
  if (isPhone === null) return null;
  if (isPhone) return <GetTheApp />;

  return (
    <div className="flex flex-col h-screen">
      <SpotCheckNav onLocationFound={setSearchedLocation} />
      <MapView searchedLocation={searchedLocation} />
    </div>
  );
}
