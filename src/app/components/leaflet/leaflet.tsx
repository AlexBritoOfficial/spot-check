"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Spot } from "@/types/spot";
import NewSpotCard from "../card/NewSpotCard";
import { useMap, useMapEvents } from "react-leaflet/hooks";
import SpotDetailCard from "../card/SpotDetailCard";
import ConfirmDialog from "../confirm-dialog/ConfirmDialog";
import FilterBar from "../filter-bar/FilterBar";
import { useSpots } from "@/app/lib/useSpots";
import { useCreateSpot } from "@/app/lib/useCreateSpot";
import { useUpdateSpot } from "@/app/lib/useUpdateSpot";
import { useDeleteSpot } from "@/app/lib/useDeleteSpot";
import { useGeolocation } from "@/app/lib/useGeolocation";

const DEFAULT_CITY = { lat: 42.361145, lng: -71.057083 };

function MapEvents({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng),
  });
  return null;
}

function RecenterMap({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [map, center.lat, center.lng]);
  return null;
}

function FlyToLocation({ location }: { location: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([location.lat, location.lng], 13);
  }, [map, location.lat, location.lng]);
  return null;
}

interface LeafLetProps {
  searchedLocation?: { lat: number; lng: number } | null;
}

export default function LeafLet({ searchedLocation }: LeafLetProps) {
  const { coords, status: geoStatus } = useGeolocation();
  const effectiveLocation = searchedLocation ?? coords ?? DEFAULT_CITY;
  const { data: spots, isLoading, isError, error } = useSpots(effectiveLocation);
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

  const [spotsFiltered, setSpotsFiltered] = useState<Spot[]>([]);
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

  if (isLoading) {
    return <div>Loading spots...</div>;
  }

  if (isError) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="relative flex flex-1 min-h-0 flex-col">
      {/* Filter Bar */}
      <FilterBar spots={spots ?? []} setSpotsFiltered={setSpotsFiltered} />
      {/* Leaflet Map */}
      <MapContainer
        center={[DEFAULT_CITY.lat, DEFAULT_CITY.lng]}
        zoom={13}
        style={{ flex: 1, minHeight: 0 }}
        touchZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <MapEvents
          onMapClick={(latlng) => {
            if (isOverlayOpen) {
              closeOverlays();
            } else {
              setNewSpotLocation({ lat: latlng.lat, lng: latlng.lng });
              setShowNewSpotCard(true);
            }
          }}
        />

        {!searchedLocation && geoStatus === "granted" && coords && (
          <>
            <RecenterMap center={coords} />
            <Marker
              position={[coords.lat, coords.lng]}
              icon={L.icon({
                iconUrl: "/assets/marker-you-are-here.png",
                iconSize: [40, 40],
                iconAnchor: [20, 20],
              })}
            >
              <Popup>You are here</Popup>
            </Marker>
          </>
        )}

        {searchedLocation && <FlyToLocation location={searchedLocation} />}

        {spotsFiltered.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.latLng.lat, spot.latLng.lng]}
            icon={L.icon({
              iconUrl: "/assets/pin-default.png",
              iconSize: [32, 42],
              iconAnchor: [16, 42],
              popupAnchor: [0, -42],
            })}
            eventHandlers={{
              click: () => {
                setSpot(spot);
                setShowSpotDetailCard(true);
              },
            }}
          >
            <Popup>{spot.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Card positioned absolutely on top */}
      {showNewSpotCard && newSpotLocation && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 1000,
          }}
        >
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
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 1000,
          }}
        >
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
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 1000,
          }}
        >
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
