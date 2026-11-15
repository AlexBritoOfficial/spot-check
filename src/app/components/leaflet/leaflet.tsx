"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Spot } from "@/types/spot";
import NewSpotCard from "../card/NewSpotCard";
import { useMapEvents } from "react-leaflet/hooks";
import SpotDetailCard from "../card/SpotDetailCard";
import ConfirmDialog from "../confirm-dialog/ConfirmDialog";
import FilterBar from "../filter-bar/FilterBar";
import { useSpots } from "@/app/lib/useSpots";
import { useCreateSpot } from "@/app/lib/useCreateSpot";
import { useUpdateSpot } from "@/app/lib/useUpdateSpot";
import { useDeleteSpot } from "@/app/lib/useDeleteSpot";

function MapEvents({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng),
  });
  return null;
}

export default function LeafLet() {
  const { data: spots, isLoading, isError, error } = useSpots();
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
    <div style={{ position: "relative", height: "100vh" }}>
      {/* Filter Bar */}
      <FilterBar spots={spots ?? []} setSpotsFiltered={setSpotsFiltered} />
      {/* Leaflet Map */}
      <MapContainer
        center={[42.361145, -71.057083]}
        zoom={13}
        style={{ height: "100%" }}
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
