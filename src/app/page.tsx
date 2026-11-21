"use client";

import { useEffect, useState } from "react";
import SpotCheckNav from "./components/spot-check-nav-bar/SpotCheckNav.component";
import MapView from "./components/map/MapViewLoader";
import GetTheApp from "./components/get-the-app/GetTheApp";
import SplashScreen from "./components/splash/SplashScreen";
import { useIsPhone } from "./lib/useIsPhone";

const SPLASH_DURATION_MS = 1500;

export default function Home() {
  const [searchedLocation, setSearchedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const isPhone = useIsPhone();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  // Also covers the brief window before isPhone is known on mount.
  if (showSplash || isPhone === null) return <SplashScreen />;
  if (isPhone) return <GetTheApp />;

  return (
    <div className="flex flex-col h-screen">
      <SpotCheckNav onLocationFound={setSearchedLocation} />
      <MapView searchedLocation={searchedLocation} />
    </div>
  );
}
