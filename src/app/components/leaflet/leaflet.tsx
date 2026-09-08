"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Spot } from "@/types/spot";

interface LeafLetProps {
  spots: Spot[];
}

export default function LeafLet({ spots }: LeafLetProps) {
  return (
    /**
     *  MapContainer is react-leaflet's root component —
     *
     *  Initializes the actual Leaflet map instance and mounts it into a div.
     *  center: [lat, lng] tuple
     *  zoom: zoom level
     *  style: sets the container's height (required)
     *
     *
     * TileLayer: paints the map imagery —
     * Fetches and tiles the OpenStreetMap raster images for the visible area.
     * {s}, {z}, {x}, {y} are template placeholders.
     * Leaflet substitutes at runtime (subdomain, zoom, tile x/y coordinates).
     *
     * attribution: is required by OpenStreetMap's usage policy —
     * it's the "© OpenStreetMap contributors" credit line rendered in the map's corner.
     *
     **/
    <MapContainer
      center={[42.361145, -71.057083]}
      zoom={13}
      style={{ height: "100vh" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {spots.map((spot) => (
        <Marker
          position={[spot.lat_lng.lat, spot.lat_lng.lng]}
          icon={L.divIcon({ iconUrl: "/assets/pin-default.png" })}
        >
          <Popup>{spot.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
