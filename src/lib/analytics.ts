import { supabase } from "@/lib/supabase";
import { COOKIE_CONSENT_STORAGE_KEY } from "@/lib/constants";

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

export type BusinessFormEventType =
  | "business_form_view"
  | "business_form_start"
  | "business_form_submit"
  | "business_form_success"
  | "business_form_error"
  | "business_form_abandon"
  | "business_photo_upload"
  | "business_whatsapp_continue";

interface BusinessFormEventMeta {
  applicantType?: string;
  hasPhoto?: boolean;
  formDurationMs?: number;
  errorCategory?: string;
  abandonField?: string;
  utmSource?: string | null;
}

/**
 * /isletme-ekle başvuru formunun huni (funnel) olaylarını kaydeder.
 * Kişisel veri (telefon, isim, adres, not, dosya adı, tam Instagram) ASLA
 * gönderilmez — yalnızca `BusinessFormEventMeta` içindeki güvenli alanlar.
 *
 * Çerez onayı gerektirir: kullanıcı "Kabul Et" demeden bu olaylar sessizce
 * atlanır (başvurunun kendisinin veritabanına kaydı bu izne BAĞLI DEĞİLDİR —
 * o ayrı bir INSERT'tir ve her zaman çalışır).
 */
export async function trackFormEvent(eventType: BusinessFormEventType, meta?: BusinessFormEventMeta) {
  if (typeof window === "undefined") return;
  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (consent !== "accepted") return;

    const isMobile = /mobile|android|iphone|ipad/i.test(navigator.userAgent);
    await supabase.from("business_events").insert({
      business_id: null,
      event_type: eventType,
      referrer: document.referrer || null,
      device: isMobile ? "mobile" : "desktop",
      meta: meta
        ? {
            applicant_type: meta.applicantType,
            has_photo: meta.hasPhoto,
            form_duration_ms: meta.formDurationMs,
            error_category: meta.errorCategory,
            abandon_field: meta.abandonField,
            utm_source: meta.utmSource,
          }
        : null,
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
