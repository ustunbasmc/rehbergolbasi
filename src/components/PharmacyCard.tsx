"use client";

import { Phone, MapPin } from "lucide-react";

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  phone2: string | null;
  location: { latitude: number; longitude: number } | null;
}

export default function PharmacyCard({ pharmacy }: { pharmacy: Pharmacy }) {
  const mapsUrl = pharmacy.location
    ? `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.latitude},${pharmacy.location.longitude}`
    : null;

  return (
    <div className="card-shadow rounded-2xl border border-line bg-white p-5">
      <h2 className="mb-3 font-display text-lg font-bold text-navy">
        {pharmacy.name}
      </h2>

      <div className="flex flex-col gap-2">
        {pharmacy.address && (
          <div className="flex items-start gap-2 text-sm text-ink/70">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bordo" />
            <span>{pharmacy.address}</span>
          </div>
        )}
        {pharmacy.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 shrink-0 text-bordo" />
            <button
              onClick={() => { window.location.href = "tel:" + pharmacy.phone; }}
              className="font-semibold text-navy hover:text-bordo"
            >
              {pharmacy.phone}
            </button>
          </div>
        )}
        {pharmacy.phone2 && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 shrink-0 text-bordo" />
            <button
              onClick={() => { window.location.href = "tel:" + pharmacy.phone2; }}
              className="font-semibold text-navy hover:text-bordo"
            >
              {pharmacy.phone2}
            </button>
          </div>
        )}
      </div>

      {mapsUrl && (
        <button
          onClick={() => window.open(mapsUrl, "_blank")}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white hover:bg-navy-dark"
        >
          <MapPin className="h-4 w-4" />
          Yol Tarifi Al
        </button>
      )}
    </div>
  );
}