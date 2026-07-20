"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet's default marker icons break with bundlers unless we point them at a CDN.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Gölbaşı, Ankara merkez koordinatları — pin henüz konmadıysa harita burada açılır.
const GOLBASI_CENTER: [number, number] = [39.7903, 32.8087];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const center: [number, number] = lat && lng ? [lat, lng] : GOLBASI_CENTER;

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <MapContainer center={center} zoom={lat && lng ? 15 : 13} style={{ height: "240px", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap katkıda bulunanlar'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} />
        {lat && lng && <Marker position={[lat, lng]} />}
      </MapContainer>
    </div>
  );
}