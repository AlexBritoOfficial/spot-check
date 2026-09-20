import SpotCheckNav from "./components/spot-check-nav-bar/SpotCheckNav.component";
import FilterBar from "./components/filter-bar/FilterBar";
import LeafLet from "./components/leaflet/LeafletMap";
import { mockSpots } from "./data/mockSpots";
import { useState } from "react";

export default function Home() {
  const spots = mockSpots;

  return (
    <div>
      <SpotCheckNav />
      <LeafLet spots={spots} />
    </div>
  );
}
