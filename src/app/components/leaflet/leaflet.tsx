"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Spot } from "@/types/spot";
import NewSpotCard from "../card/NewSpotCard";
import { useMapEvents } from "react-leaflet/hooks";
import SpotDetailCard from "../card/SpotDetailCard";
import FilterBar from "../filter-bar/FilterBar";
import { useSpots } from "@/app/lib/useSpots";
import { useCreateSpot } from "@/app/lib/useCreateSpot";

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

  const [spotsFiltered, setSpotsFiltered] = useState<Spot[]>([]);
  const [showNewSpotCard, setShowNewSpotCard] = useState(false);
  const [showSpotDetailCard, setShowSpotDetailCard] = useState(false);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [newSpotLocation, setNewSpotLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  function handleSaveSpot(newSpot: Omit<Spot, "id">) {
    createSpot(newSpot, {
      onSuccess: () => {
        setShowNewSpotCard(false);
        setNewSpotLocation(null);
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
            if (showSpotDetailCard) {
              setShowSpotDetailCard(false);
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

      {showSpotDetailCard && spot && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 1000,
          }}
        >
          <SpotDetailCard spot={spot} />
        </div>
      )}
    </div>
  );
}
