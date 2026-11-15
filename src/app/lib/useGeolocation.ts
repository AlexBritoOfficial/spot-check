import { useEffect, useState } from "react";

type GeolocationStatus = "idle" | "granted" | "denied" | "unavailable";

interface GeolocationState {
  coords: { lat: number; lng: number } | null;
  status: GeolocationStatus;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>(() => ({
    coords: null,
    status: navigator.geolocation ? "idle" : "unavailable",
  }));

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          status: "granted",
        });
      },
      (error) => {
        setState({
          coords: null,
          status:
            error.code === error.PERMISSION_DENIED ? "denied" : "unavailable",
        });
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }, []);

  return state;
}
