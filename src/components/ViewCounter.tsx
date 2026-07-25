"use client";
import { useEffect } from "react";

export default function ViewCounter({ businessId }: { businessId: string }) {
  useEffect(() => {
    const isMobile = /mobile|android|iphone|ipad/i.test(navigator.userAgent);
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_id: businessId,
        event_type: "profile_view",
        referrer: document.referrer || null,
        device: isMobile ? "mobile" : "desktop",
      }),
    });
  }, [businessId]);

  return null;
}