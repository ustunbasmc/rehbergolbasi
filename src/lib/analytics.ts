import { supabase } from "@/lib/supabase";
import { COOKIE_CONSENT_STORAGE_KEY } from "@/lib/constants";

export type BusinessEventType =
  | "profile_view"
  | "profile_click"
  | "phone_click"
  | "whatsapp_click"
  | "directions_click"
  | "website_click";

/**
 * İşletme etkileşim olayını `business_events` tablosuna kaydeder. Kart
 * hızlı işlemleri (arama sonuçları, anasayfa) ve profil sayfasındaki
 * QuickActions aynı mekanizmayı kullanır ki aynı tıklama iki farklı yerden
 * iki kere sayılmasın. `source` verilirse (ör. "taxi_page") `meta.source`
 * olarak kaydedilir — aynı event_type farklı bir kaynaktan geldiğinde bile
 * işletmenin genel istatistiğine (ör. toplam phone_click) doğru şekilde
 * tek sefer sayılır, yalnızca kaynağı ayrıca etiketlenir.
 */
export async function trackBusinessEvent(
  businessId: string,
  eventType: BusinessEventType,
  source?: string
) {
  try {
    const isMobile = /mobile|android|iphone|ipad/i.test(navigator.userAgent);
    await supabase.from("business_events").insert({
      business_id: businessId,
      event_type: eventType,
      referrer: document.referrer || null,
      device: isMobile ? "mobile" : "desktop",
      meta: source ? { source } : null,
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

export type TaxiPageEventType =
  | "taxi_page_view"
  | "taxi_location_requested"
  | "taxi_location_granted"
  | "taxi_location_denied"
  | "taxi_location_error"
  | "taxi_search"
  | "taxi_neighborhood_selected"
  | "taxi_map_open"
  | "taxi_incorrect_info_report";

interface TaxiPageEventMeta {
  neighborhood?: string;
  resultCount?: number;
  errorCategory?: string;
}

/**
 * /taksi sayfasının huni event'leri. Kesin konum, telefon numarası veya
 * başka kişisel veri ASLA gönderilmez — yalnızca sayaç/durum bilgisi.
 * Çerez onayı gerektirir (madde 16); telefon/WhatsApp/yol tarifi
 * butonlarının çalışması bu izne bağlı DEĞİLDİR (onlar trackBusinessEvent
 * ile ayrı kaydedilir ve business_events zaten anon INSERT'e açık).
 */
export async function trackTaxiEvent(eventType: TaxiPageEventType, meta?: TaxiPageEventMeta) {
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
      meta: meta ? { source: "taxi_page", ...meta } : { source: "taxi_page" },
    });
  } catch {
    // Olay kaydı sessizce başarısız olsun, kullanıcı deneyimini etkilemesin.
  }
}

export type GundemEventType =
  | "news_list_view"
  | "news_article_view"
  | "news_category_click"
  | "news_search"
  | "news_share_click"
  | "news_source_click"
  | "news_related_article_click"
  | "news_related_business_click"
  | "news_correction_report"
  | "news_load_more"
  | "breaking_news_click";

interface GundemEventMeta {
  category?: string;
  postSlug?: string;
  shareChannel?: string;
  resultCount?: number;
  page?: number;
}

/**
 * "Gölbaşı Gündem" (/gundem) huni event'leri. Kişisel veri ASLA gönderilmez.
 * Mevcut `business_events` tablosu yeniden kullanılır (business_id: null,
 * meta.source: "gundem") — taksi/form event'leriyle aynı desen, ikinci bir
 * analytics tablosu kurulmadı. Çerez onayı gerektirir; sayfa görüntüleme,
 * arama, paylaşım ve kaynak bağlantıları bu izinden BAĞIMSIZ çalışmaya
 * devam eder (yalnızca ölçüm event'i atlanır, işlevsellik etkilenmez).
 */
export async function trackGundemEvent(eventType: GundemEventType, meta?: GundemEventMeta) {
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
      meta: meta ? { source: "gundem", ...meta } : { source: "gundem" },
    });
  } catch {
    // Olay kaydı sessizce başarısız olsun, kullanıcı deneyimini etkilemesin.
  }
}

export type HomeEventType = "home_search_submit" | "home_example_chip_click" | "home_quick_action_click";

interface HomeEventMeta {
  action?: string;
  query?: string;
}

/**
 * Ana sayfa (hero) huni event'leri: arama gönderimi, örnek arama chip'leri ve
 * hızlı-eylem karoları (Taksi/Eczane/Otobüs/Gündem). Aynı `business_events`
 * tablosu ve deseni (business_id: null, meta.source) yeniden kullanılır —
 * hedef sayfaların (ör. /taksi) kendi sayfa-görüntüleme event'leriyle
 * ÇAKIŞMAZ: onlar "kaç kişi o sayfayı gördü", bu ise "kaç kişi ana sayfadan
 * o karoya bastı" sorusuna cevap verir — farklı, tekrarsız bilgi.
 */
export async function trackHomeEvent(eventType: HomeEventType, meta?: HomeEventMeta) {
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
      meta: meta ? { source: "home", ...meta } : { source: "home" },
    });
  } catch {
    // Olay kaydı sessizce başarısız olsun, kullanıcı deneyimini etkilemesin.
  }
}

export type PageViewEventType = "business_list_view" | "eczane_page_view" | "otobus_page_view";

interface PageViewEventMeta {
  query?: string;
  resultCount?: number;
}

/**
 * /isletmeler, /nobetci-eczane ve /otobus-saatleri için basit sayfa-görüntüleme
 * event'i. Bu üç sayfanın (taksi ve gündem'in aksine) daha önce hiç
 * görüntüleme kaydı yoktu. Aynı `business_events` deseni yeniden kullanılır.
 */
export async function trackPageView(eventType: PageViewEventType, meta?: PageViewEventMeta) {
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
      meta: meta ?? null,
    });
  } catch {
    // Olay kaydı sessizce başarısız olsun, kullanıcı deneyimini etkilemesin.
  }
}

/**
 * Bir metnin gerçek bir telefon numarasına benzeyip benzemediğini doğrular
 * (ör. `whatsapp` alanına yanlışlıkla mahalle adı girilmiş kayıtları
 * ayıklamak için — en az 10 rakam içermeli). WhatsApp/telefon butonlarını
 * yalnızca GERÇEKTEN geçerli görünen bir numara varsa göstermek için
 * kullanılır.
 */
export function isPhoneLike(value: string | null | undefined): value is string {
  if (!value) return false;
  return value.replace(/\D/g, "").length >= 10;
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
