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

interface LeafLetProps {
  spots: Spot[];
}

function MapEvents({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng),
  });
  return null;
}

export default function LeafLet({ spots }: LeafLetProps) {
  const [allSpots, setAllSpots] = useState<Spot[]>(spots);
  const [spotsFiltered, setSpotsFiltered] = useState<Spot[]>(spots);
  const [showNewSpotCard, setShowNewSpotCard] = useState(false);
  const [showSpotDetailCard, setShowSpotDetailCard] = useState(false);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [newSpotLocation, setNewSpotLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  function handleSaveSpot(newSpot: Omit<Spot, "id">) {
    setAllSpots((prevSpots) => {
      const nextId =
        prevSpots.length === 0
          ? 1
          : Math.max(...prevSpots.map((s) => s.id)) + 1;
      return [...prevSpots, { ...newSpot, id: nextId }];
    });
    setShowNewSpotCard(false);
    setNewSpotLocation(null);
  }

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <FilterBar spots={allSpots} setSpotsFiltered={setSpotsFiltered} />
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
            position={[spot.lat_lng.lat, spot.lat_lng.lng]}
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
