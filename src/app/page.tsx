import NewSpotCard from "./components/card/NewSpotCard";
import SpotCheckNav from "./components/spot-check-nav-bar/SpotCheckNav.component";

export default function Home() {
  return (
    <div>
      <SpotCheckNav />
      <NewSpotCard />
    </div>
  );
}
