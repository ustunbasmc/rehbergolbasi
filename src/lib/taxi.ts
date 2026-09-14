import { supabase } from "@/lib/supabase";

/**
 * Bir işletmenin taksi durağı sayılıp sayılmadığı HER ZAMAN mevcut kategori
 * ağacından belirlenir (slug: "taksi-duragi") — ikinci/bağımsız bir taksi
 * veri kaynağı veya boolean bayrak (is_taxi_service) OLUŞTURULMADI, çünkü
 * mevcut kategori sınıflandırması bunu zaten güvenilir şekilde yapıyor.
 */
export const TAXI_CATEGORY_SLUG = "taksi-duragi";

/**
 * Telefon numarası admin tarafından bu kadar gündür kontrol edilmediyse
 * "güncelliği şüpheli" sayılır. Kod içinde dağınık hard-code yerine tek
 * merkezi sabit.
 */
export const TAXI_PHONE_STALE_DAYS = 90;

export async function getTaxiCategoryIds(): Promise<string[]> {
  const { data: categories } = await supabase.from("categories").select("id, slug, parent_id");
  const taxiCat = (categories ?? []).find((c) => c.slug === TAXI_CATEGORY_SLUG);
  if (!taxiCat) return [];
  return [taxiCat.id, ...(categories ?? []).filter((c) => c.parent_id === taxiCat.id).map((c) => c.id)];
}

/**
 * İki koordinat arasındaki kuş uçuşu mesafeyi km cinsinden döndürür
 * (Haversine formülü). Yalnızca istemci tarafında çağrılır; kullanıcının
 * kesin konumu hiçbir zaman sunucuya/analytics'e gönderilmez.
 */
export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    const meters = Math.round(km * 1000 / 10) * 10;
    return `${meters} m`;
  }
  return `${km.toFixed(km < 10 ? 1 : 0).replace(".", ",")} km`;
}

const TR_CHAR_MAP: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i",
};

/**
 * Türkçe karaktere duyarlı, aksan/karakter farklılıklarını tolere eden
 * arama normalizasyonu ("Seğmenler" ~ "Segmenler" ~ "seğmenler").
 */
export function normalizeForSearch(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .split("")
    .map((ch) => TR_CHAR_MAP[ch] ?? ch)
    .join("")
    .trim();
}

/**
 * Mahalle adlarındaki "Mahallesi"/"Mah." gibi ek/tutarsızlıkları temizleyip
 * karşılaştırma için sade bir anahtar üretir ("Seğmenler Mahallesi" ve
 * "Seğmenler" aynı mahalle olarak eşleşsin diye).
 */
export function normalizeNeighborhoodKey(text: string): string {
  return normalizeForSearch(text)
    .replace(/\bmahallesi\b/g, "")
    .replace(/\bmah\.?\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

