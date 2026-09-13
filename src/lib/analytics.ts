import { supabase } from "@/lib/supabase";

export type BusinessEventType =
  | "profile_view"
  | "phone_click"
  | "whatsapp_click"
  | "directions_click"
  | "website_click";

/**
 * İşletme etkileşim olayını `business_events` tablosuna kaydeder. Kart
 * hızlı işlemleri (arama sonuçları, anasayfa) ve profil sayfasındaki
 * QuickActions aynı mekanizmayı kullanır ki aynı tıklama iki farklı yerden
 * iki kere sayılmasın.
 */
export async function trackBusinessEvent(businessId: string, eventType: BusinessEventType) {
  try {
    const isMobile = /mobile|android|iphone|ipad/i.test(navigator.userAgent);
    await supabase.from("business_events").insert({
      business_id: businessId,
      event_type: eventType,
      referrer: document.referrer || null,
      device: isMobile ? "mobile" : "desktop",
    });
  } catch {
    // Olay kaydı sessizce başarısız olsun, kullanıcı deneyimini etkilemesin.
  }
}

export function formatTelHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

export function formatWhatsappUrl(whatsapp: string, message?: string): string {
  const digits = whatsapp.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function buildDirectionsUrl(lat: number | null, lng: number | null): string | null {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
