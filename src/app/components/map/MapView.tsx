"use client";

import { useEffect, useRef, useState } from "react";
import {
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
import ConfirmDialog from "../confirm-dialog/ConfirmDialog";
import FilterBar from "../filter-bar/FilterBar";
import { useSpots } from "@/app/lib/useSpots";
import { useCreateSpot } from "@/app/lib/useCreateSpot";
import { useUpdateSpot } from "@/app/lib/useUpdateSpot";
import { useDeleteSpot } from "@/app/lib/useDeleteSpot";
import { useGeolocation } from "@/app/lib/useGeolocation";
import styles from "./MapView.module.css";

const DEFAULT_CITY = { lat: 42.361145, lng: -71.057083 };

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

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const spotMarkersRef = useRef<Marker[]>([]);
  const youAreHereMarkerRef = useRef<Marker | null>(null);
  const ghostMarkerRef = useRef<Marker | null>(null);

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

  const isOverlayOpen =
    showSpotDetailCard || showEditSpotCard || showDeleteConfirm;

  function closeOverlays() {
    setShowSpotDetailCard(false);
    setShowEditSpotCard(false);
    setShowDeleteConfirm(false);
  }

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
     
  }, [mapReady, isOverlayOpen]);

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

    if (!searchedLocation && geoStatus === "granted" && coords) {
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
     
  }, [mapReady, searchedLocation, geoStatus, coords, recenterNonce]);

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

  return (
    <div className="relative flex flex-1 min-h-0 flex-col">
      {/* Filter Bar */}
      <FilterBar spots={spots ?? []} setSpotsFiltered={setSpotsFiltered} />

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
      {!showNewSpotCard && !showEditSpotCard && !showSpotDetailCard && (
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

      {showSpotDetailCard && !showEditSpotCard && spot && (
        <div className={styles.overlayAnchor}>
          <SpotDetailCard
            spot={spot}
            onEdit={() => setShowEditSpotCard(true)}
            onDelete={() => setShowDeleteConfirm(true)}
          />
        </div>
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
