"use client";

import { Phone, MapPin } from "lucide-react";
import Link from "next/link";

interface Eczane {
  id: string;
  name: string;
  address: string;
  phone: string;
  location: { latitude: number; longitude: number } | null;
}

export default function NobetciEczaneWidget({ eczaneler }: { eczaneler: Eczane[] }) {
  if (eczaneler.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-3xl bg-bordo px-6 py-10 sm:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-300" />
            <span className="text-xs font-bold uppercase tracking-wide text-red-200">
              Bugün Nöbetçi
            </span>
          </div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-white">
            💊 Nöbetçi Eczane
          </h2>
          <p className="text-sm text-white/60">
            Gölbaşı'nda bugün nöbetçi olan eczaneler.
          </p>
        </div>
        <Link
          href="/nobetci-eczane"
          className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/25"
        >
          Tümünü Gör →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {eczaneler.map((eczane) => (
          <div
            key={eczane.id}
            className="flex items-center gap-3 rounded-2xl bg-white p-3"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-bordo/10 text-2xl">
              💊
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-navy">{eczane.name}</p>
              {eczane.address && (
                <p className="truncate text-xs text-ink/50">{eczane.address}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-1.5">
              {eczane.phone && (
                <button
                  onClick={() => { window.location.href = "tel:" + eczane.phone; }}
                  aria-label={`${eczane.name} eczanesini ara`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-bordo text-white transition-colors hover:bg-bordo-dark"
                >
                  <Phone className="h-4 w-4" />
                </button>
              )}
              {eczane.location && (
                <button
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${eczane.location!.latitude},${eczane.location!.longitude}`, "_blank")}
                  aria-label={`${eczane.name} eczanesine yol tarifi`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/10 text-navy transition-colors hover:bg-navy hover:text-white"
                >
                  <MapPin className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}