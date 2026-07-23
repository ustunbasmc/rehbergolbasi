"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ViewCounter({ businessId }: { businessId: string }) {
  useEffect(() => {
    // Eski view_count artırma (mevcut sistem)
    supabase.rpc("increment_view_count", { business_id: businessId }).then(({ error }) => {
      if (error) console.error("View count could not be updated:", error);
    });

    // Yeni event sistemi
    const isMobile = /mobile|android|iphone|ipad/i.test(navigator.userAgent);
    supabase.from("business_events").insert({
      business_id: businessId,
      event_type: "profile_view",
      referrer: document.referrer || null,
      device: isMobile ? "mobile" : "desktop",
    });
  }, [businessId]);

  return null;
}