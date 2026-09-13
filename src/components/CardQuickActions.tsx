"use client";

import { Phone, MessageCircle, Navigation } from "lucide-react";
import {
  trackBusinessEvent,
  formatTelHref,
  formatWhatsappUrl,
  buildDirectionsUrl,
} from "@/lib/analytics";

/**
 * Arama sonuçları ve liste kartlarındaki hızlı işlem butonları. BusinessCard
 * içinde, kart bağlantısının (Link) DIŞINDA, kardeş bir öğe olarak render
 * edilir — böylece iç içe interactive element oluşmaz ve butona basınca
 * kart profil sayfasına yönlendirmez.
 */
export default function CardQuickActions({
  businessId,
  phone,
  whatsapp,
  lat,
  lng,
}: {
  businessId: string;
  phone: string | null;
  whatsapp: string | null;
  lat: number | null;
  lng: number | null;
}) {
  const directionsUrl = buildDirectionsUrl(lat, lng);

  if (!phone && !whatsapp && !directionsUrl) return null;

  const btnClass =
    "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition";

  return (
    <div className="flex gap-1.5 border-t border-line px-3 py-2">
      {phone && (
        <a
          href={formatTelHref(phone)}
          aria-label={`Ara: ${phone}`}
          onClick={() => trackBusinessEvent(businessId, "phone_click")}
          className={`${btnClass} bg-bordo/10 text-bordo hover:bg-bordo hover:text-white`}
        >
          <Phone className="h-3.5 w-3.5" /> Ara
        </a>
      )}
      {whatsapp && (
        <a
          href={formatWhatsappUrl(whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp'tan yaz"
          onClick={() => trackBusinessEvent(businessId, "whatsapp_click")}
          className={`${btnClass} bg-navy/5 text-navy hover:bg-navy hover:text-white`}
        >
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </a>
      )}
      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Yol tarifi al"
          onClick={() => trackBusinessEvent(businessId, "directions_click")}
          className={`${btnClass} bg-offwhite text-navy hover:bg-navy/10`}
        >
          <Navigation className="h-3.5 w-3.5" /> Yol Tarifi
        </a>
      )}
    </div>
  );
}
