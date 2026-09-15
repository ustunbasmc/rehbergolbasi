export type AdPlacementKey =
  | "home"
  | "isletmeler_list"
  | "business_detail_horizontal"
  | "business_detail_square"
  | "taksi"
  | "gundem_list"
  | "gundem_detail"
  | "rehberler_list"
  | "nobetci_eczane"
  | "otobus_saatleri";

export interface AdPlacementInfo {
  key: AdPlacementKey;
  label: string;
  pageLabel: string;
  description: string;
  priceMonthly: number;
  /** Önerilen görsel boyutu (px), AdSlot.tsx'teki ASPECT_BY_VARIANT ile birebir aynı orana denk gelir. */
  imageSize: string;
}

/**
 * Reklam yerleşimlerinin tek doğru kaynağı — admin panelindeki fiyat
 * referansı ve `/reklam-ver` sayfasındaki fiyat tablosu buradan besleniyor,
 * ikisi de aynı listeyi kullanır ki asla birbirinden farklı fiyat göstermesin.
 * Fiyatlar, sayfanın göreli trafiğine ve reklamın belirginliğine (banner >
 * kare > listeye karışan kart) göre belirlenmiş bir başlangıç önerisidir —
 * kesin pazar verisine dayanmıyor, ileride gerçek trafik verisiyle (artık
 * admin dashboard'da mevcut) güncellenebilir.
 */
export const AD_PLACEMENTS: AdPlacementInfo[] = [
  {
    key: "home",
    label: "Ana Sayfa Banner",
    pageLabel: "Ana Sayfa",
    description: "Sitenin en çok ziyaret edilen sayfasında, geniş banner formatında.",
    priceMonthly: 1250,
    imageSize: "1200 × 340 px (yatay banner)",
  },
  {
    key: "isletmeler_list",
    label: "İşletme Listesi",
    pageLabel: "İşletmeler, kategori ve etiket sayfaları",
    description: "İşletme kartlarıyla birebir aynı boyutta, listenin en üstünde doğal reklam.",
    priceMonthly: 850,
    imageSize: "800 × 600 px (kart, 4:3)",
  },
  {
    key: "taksi",
    label: "Taksi Çağır Banner",
    pageLabel: "Taksi Çağır",
    description: "Sayfanın en üstünde, \"Konumumu Kullan\" butonunun üzerinde geniş banner.",
    priceMonthly: 750,
    imageSize: "1200 × 340 px (yatay banner)",
  },
  {
    key: "gundem_list",
    label: "Gündem Listesi Banner",
    pageLabel: "Gölbaşı Gündem",
    description: "Haber akışının içinde geniş banner.",
    priceMonthly: 650,
    imageSize: "1200 × 340 px (yatay banner)",
  },
  {
    key: "business_detail_horizontal",
    label: "İşletme Detayı — Yatay",
    pageLabel: "Tüm işletme detay sayfaları",
    description: "İşletme açıklamasının hemen altında geniş banner.",
    priceMonthly: 650,
    imageSize: "1200 × 340 px (yatay banner)",
  },
  {
    key: "business_detail_square",
    label: "İşletme Detayı — Kare",
    pageLabel: "Tüm işletme detay sayfaları",
    description: "Çalışma saatleri kartının altında kare reklam.",
    priceMonthly: 550,
    imageSize: "800 × 800 px (kare)",
  },
  {
    key: "gundem_detail",
    label: "Gündem Haber Detayı",
    pageLabel: "Gündem haber detay sayfaları",
    description: "Haber okunurken yan tarafta (kenar çubuğunda) kare reklam.",
    priceMonthly: 500,
    imageSize: "800 × 800 px (kare)",
  },
  {
    key: "rehberler_list",
    label: "Rehberler Listesi",
    pageLabel: "Rehberler",
    description: "Rehber kartlarıyla aynı boyutta, listeye doğal karışan reklam.",
    priceMonthly: 450,
    imageSize: "800 × 600 px (kart, 4:3)",
  },
  {
    key: "nobetci_eczane",
    label: "Nöbetçi Eczane",
    pageLabel: "Nöbetçi Eczane",
    description: "Sayfanın yan tarafında kare reklam.",
    priceMonthly: 400,
    imageSize: "800 × 800 px (kare)",
  },
  {
    key: "otobus_saatleri",
    label: "Otobüs Saatleri",
    pageLabel: "Otobüs Saatleri",
    description: "Sayfanın yan tarafında kare reklam.",
    priceMonthly: 400,
    imageSize: "800 × 800 px (kare)",
  },
];

export function formatAdPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(
    price
  );
}
