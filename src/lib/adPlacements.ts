import { supabase } from "@/lib/supabase";

export type AdPlacementKey =
  | "home"
  | "isletmeler_list"
  | "business_detail_horizontal"
  | "business_detail_square"
  | "taksi"
  | "gundem_list"
  | "gundem_detail"
  | "gundem_detail_inline"
  | "rehberler_list"
  | "nobetci_eczane"
  | "otobus_saatleri"
  | "mahalle_detail";

export interface AdPlacementInfo {
  key: AdPlacementKey;
  label: string;
  pageLabel: string;
  description: string;
  /** Admin panelinden `ad_placement_prices` tablosu ile düzenlenmeden önceki varsayılan/başlangıç fiyatı. */
  priceMonthly: number;
  /** Önerilen görsel boyutu (px), AdSlot.tsx'teki ASPECT_BY_VARIANT ile birebir aynı orana denk gelir. */
  imageSize: string;
}

/**
 * Reklam yerleşimlerinin tek doğru kaynağı — admin panelindeki fiyat
 * referansı ve `/reklam-ver` sayfasındaki fiyat tablosu buradan besleniyor,
 * ikisi de aynı listeyi kullanır ki asla birbirinden farklı fiyat göstermesin.
 * `priceMonthly` burada yalnızca `ad_placement_prices` tablosu boşsa/henüz
 * oluşturulmamışsa kullanılan varsayılan değerdir — gerçek fiyatlar admin
 * panelindeki "Fiyat Ayarları" bölümünden değiştirilebilir, bkz. `getPlacementPrices`.
 */
export const AD_PLACEMENTS: AdPlacementInfo[] = [
  {
    key: "home",
    label: "Ana Sayfa Banner",
    pageLabel: "Ana Sayfa",
    description: "Sitenin en çok ziyaret edilen sayfasında, geniş banner formatında.",
    priceMonthly: 10000,
    imageSize: "1200 × 340 px (yatay banner)",
  },
  {
    key: "isletmeler_list",
    label: "İşletme Listesi",
    pageLabel: "İşletmeler, kategori ve etiket sayfaları",
    description: "İşletme kartlarıyla birebir aynı boyutta, listenin en üstünde doğal reklam.",
    priceMonthly: 6500,
    imageSize: "800 × 600 px (kart, 4:3)",
  },
  {
    key: "taksi",
    label: "Taksi Çağır Banner",
    pageLabel: "Taksi Çağır",
    description: "Sayfanın en üstünde, \"Konumumu Kullan\" butonunun üzerinde geniş banner.",
    priceMonthly: 6000,
    imageSize: "1200 × 340 px (yatay banner)",
  },
  {
    key: "gundem_list",
    label: "Gündem Listesi Banner",
    pageLabel: "Gölbaşı Gündem",
    description: "Haber akışının içinde geniş banner.",
    priceMonthly: 5000,
    imageSize: "1200 × 340 px (yatay banner)",
  },
  {
    key: "business_detail_horizontal",
    label: "İşletme Detayı — Yatay",
    pageLabel: "Tüm işletme detay sayfaları",
    description: "İşletme açıklamasının hemen altında geniş banner.",
    priceMonthly: 5000,
    imageSize: "1200 × 340 px (yatay banner)",
  },
  {
    key: "business_detail_square",
    label: "İşletme Detayı — Kare",
    pageLabel: "Tüm işletme detay sayfaları",
    description: "Çalışma saatleri kartının altında kare reklam.",
    priceMonthly: 4000,
    imageSize: "800 × 800 px (kare)",
  },
  {
    key: "gundem_detail",
    label: "Gündem Haber Detayı",
    pageLabel: "Gündem haber detay sayfaları",
    description: "Haber okunurken yan tarafta (kenar çubuğunda) kare reklam.",
    priceMonthly: 4000,
    imageSize: "800 × 800 px (kare)",
  },
  {
    key: "gundem_detail_inline",
    label: "Gündem Haber İçi — Yatay",
    pageLabel: "Gündem haber detay sayfaları",
    description: "Haber metninin ilk paragrafının hemen altında geniş banner.",
    priceMonthly: 4500,
    imageSize: "1200 × 340 px (yatay banner)",
  },
  {
    key: "rehberler_list",
    label: "Rehberler Listesi",
    pageLabel: "Rehberler",
    description: "Rehber kartlarıyla aynı boyutta, listeye doğal karışan reklam.",
    priceMonthly: 3500,
    imageSize: "800 × 600 px (kart, 4:3)",
  },
  {
    key: "nobetci_eczane",
    label: "Nöbetçi Eczane",
    pageLabel: "Nöbetçi Eczane",
    description: "Sayfanın yan tarafında kare reklam.",
    priceMonthly: 3000,
    imageSize: "800 × 800 px (kare)",
  },
  {
    key: "otobus_saatleri",
    label: "Otobüs Saatleri",
    pageLabel: "Otobüs Saatleri",
    description: "Sayfanın yan tarafında kare reklam.",
    priceMonthly: 3000,
    imageSize: "800 × 800 px (kare)",
  },
  {
    key: "mahalle_detail",
    label: "Mahalle Sayfası",
    pageLabel: "Mahalle detay sayfaları",
    description: "Mahalle sayfasının yan tarafında, muhtar ve nüfus kartlarının altında kare reklam.",
    priceMonthly: 3000,
    imageSize: "800 × 800 px (kare)",
  },
];

export function formatAdPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(
    price
  );
}

const DEFAULT_PLACEMENT_PRICES: Record<AdPlacementKey, number> = Object.fromEntries(
  AD_PLACEMENTS.map((p) => [p.key, p.priceMonthly])
) as Record<AdPlacementKey, number>;

/**
 * Güncel reklam fiyatlarını döner: `ad_placement_prices` tablosundaki admin
 * tarafından girilmiş değerler öncelikli, tablo henüz oluşturulmamışsa veya
 * bir yerleşim için satır yoksa `AD_PLACEMENTS`'teki varsayılana düşer —
 * `AdSlot.tsx`'teki `getActiveAd` ile aynı "SQL çalıştırılmadan önce de
 * sayfa kırılmasın" deseni.
 */
export async function getPlacementPrices(): Promise<Record<AdPlacementKey, number>> {
  const prices = { ...DEFAULT_PLACEMENT_PRICES };
  try {
    const { data } = await supabase.from("ad_placement_prices").select("placement, price_monthly");
    for (const row of data ?? []) {
      if (row.placement in prices) {
        prices[row.placement as AdPlacementKey] = Number(row.price_monthly);
      }
    }
  } catch {
    // tablo henüz oluşturulmadıysa varsayılan fiyatlar kullanılır
  }
  return prices;
}

/** Admin panelindeki "Fiyat Ayarları" bölümünden tek bir yerleşimin fiyatını günceller. */
export async function setPlacementPrice(placement: AdPlacementKey, priceMonthly: number) {
  return supabase
    .from("ad_placement_prices")
    .upsert({ placement, price_monthly: priceMonthly }, { onConflict: "placement" });
}
