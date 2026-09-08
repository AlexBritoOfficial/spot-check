import SpotCheckNav from "./components/spot-check-nav-bar/SpotCheckNav.component";
import FilterBar from "./components/filter-bar/FilterBar";
import LeafLet from "./components/leaflet/leaflet";
import { mockSpots } from "./data/mockSpots";

export default function Home() {
  const spots = mockSpots;
  return (
    <div>
      <SpotCheckNav />
      <FilterBar />
      {/* <SpotDetailCard spot={spot} /> */}
      {/* <NewSpotCard /> */}
      <LeafLet spots={spots} />
    </div>
  );
}
