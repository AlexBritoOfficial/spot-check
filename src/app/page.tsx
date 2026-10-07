import SpotCheckNav from "./components/spot-check-nav-bar/SpotCheckNav.component";
import LeafLet from "./components/leaflet/LeafletMap";
import { mockSpots } from "./data/mockSpots";

export default function Home() {
  const spots = mockSpots;

  return (
    <div>
      <SpotCheckNav />
      <LeafLet spots={spots} />
    </div>
  );
}
