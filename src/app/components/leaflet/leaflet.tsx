"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Spot } from "@/types/spot";
import NewSpotCard from "../card/NewSpotCard";
import { useMapEvents } from "react-leaflet/hooks";

interface LeafLetProps {
  spots: Spot[];
}

function MapEvents({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: onMapClick,
  });
  return null;
}

export default function LeafLet({ spots }: LeafLetProps) {
  const [showNewSpotCard, setShowNewSpotCard] = useState(false);

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <MapContainer
        center={[42.361145, -71.057083]}
        zoom={13}
        style={{ height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <MapEvents onMapClick={() => setShowNewSpotCard(true)} />

        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.lat_lng.lat, spot.lat_lng.lng]}
            icon={L.divIcon({ iconUrl: "/assets/pin-default.png" })}
          >
            <Popup>{spot.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Card positioned absolutely on top */}
      {showNewSpotCard && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 1000,
          }}
        >
          <NewSpotCard onClose={() => setShowNewSpotCard(false)} />
        </div>
      )}
    </div>
  );
}
