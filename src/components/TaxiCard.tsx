"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  MessageCircle,
  Navigation,
  MapPin,
  Clock,
  ShieldAlert,
  ChevronRight,
  Flag,
  Car,
  Star,
} from "lucide-react";
import {
  trackBusinessEvent,
  formatTelHref,
  formatWhatsappUrl,
  buildDirectionsUrl,
  isPhoneLike,
} from "@/lib/analytics";
import { formatDistance, TAXI_PHONE_STALE_DAYS } from "@/lib/taxi";
import TaxiReportModal from "@/components/TaxiReportModal";

export interface TaxiListing {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  cover_image_url: string | null;
  is_featured: boolean;
  taxi_service_24_7: boolean;
  taxi_temporarily_unavailable: boolean;
  taxi_phone_verified_at: string | null;
  serviceAreas: string[];
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

function formatVerifiedLabel(iso: string | null): string {
  if (!iso) return "Telefon numarası henüz doğrulanmadı";
  const days = daysSince(iso);
  if (days <= 0) return "Bugün doğrulandı";
  if (days === 1) return "Dün doğrulandı";
  if (days < 30) return `${days} gün önce doğrulandı`;
  const months = Math.round(days / 30);
  return `${months} ay önce doğrulandı`;
}

export default function TaxiCard({
  taxi,
  distanceKm,
}: {
  taxi: TaxiListing;
  distanceKm?: number | null;
}) {
  const [reportOpen, setReportOpen] = useState(false);
  const hasValidWhatsapp = isPhoneLike(taxi.whatsapp);
  const directionsUrl = buildDirectionsUrl(taxi.lat, taxi.lng) ??
    (taxi.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(taxi.address)}` : null);
  const unavailable = taxi.taxi_temporarily_unavailable;
  const verifiedLabel = formatVerifiedLabel(taxi.taxi_phone_verified_at);
  const phoneStale =
    !taxi.taxi_phone_verified_at || daysSince(taxi.taxi_phone_verified_at) > TAXI_PHONE_STALE_DAYS;

  const btnBase =
    "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <article className="card-shadow card-shadow-hover flex flex-col overflow-hidden rounded-2xl bg-white transition">
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-offwhite">
          {taxi.cover_image_url ? (
            <Image src={taxi.cover_image_url} alt="" fill unoptimized sizes="56px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Car className="h-6 w-6 text-navy/20" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="font-display text-base font-bold text-navy">{taxi.name}</h3>
            {taxi.is_featured && (
              <span className="flex items-center gap-0.5 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-gold-dark">
                <Star className="h-2.5 w-2.5 fill-gold-dark" /> Öne Çıkan
              </span>
            )}
          </div>
          {taxi.neighborhood && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink/50">
              <MapPin className="h-3 w-3 shrink-0" /> {taxi.neighborhood}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {typeof distanceKm === "number" && (
              <span className="rounded-full bg-navy/5 px-2 py-0.5 text-[11px] font-bold text-navy">
                ~{formatDistance(distanceKm)}
              </span>
            )}
            {taxi.taxi_service_24_7 && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">
                7/24
              </span>
            )}
            {unavailable && (
              <span className="flex items-center gap-1 rounded-full bg-ink/10 px-2 py-0.5 text-[11px] font-bold text-ink/50">
                <ShieldAlert className="h-3 w-3" /> Geçici olarak hizmet dışı
              </span>
            )}
          </div>
        </div>
      </div>

      {taxi.serviceAreas.length > 0 && (
        <p className="px-4 pb-2 text-[11px] text-ink/40">
          Hizmet alanı: {taxi.serviceAreas.join(", ")}
        </p>
      )}

      <div className="flex gap-2 px-4 pb-3">
        {taxi.phone ? (
          <a
            href={unavailable ? undefined : formatTelHref(taxi.phone)}
            aria-disabled={unavailable}
            onClick={(e) => {
              if (unavailable) {
                e.preventDefault();
                return;
              }
              trackBusinessEvent(taxi.id, "phone_click", "taxi_page");
            }}
            className={`${btnBase} ${
              unavailable
                ? "pointer-events-none bg-ink/10 text-ink/40"
                : "bg-bordo text-white hover:bg-bordo-dark"
            }`}
          >
            <Phone className="h-4 w-4" /> Hemen Ara
          </a>
        ) : (
          <div className={`${btnBase} bg-ink/10 text-ink/40`}>Telefon bilgisi yok</div>
        )}

        {hasValidWhatsapp && (
          <a
            href={unavailable ? undefined : formatWhatsappUrl(taxi.whatsapp!)}
            target={unavailable ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-disabled={unavailable}
            aria-label="WhatsApp'tan yaz"
            onClick={(e) => {
              if (unavailable) {
                e.preventDefault();
                return;
              }
              trackBusinessEvent(taxi.id, "whatsapp_click", "taxi_page");
            }}
            className={`${btnBase} flex-none px-3 ${
              unavailable
                ? "pointer-events-none bg-ink/10 text-ink/40"
                : "bg-navy text-white hover:bg-navy-dark"
            }`}
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        )}

        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Yol tarifi al"
            onClick={() => trackBusinessEvent(taxi.id, "directions_click", "taxi_page")}
            className={`${btnBase} flex-none bg-offwhite px-3 text-navy hover:bg-navy/10`}
          >
            <Navigation className="h-4 w-4" />
          </a>
        )}
      </div>

      <div className="border-t border-line px-4 py-2.5">
        <p
          className={`flex items-center gap-1 text-[11px] ${
            phoneStale ? "text-gold-dark" : "text-ink/40"
          }`}
        >
          <Clock className="h-3 w-3 shrink-0" />
          {verifiedLabel}
        </p>
        <div className="mt-1.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-ink/40 hover:text-bordo"
          >
            <Flag className="h-3 w-3" /> Bilgi hatalı mı?
          </button>
          <Link
            href={`/isletme/${taxi.slug}`}
            onClick={() => trackBusinessEvent(taxi.id, "profile_click", "taxi_page")}
            className="flex items-center gap-0.5 text-xs font-bold text-bordo hover:underline"
          >
            Profili İncele <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {reportOpen &&
        createPortal(
          <TaxiReportModal
            businessId={taxi.id}
            businessName={taxi.name}
            onClose={() => setReportOpen(false)}
          />,
          document.body
        )}
    </article>
  );
}
