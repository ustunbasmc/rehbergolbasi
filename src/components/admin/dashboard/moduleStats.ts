export const MODULES = [
  { key: "business", label: "İşletmeler", color: "#14213D" },
  { key: "home", label: "Ana Sayfa", color: "#7A1F2E" },
  { key: "taxi", label: "Taksi", color: "#C9A24B" },
  { key: "gundem", label: "Gündem", color: "#25864a" },
  { key: "eczane", label: "Eczane", color: "#0ea5e9" },
  { key: "otobus", label: "Otobüs", color: "#8b5cf6" },
] as const;

export type ModuleKey = (typeof MODULES)[number]["key"];

/**
 * Her event_type'ı hangi site modülüne ait olduğuna eşler. Liste
 * `src/lib/analytics.ts`'teki tüm event tipi union'larıyla birebir
 * eşleşir — yeni bir event tipi eklenirse burada da eklenmeli.
 */
const EVENT_MODULE_MAP: Record<string, ModuleKey> = {
  // İşletmeler (profil + liste + başvuru formu)
  business_list_view: "business",
  profile_view: "business",
  profile_click: "business",
  phone_click: "business",
  whatsapp_click: "business",
  directions_click: "business",
  website_click: "business",
  business_form_view: "business",
  business_form_start: "business",
  business_form_submit: "business",
  business_form_success: "business",
  business_form_error: "business",
  business_form_abandon: "business",
  business_photo_upload: "business",
  business_whatsapp_continue: "business",
  // Ana Sayfa
  home_search_submit: "home",
  home_example_chip_click: "home",
  home_quick_action_click: "home",
  // Taksi
  taxi_page_view: "taxi",
  taxi_location_requested: "taxi",
  taxi_location_granted: "taxi",
  taxi_location_denied: "taxi",
  taxi_location_error: "taxi",
  taxi_search: "taxi",
  taxi_neighborhood_selected: "taxi",
  taxi_map_open: "taxi",
  taxi_incorrect_info_report: "taxi",
  // Gündem
  news_list_view: "gundem",
  news_article_view: "gundem",
  news_category_click: "gundem",
  news_search: "gundem",
  news_share_click: "gundem",
  news_source_click: "gundem",
  news_related_article_click: "gundem",
  news_related_business_click: "gundem",
  news_correction_report: "gundem",
  news_load_more: "gundem",
  breaking_news_click: "gundem",
  // Eczane / Otobüs
  eczane_page_view: "eczane",
  otobus_page_view: "otobus",
};

/**
 * `phone_click`/`whatsapp_click`/`directions_click`/`profile_click` gibi
 * event_type'lar birden çok sayfada (işletme profili, taksi kartı, gündem
 * kenar çubuğu) aynı isimle tekrar kullanılır — hangi modüle ait olduklarını
 * event_type tek başına söylemez. `trackBusinessEvent`'e verilen `source`
 * (ör. "taxi_page") bu event'lerde `meta.source` olarak saklanır; burada
 * o kaynağa bakılarak doğru modüle yönlendirilir. Aksi halde ör. taksi
 * sayfasındaki "Hemen Ara" tıklamaları modül kartlarında hiç görünmez,
 * hepsi genel "İşletmeler" toplamına karışırdı.
 */
const SOURCE_MODULE_MAP: Record<string, ModuleKey> = {
  taxi_page: "taxi",
};

export function moduleForEvent(eventType: string, meta?: Record<string, unknown> | null): ModuleKey | null {
  const source = meta?.source;
  if (typeof source === "string" && SOURCE_MODULE_MAP[source]) {
    return SOURCE_MODULE_MAP[source];
  }
  return EVENT_MODULE_MAP[eventType] ?? null;
}

/** Her modül kartında gösterilecek alt-kırılım satırları. */
export const MODULE_BREAKDOWN_EVENTS: Record<ModuleKey, { type: string; label: string }[]> = {
  business: [
    { type: "business_list_view", label: "Liste görüntüleme" },
    { type: "phone_click", label: "Telefon tıklama" },
    { type: "whatsapp_click", label: "WhatsApp tıklama" },
  ],
  home: [
    { type: "home_search_submit", label: "Arama gönderimi" },
    { type: "home_quick_action_click", label: "Hızlı eylem tıklama" },
    { type: "home_example_chip_click", label: "Örnek etiket tıklama" },
  ],
  taxi: [
    { type: "taxi_page_view", label: "Sayfa görüntüleme" },
    { type: "taxi_search", label: "Arama yapıldı" },
    { type: "phone_click", label: "Telefon araması" },
    { type: "whatsapp_click", label: "WhatsApp" },
    { type: "directions_click", label: "Yol tarifi" },
  ],
  gundem: [
    { type: "news_list_view", label: "Liste görüntüleme" },
    { type: "news_article_view", label: "Yazı görüntüleme" },
    { type: "news_share_click", label: "Paylaşım" },
  ],
  eczane: [{ type: "eczane_page_view", label: "Sayfa görüntüleme" }],
  otobus: [{ type: "otobus_page_view", label: "Sayfa görüntüleme" }],
};

export interface RawBusinessEvent {
  event_type: string;
  occurred_at: string;
  device: string | null;
  referrer: string | null;
  meta: Record<string, unknown> | null;
}

/**
 * `document.referrer` bir tam URL'dir; burada kabaca kaynağa göre
 * gruplanır ("Site İçi", bilinen arama/sosyal platformlar, ya da hostname).
 * Boş/`null` referrer, kullanıcı doğrudan geldiğinde (yer imi, uygulama
 * içi tarayıcı, gizli sekme vb.) oluşur.
 */
export function classifyReferrer(referrer: string | null): string {
  if (!referrer) return "Doğrudan / Bilinmiyor";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host.includes("rehbergolbasi.com")) return "Site İçi";
    if (host.includes("google.")) return "Google";
    if (host.includes("instagram.")) return "Instagram";
    if (host.includes("facebook.") || host.includes("fb.")) return "Facebook";
    if (host.includes("t.co") || host.includes("twitter.") || host.includes("x.com")) return "Twitter/X";
    return host;
  } catch {
    return "Diğer";
  }
}

/** `meta.query` alanından güvenli şekilde bir arama terimi metni çıkarır. */
export function extractQuery(meta: Record<string, unknown> | null): string | null {
  const q = meta?.query;
  return typeof q === "string" && q.trim() ? q.trim().toLowerCase() : null;
}
