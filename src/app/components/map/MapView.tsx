"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  GeoJSONSource,
  LngLatBounds,
  MapLibreMap,
  Marker,
  NavigationControl,
  setWorkerUrl,
  type MapMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Spot } from "@/types/spot";
import NewSpotCard from "../card/NewSpotCard";
import SpotDetailCard from "../card/SpotDetailCard";
import NavigationHud from "../navigation/NavigationHud";
import ConfirmDialog from "../confirm-dialog/ConfirmDialog";
import FilterBar from "../filter-bar/FilterBar";
import { useSpots } from "@/app/lib/useSpots";
import { useCreateSpot } from "@/app/lib/useCreateSpot";
import { useUpdateSpot } from "@/app/lib/useUpdateSpot";
import { useDeleteSpot } from "@/app/lib/useDeleteSpot";
import { useDirections } from "@/app/lib/useDirections";
import { useGeolocation } from "@/app/lib/useGeolocation";
import { useLiveNavigation } from "@/app/lib/useLiveNavigation";
import {
  distanceAlongRoute,
  distanceToRoute,
  haversineMeters,
  nearestPointIndex,
} from "@/app/lib/geo";
import styles from "./MapView.module.css";

const DIRECTIONS_SOURCE_ID = "directions-route";
const DIRECTIONS_LINE_COLOR = "#e5a800"; // --color-accent's approx hex — MapLibre paint can't read CSS vars

// Close enough to the destination to call it "arrived" and auto-end
// navigation; far enough off the drawn route to trigger a reroute from the
// user's current live position rather than waiting for them to backtrack.
const ARRIVAL_THRESHOLD_METERS = 20;
const OFF_COURSE_THRESHOLD_METERS = 40;

const DEFAULT_CITY = { lat: 42.361145, lng: -71.057083 };

// Stable reference so FilterBar's spots prop doesn't change identity on
// every render while the query is still loading — `spots ?? []` would
// otherwise create a new empty array each render, which FilterBar's effect
// depends on, triggering a render loop until real data arrives.
const EMPTY_SPOTS: Spot[] = [];

// Free, keyless vector tiles — see https://tiles.openfreemap.org.
// CARTO's basemaps (the earlier go-to for a free dark style) now require
// an API key and watermark keyless requests, which is why this isn't CARTO.
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// MapLibre resolves its worker relative to its own bundled file, which
// Webpack doesn't preserve — the worker has to be served as a static file
// instead. Copied into public/ by postinstall (see package.json), gitignored
// like the Prisma client since it's just a copy of a node_modules file.
setWorkerUrl("/maplibre-gl-worker.mjs");

function createPinElement(selected: boolean, label?: string): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = selected
    ? `${styles.pinWrapper} ${styles.pinWrapperSelected}`
    : styles.pinWrapper;

  const shape = document.createElement("div");
  shape.className = selected
    ? `${styles.pinShape} ${styles.pinShapeSelected}`
    : styles.pinShape;
  wrapper.appendChild(shape);

  if (label) {
    const labelEl = document.createElement("div");
    labelEl.className = styles.pinLabel;
    labelEl.textContent = label;
    wrapper.appendChild(labelEl);
  }

  return wrapper;
}

function createGhostPinElement(): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = styles.ghostPinWrapper;

  const el = document.createElement("div");
  el.className = styles.ghostPin;
  wrapper.appendChild(el);

  return wrapper;
}

function createYouAreHereElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = styles.youAreHere;
  return el;
}

interface MapViewProps {
  searchedLocation?: { lat: number; lng: number } | null;
}

export default function MapView({ searchedLocation }: MapViewProps) {
  const { coords, status: geoStatus } = useGeolocation();
  const effectiveLocation = searchedLocation ?? coords ?? DEFAULT_CITY;
  const {
    data: spots,
    isLoading,
    isError,
    error,
  } = useSpots(effectiveLocation);
  const {
    mutate: createSpot,
    isPending: isCreatingSpot,
    error: createSpotError,
  } = useCreateSpot();
  const {
    mutate: updateSpot,
    isPending: isUpdatingSpot,
    error: updateSpotError,
  } = useUpdateSpot();
  const {
    mutate: deleteSpot,
    isPending: isDeletingSpot,
    error: deleteSpotError,
  } = useDeleteSpot();
  const {
    mutate: fetchDirections,
    data: directionsData,
    isPending: isDirectionsPending,
    error: directionsFetchError,
    reset: resetDirections,
  } = useDirections();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const spotMarkersRef = useRef<Marker[]>([]);
  const youAreHereMarkerRef = useRef<Marker | null>(null);
  const ghostMarkerRef = useRef<Marker | null>(null);
  const liveNavMarkerRef = useRef<Marker | null>(null);

  const [isNavigating, setIsNavigating] = useState(false);

  const [spotsFiltered, setSpotsFiltered] = useState<Spot[]>([]);
  const [recenterNonce, setRecenterNonce] = useState(0);
  const [showNewSpotCard, setShowNewSpotCard] = useState(false);
  const [showSpotDetailCard, setShowSpotDetailCard] = useState(false);
  const [showEditSpotCard, setShowEditSpotCard] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [newSpotLocation, setNewSpotLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [directionsBlockedError, setDirectionsBlockedError] =
    useState<Error | null>(null);

  const isOverlayOpen =
    showSpotDetailCard || showEditSpotCard || showDeleteConfirm;
  const directionsError = directionsBlockedError ?? directionsFetchError;

  function closeOverlays() {
    setShowSpotDetailCard(false);
    setShowEditSpotCard(false);
    setShowDeleteConfirm(false);
    resetDirections();
    setDirectionsBlockedError(null);
  }

  function handleDirections() {
    if (!spot) return;
    if (!(geoStatus === "granted" && coords)) {
      setDirectionsBlockedError(new Error("Enable location to get directions"));
      return;
    }
    setDirectionsBlockedError(null);
    fetchDirections(
      { from: coords, to: spot.latLng },
      { onSuccess: () => setIsNavigating(true) },
    );
  }

  function endNavigation() {
    setIsNavigating(false);
    resetDirections();
    setDirectionsBlockedError(null);
  }

  // Fires from inside watchPosition's own success callback, not from an
  // effect body — this is what lets arrival/reroute reactions avoid the
  // "don't setState synchronously in an effect" lint rule, since from
  // React's perspective this is just a plain callback, not effect code.
  function handlePositionUpdate(point: { lat: number; lng: number }) {
    if (!spot || !directionsData) return;

    const current: [number, number] = [point.lng, point.lat];
    const destination: [number, number] = [spot.latLng.lng, spot.latLng.lat];

    if (haversineMeters(current, destination) < ARRIVAL_THRESHOLD_METERS) {
      endNavigation();
      return;
    }

    if (
      !isDirectionsPending &&
      distanceToRoute(current, directionsData.coordinates) >
        OFF_COURSE_THRESHOLD_METERS
    ) {
      fetchDirections({ from: point, to: spot.latLng });
    }
  }

  const { coords: liveCoords } = useLiveNavigation(
    isNavigating,
    handlePositionUpdate,
  );

  // Derived turn-by-turn progress — recomputed from the live position on
  // every update rather than stored as its own state, since it's entirely a
  // function of (route, current position).
  const navProgress = useMemo(() => {
    if (!isNavigating || !directionsData || !liveCoords || !spot) return null;

    const point: [number, number] = [liveCoords.lng, liveCoords.lat];
    const lastIndex = directionsData.coordinates.length - 1;
    const currentIndex = nearestPointIndex(point, directionsData.coordinates);

    let currentStepIndex = 0;
    directionsData.steps.forEach((step, i) => {
      if (step.wayPointIndex <= currentIndex) currentStepIndex = i;
    });
    const upcomingStep =
      directionsData.steps[currentStepIndex + 1] ??
      directionsData.steps[currentStepIndex] ??
      null;

    const remainingDistanceMeters = distanceAlongRoute(
      directionsData.coordinates,
      currentIndex,
      lastIndex,
    );
    const remainingDurationSeconds =
      directionsData.distanceMeters > 0
        ? directionsData.durationSeconds *
          (remainingDistanceMeters / directionsData.distanceMeters)
        : 0;
    const distanceToNextTurnMeters = upcomingStep
      ? distanceAlongRoute(
          directionsData.coordinates,
          currentIndex,
          upcomingStep.wayPointIndex,
        )
      : 0;

    return {
      instruction: upcomingStep?.instruction ?? "Continue",
      distanceToNextTurnMeters,
      remainingDistanceMeters,
      remainingDurationSeconds,
    };
  }, [isNavigating, directionsData, liveCoords, spot]);

  function handleSaveSpot(newSpot: Omit<Spot, "id">) {
    createSpot(newSpot, {
      onSuccess: () => {
        setShowNewSpotCard(false);
        setNewSpotLocation(null);
      },
    });
  }

  function handleEditSpot(updatedSpot: Omit<Spot, "id">) {
    if (!spot) return;
    updateSpot(
      { id: spot.id, spot: updatedSpot },
      {
        onSuccess: (savedSpot) => {
          setSpot(savedSpot);
          setShowEditSpotCard(false);
        },
      },
    );
  }

  function handleConfirmDelete() {
    if (!spot) return;
    deleteSpot(spot.id, {
      onSuccess: () => {
        closeOverlays();
        setSpot(null);
      },
    });
  }

  // Create the map once. The container div is always rendered (loading and
  // error states are overlays, not alternate trees) so this ref is reliably
  // attached on the very first render.
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: [DEFAULT_CITY.lng, DEFAULT_CITY.lat],
      zoom: 13,
    });
    map.touchZoomRotate.disable();
    // Clicking a marker to select it can register as a double-click, which
    // would otherwise zoom the map instead of (or alongside) opening the
    // detail card. Explicit +/- controls already cover zooming.
    map.doubleClickZoom.disable();
    map.addControl(
      new NavigationControl({ showCompass: false }),
      "top-left",
    );
    mapRef.current = map;
    map.on("load", () => setMapReady(true));

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Map click: moves/places the pending new-spot pin, or dismisses an open
  // overlay. showNewSpotCard is deliberately excluded from isOverlayOpen so
  // clicking elsewhere while adding a spot moves the pin instead of closing.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    function handleClick(e: MapMouseEvent) {
      if (isNavigating) return;
      if (isOverlayOpen) {
        closeOverlays();
      } else {
        setNewSpotLocation({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        setShowNewSpotCard(true);
      }
    }

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- closeOverlays only calls stable setState/mutation setters, so a stale reference here can't cause a real bug
  }, [mapReady, isOverlayOpen, isNavigating]);

  // Spot pins — rebuilt whenever the filtered list or selection changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    spotMarkersRef.current.forEach((marker) => marker.remove());
    spotMarkersRef.current = spotsFiltered.map((s) => {
      const selected = showSpotDetailCard && spot?.id === s.id;
      const el = createPinElement(selected, selected ? s.name : undefined);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        resetDirections();
        setDirectionsBlockedError(null);
        setSpot(s);
        setShowSpotDetailCard(true);
      });

      return new Marker({ element: el, anchor: "bottom" })
        .setLngLat([s.latLng.lng, s.latLng.lat])
        .addTo(map);
    });

    return () => {
      spotMarkersRef.current.forEach((marker) => marker.remove());
      spotMarkersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetDirections is TanStack Query's stable mutation.reset, safe to omit
  }, [mapReady, spotsFiltered, spot, showSpotDetailCard]);

  // "You are here" marker + recenter — only when geolocation is granted and
  // no search is active (an active search already takes over the map
  // center). Combined into one effect since both parts share this exact
  // guard and always happen together; recenterNonce lets the phone
  // "locate me" button re-trigger the recenter even when coords haven't
  // changed (e.g. the user panned away and wants to return).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    youAreHereMarkerRef.current?.remove();
    youAreHereMarkerRef.current = null;

    if (!isNavigating && !searchedLocation && geoStatus === "granted" && coords) {
      youAreHereMarkerRef.current = new Marker({
        element: createYouAreHereElement(),
      })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map);
      map.setCenter([coords.lng, coords.lat]);
    }

    return () => {
      youAreHereMarkerRef.current?.remove();
      youAreHereMarkerRef.current = null;
    };

  }, [mapReady, searchedLocation, geoStatus, coords, recenterNonce, isNavigating]);

  // Fly to a searched location.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !searchedLocation) return;
    map.flyTo({ center: [searchedLocation.lng, searchedLocation.lat], zoom: 13 });
  }, [mapReady, searchedLocation]);

  // Ghost pin at the pending new-spot location.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    ghostMarkerRef.current?.remove();
    ghostMarkerRef.current = null;

    if (showNewSpotCard && newSpotLocation) {
      ghostMarkerRef.current = new Marker({
        element: createGhostPinElement(),
        anchor: "bottom",
      })
        .setLngLat([newSpotLocation.lng, newSpotLocation.lat])
        .addTo(map);
    }

    return () => {
      ghostMarkerRef.current?.remove();
      ghostMarkerRef.current = null;
    };
  }, [mapReady, showNewSpotCard, newSpotLocation]);

  // Directions route line — drawn as a GeoJSON source/layer (native to
  // MapLibre, unlike Leaflet which needed a separate routing plugin for
  // this). Fits the map to show the whole route once it's drawn.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    if (!directionsData) {
      if (map.getLayer(DIRECTIONS_SOURCE_ID)) {
        map.removeLayer(DIRECTIONS_SOURCE_ID);
      }
      if (map.getSource(DIRECTIONS_SOURCE_ID)) {
        map.removeSource(DIRECTIONS_SOURCE_ID);
      }
      return;
    }

    const geojson = {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: directionsData.coordinates,
      },
    };

    const existingSource = map.getSource(DIRECTIONS_SOURCE_ID);
    if (existingSource instanceof GeoJSONSource) {
      existingSource.setData(geojson);
    } else {
      map.addSource(DIRECTIONS_SOURCE_ID, { type: "geojson", data: geojson });
      map.addLayer({
        id: DIRECTIONS_SOURCE_ID,
        type: "line",
        source: DIRECTIONS_SOURCE_ID,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": DIRECTIONS_LINE_COLOR,
          "line-width": 5,
          "line-opacity": 0.85,
        },
      });
    }

    const [first, ...rest] = directionsData.coordinates;
    const bounds = rest.reduce(
      (b, coord) => b.extend(coord),
      new LngLatBounds(first, first),
    );
    map.fitBounds(bounds, { padding: 60 });

    return () => {
      if (map.getLayer(DIRECTIONS_SOURCE_ID)) {
        map.removeLayer(DIRECTIONS_SOURCE_ID);
      }
      if (map.getSource(DIRECTIONS_SOURCE_ID)) {
        map.removeSource(DIRECTIONS_SOURCE_ID);
      }
    };
  }, [mapReady, directionsData]);

  // Live position marker while navigating — separate from the regular
  // "you are here" marker/effect above (which is suppressed during
  // navigation) since this one updates continuously from watchPosition
  // rather than a one-shot fetch.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    liveNavMarkerRef.current?.remove();
    liveNavMarkerRef.current = null;

    if (isNavigating && liveCoords) {
      liveNavMarkerRef.current = new Marker({
        element: createYouAreHereElement(),
      })
        .setLngLat([liveCoords.lng, liveCoords.lat])
        .addTo(map);
    }

    return () => {
      liveNavMarkerRef.current?.remove();
      liveNavMarkerRef.current = null;
    };
  }, [mapReady, isNavigating, liveCoords]);

  // Follow the user while navigating.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !isNavigating || !liveCoords) return;
    map.easeTo({ center: [liveCoords.lng, liveCoords.lat], duration: 500 });
  }, [mapReady, isNavigating, liveCoords]);

  return (
    <div className="relative flex flex-1 min-h-0 flex-col">
      {/* Filter Bar */}
      <FilterBar spots={spots ?? EMPTY_SPOTS} setSpotsFiltered={setSpotsFiltered} />

      <div className={styles.mapContainer} ref={mapContainerRef}>
        {isLoading && (
          <div className={styles.statusBanner}>Loading spots...</div>
        )}
        {isError && (
          <div className={styles.statusBanner}>{error.message}</div>
        )}
      </div>

      {/* Phone only: replaces the desktop "+Add Spot" nav button (see
          SpotCheckNav.module.css). Hidden while any sheet is open. */}
      {!showNewSpotCard &&
        !showEditSpotCard &&
        !showSpotDetailCard &&
        !isNavigating && (
        <div className={styles.fabStack}>
          <button
            type="button"
            className={styles.locateButton}
            aria-label="Center on my location"
            onClick={() => setRecenterNonce((n) => n + 1)}
          >
            <span className={styles.locateDot} />
          </button>
          <button
            type="button"
            className={styles.fabButton}
            onClick={() => {
              setNewSpotLocation(effectiveLocation);
              setShowNewSpotCard(true);
            }}
          >
            + Add spot
          </button>
        </div>
      )}

      {/* Card positioned absolutely on top (floating card on desktop/tablet,
          bottom sheet on phone — see MapView.module.css) */}
      {showNewSpotCard && newSpotLocation && (
        <div className={styles.overlayAnchor}>
          <NewSpotCard
            onClose={() => {
              setShowNewSpotCard(false);
              setNewSpotLocation(null);
            }}
            location={newSpotLocation}
            onSave={handleSaveSpot}
            isPending={isCreatingSpot}
            error={createSpotError}
          />
        </div>
      )}

      {showEditSpotCard && spot && (
        <div className={styles.overlayAnchor}>
          <NewSpotCard
            onClose={() => setShowEditSpotCard(false)}
            location={spot.latLng}
            initialSpot={spot}
            onSave={handleEditSpot}
            isPending={isUpdatingSpot}
            error={updateSpotError}
          />
        </div>
      )}

      {showSpotDetailCard && !showEditSpotCard && !isNavigating && spot && (
        <div className={styles.overlayAnchor}>
          <SpotDetailCard
            spot={spot}
            onEdit={() => setShowEditSpotCard(true)}
            onDelete={() => setShowDeleteConfirm(true)}
            onDirections={handleDirections}
            isDirectionsPending={isDirectionsPending}
            directionsError={directionsError}
            directionsSummary={directionsData}
          />
        </div>
      )}

      {isNavigating && navProgress && (
        <NavigationHud
          instruction={navProgress.instruction}
          distanceToNextTurnMeters={navProgress.distanceToNextTurnMeters}
          remainingDistanceMeters={navProgress.remainingDistanceMeters}
          remainingDurationSeconds={navProgress.remainingDurationSeconds}
          onEnd={endNavigation}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete spot?"
        message={
          spot
            ? `Delete "${spot.name}"? This can't be undone.`
            : "This can't be undone."
        }
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isPending={isDeletingSpot}
        error={deleteSpotError}
      />
    </div>
  );
}
