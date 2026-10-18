import SpotCheckNav from "./components/spot-check-nav-bar/SpotCheckNav.component";
import LeafLet from "./components/leaflet/LeafletMap";

export default function Home() {
  return (
    <div>
      <SpotCheckNav />
      <LeafLet />
    </div>
  );
}
