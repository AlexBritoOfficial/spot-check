import { useEffect, useRef, useState } from "react";

type LiveNavigationStatus = "idle" | "tracking" | "denied" | "unavailable";

interface LiveNavigationState {
  coords: { lat: number; lng: number } | null;
  status: LiveNavigationStatus;
}

/** Continuously tracks the user's real position while `active`, for turn-by-
 * turn navigation. Separate from useGeolocation (a one-shot fetch used for
 * the static "you are here" marker) since watchPosition polls continuously
 * and should only run while actually navigating, not on every page load.
 *
 * `onPosition` fires from inside watchPosition's own callback (not from the
 * effect body), so reacting to it — e.g. ending navigation on arrival,
 * triggering a reroute — doesn't hit the "don't setState synchronously in
 * an effect" rule the way doing that reactively from the returned `coords`
 * in a separate effect would. */
export function useLiveNavigation(
  active: boolean,
  onPosition?: (coords: { lat: number; lng: number }) => void,
): LiveNavigationState {
  const [state, setState] = useState<LiveNavigationState>(() => ({
    coords: null,
    status: navigator.geolocation ? "idle" : "unavailable",
  }));
  const onPositionRef = useRef(onPosition);
  useEffect(() => {
    onPositionRef.current = onPosition;
  }, [onPosition]);

  useEffect(() => {
    if (!active || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setState({ coords, status: "tracking" });
        onPositionRef.current?.(coords);
      },
      (error) => {
        setState({
          coords: null,
          status:
            error.code === error.PERMISSION_DENIED
              ? "denied"
              : "unavailable",
        });
      },
      { enableHighAccuracy: true, maximumAge: 2_000, timeout: 10_000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setState({ coords: null, status: "idle" });
    };
  }, [active]);

  return state;
}
