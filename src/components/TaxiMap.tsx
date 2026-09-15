"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Phone } from "lucide-react";
import { formatTelHref, trackBusinessEvent } from "@/lib/analytics";
import type { TaxiListing } from "@/components/TaxiCard";

// Leaflet'in varsayılan marker ikonları bundler'larla CDN'e işaret
// etmeden kırılıyor (mevcut LocationPicker.tsx'teki gibi).
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userIcon = L.divIcon({
  className: "",
  html: '<div style="width:16px;height:16px;border-radius:9999px;background:#7A1F2E;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const GOLBASI_CENTER: [number, number] = [39.7903, 32.8087];

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [30, 30], maxZoom: 15 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function TaxiMap({
  taxis,
  userLocation,
}: {
  taxis: TaxiListing[];
  userLocation: { lat: number; lng: number } | null;
}) {
  const withCoords = taxis.filter(
    (t): t is TaxiListing & { lat: number; lng: number } => t.lat != null && t.lng != null
  );

  const points: [number, number][] = [
    ...withCoords.map((t): [number, number] => [t.lat, t.lng]),
    ...(userLocation ? [[userLocation.lat, userLocation.lng] as [number, number]] : []),
  ];

  return (
    <div className="card-shadow overflow-hidden rounded-2xl">
      <MapContainer
        center={points[0] ?? GOLBASI_CENTER}
        zoom={13}
        style={{ height: "420px", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap katkıda bulunanlar'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.length > 0 && <FitBounds points={points} />}

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>Konumunuz</Popup>
          </Marker>
        )}

        {withCoords.map((taxi) => (
          <Marker key={taxi.id} position={[taxi.lat, taxi.lng]}>
            <Popup>
              <div className="flex flex-col gap-1.5">
                <p className="font-semibold text-navy">{taxi.name}</p>
                {taxi.phone && !taxi.taxi_temporarily_unavailable && (
                  <a
                    href={formatTelHref(taxi.phone)}
                    onClick={() => trackBusinessEvent(taxi.id, "phone_click", "taxi_page")}
                    className="flex items-center gap-1 text-sm font-bold text-bordo"
                  >
                    <Phone className="h-3.5 w-3.5" /> Hemen Ara
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
