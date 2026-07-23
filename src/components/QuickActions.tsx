"use client";

import { useState } from "react";
import { Phone, MessageCircle, Navigation, Share2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

function trackClick(businessId: string, eventType: "phone_click" | "whatsapp_click") {
  const isMobile = /mobile|android|iphone|ipad/i.test(navigator.userAgent);
  supabase.from("business_events").insert({
    business_id: businessId,
    event_type: eventType,
    referrer: document.referrer || null,
    device: isMobile ? "mobile" : "desktop",
  });
}
export default function QuickActions({
  phone,
  whatsapp,
  mapsUrl,
  businessName,
  businessId,
}: {
  phone: string | null;
  whatsapp: string | null;
  mapsUrl: string | null;
  businessName: string;
  businessId: string; 
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: businessName, url });
      } catch {
        // cancelled
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative z-10 -mt-6 flex gap-2 rounded-2xl border border-line bg-white p-2 shadow-[0_4px_20px_rgba(20,33,61,0.12)]">
      {phone && (
        <a
          href={`tel:${phone}`}
          onClick={() => trackClick(businessId, "phone_click")}
          className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-bordo py-2.5 text-white transition hover:bg-bordo-dark"
        >
          <Phone className="h-[18px] w-[18px]" />
          <span className="text-[11px] font-semibold">Ara</span>
        </a>
      )}
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
          onClick={() => trackClick(businessId, "whatsapp_click")} 
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-navy py-2.5 text-white transition hover:bg-navy-dark"
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          <span className="text-[11px] font-semibold">WhatsApp</span>
        </a>
      )}
      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-offwhite py-2.5 text-navy transition hover:bg-navy/10"
        >
          <Navigation className="h-[18px] w-[18px]" />
          <span className="text-[11px] font-semibold">Yol Tarifi</span>
        </a>
      )}
      <button
        onClick={handleShare}
        className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-offwhite py-2.5 text-navy transition hover:bg-navy/10"
      >
        {copied ? <Check className="h-[18px] w-[18px]" /> : <Share2 className="h-[18px] w-[18px]" />}
        <span className="text-[11px] font-semibold">{copied ? "Kopyalandı" : "Paylaş"}</span>
      </button>
    </div>
  );
}