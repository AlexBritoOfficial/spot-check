import { useSyncExternalStore } from "react";

// Matches the max-width: 699px breakpoint used throughout the phone-
// responsive layout (FilterBar, MapView, SpotCheckNav, etc.).
const PHONE_QUERY = "(max-width: 699px)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(PHONE_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(PHONE_QUERY).matches;
}

function getServerSnapshot() {
  return null;
}

// null until mounted (viewport is unknown during SSR), then the live
// match — kept in sync with resize/rotation via the MediaQueryList's
// own change event.
export function useIsPhone(): boolean | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
