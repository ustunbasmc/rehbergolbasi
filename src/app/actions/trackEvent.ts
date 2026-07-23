"use server";

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function trackEvent(
  businessId: string,
  eventType: "profile_view" | "phone_click" | "whatsapp_click" | "website_click"
) {
  try {
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") ?? "";
    const referrer = headersList.get("referer") ?? null;

    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    const device = isMobile ? "mobile" : "desktop";

    await supabase.from("business_events").insert({
      business_id: businessId,
      event_type: eventType,
      referrer,
      device,
    });
  } catch {
    // Olay kaydı sessizce başarısız olsun, kullanıcı deneyimini etkilemesin
  }
}