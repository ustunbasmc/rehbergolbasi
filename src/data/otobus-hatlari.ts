/**
 * Bu sayfadaki hat/saat verilerinin kaynağı ve güncellik bilgisi. Sahte bir
 * tarih göstermemek için `sonKontrolTarihi` gerçek veri kontrolü yapıldığında
 * elle güncellenmelidir — build/deploy tarihinden veya `new Date()`'ten asla
 * otomatik türetilmez. Gerçek tarih bilinmiyorsa null bırakılır ve arayüzde
 * "belirtilmedi" olarak gösterilir.
 *
 * 2026-09-16 tarihinde EGO Genel Müdürlüğü'nün resmi "Hareket Saatleri" servisinden
 * (ego.gov.tr/hareketsaatleri) Gölbaşı ilçesine ait TÜM hatlar (GÖLBAŞI, TAŞPINAR,
 * TULUMTAŞ, İNCEK TOKİ, BALLIKPINAR güzergahları) tek tek çekilerek güncellendi —
 * hat adı, kalkış/varış, mesafe, süre, hafta içi/Cumartesi/Pazar saatleri ve
 * durak listesi resmi kaynaktan birebir alındı.
 */
export const OTOBUS_VERI_KAYNAGI = "EGO Genel Müdürlüğü";
export const OTOBUS_SON_KONTROL_TARIHI: string | null = "2026-09-16";

export type HatKategori =
  | "sehir-merkezi"
  | "akkopru-asti"
  | "incek-cankaya"
  | "kirsal"
  | "golbasi-ici";

export interface OtobusHatti {
  no: string;
  ad: string;
  kalkis: string;
  varis: string;
  mesafeKm: number;
  sureDk: number;
  kategori: HatKategori;
  saatler: {
    haftaici: string[];
    cumartesi: string[];
    pazar: string[];
  };
  duraklar: string[];
  notlar?: string;
}

export const KATEGORILER: { key: HatKategori; label: string; aciklama: string }[] = [
  { key: "sehir-merkezi", label: "Şehir merkezi", aciklama: "Kızılay, Ulus, Sıhhiye, Opera" },
  { key: "akkopru-asti", label: "Akköprü / AŞTİ", aciklama: "Yenimahalle, Balgat, AŞTİ" },
  { key: "incek-cankaya", label: "İncek / Çankaya", aciklama: "Taşpınar, Tulumtaş, İncek" },
  { key: "kirsal", label: "Kırsal mahalleler", aciklama: "Köyler ve uzak mahalleler" },
  { key: "golbasi-ici", label: "Gölbaşı içi", aciklama: "İlçe içi kısa hatlar" },
];

export const OTOBUS_HATLARI: OtobusHatti[] = [
  {
    no: "105-1",
    ad: "Gölbaşı - Kızılay - Ulus",
    kalkis: "Bahçelievler Mh.",
    varis: "Doğanbey Mh.",
    mesafeKm: 29,
    sureDk: 55,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["06:08", "06:44", "07:32", "08:00", "09:30", "11:00", "12:30", "14:00", "15:24", "17:00", "18:30", "19:15"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Kaymakamlık", "288 Sk.", "Mevlana Camii", "Bahçeli Park", "Şehit Meriç Alemdar Ortaokulu", "Saray Evleri Durağı", "Örencik Mahallesi", "Yağmur Evler Sitesi", "Trafo Durağı", "Anaokulu", "İbrahim Sıtkı Göçmen Parkı", "Öğretmenler Sitesi", "Seğmenler Mahallesi Muhtarlığı", "Seğmenler Sağlık Merkezi", "936.Sk.", "Mevlana Parkı", "279.Cd.", "Ankara Cd.", "Fatma Ercan Cami", "Üst Geçit", "Gölbaşı Stadyumu", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Dikmen Kavşağı", "Çeşme", "Akpınar", "Turhan Dökmeci İlköğretim Okulu", "Akpınar Mahallesi", "Gökkuşağı Mahallesi", "Koşuyolu Parkı", "Fen Lisesi", "Taurus Avm", "Balgat Köprüsü", "Yurtdışı Türkler Başkanlığı", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Ufuk Üniversitesi", "Sayıştay", "Milli Kütüphane", "Kara Kuvvetleri Komutanlığı", "Karayolları Genel Müdürlüğü", "Güvenpark", "Kızılay", "Sıhhiye", "Opera", "Otel Durağı"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "105-2",
    ad: "Ulus - Kızılay - Gölbaşı",
    kalkis: "Doğanbey Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 33,
    sureDk: 70,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["06:30", "06:55", "07:40", "08:30", "09:00", "09:30", "11:20", "12:20", "13:00", "13:40", "14:20", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Ulus Ziraat Bankası", "Opera", "Sıhhiye", "Kızılay", "Milli Eğitim Bakanlığı", "Karayolları Genel Müdürlüğü", "Milli Kütüphane", "Kültür Ve Turizm Bakanlığı", "Hazine Ve Maliye Bakanlığı", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Avm Durağı", "Sanayi Sitesi", "Şelale Parkı", "407.Sk.", "Şehit Gaffar Okkan", "Osmanlı Parkı", "Jandarma", "Gölbaşı Belediyesi", "Gölbaşı Kaymakamlık", "Mevlana Parkı", "936.Sk.", "Seğmenler Sağlık Merkezi", "Seğmenler Mahallesi Muhtarlığı", "Öğretmenler Sitesi", "İbrahim Sıtkı Göçmen Parkı", "Anaokulu", "Trafo Durağı", "Yağmur Evler Sitesi", "Örencik Mahallesi", "Saray Evleri Durağı", "Şehit Meriç Alemdar Ortaokulu", "Bahçeli Park", "Mevlana Camii", "288 Sk.", "Sevgi Çiçeği İlköğretim Okulu", "Diş Hastanesi", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Yurtlar", "Spor Bilimleri Fakültesi", "Kurum Belge Arşivi", "Yabancı Diller", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Milli İrade Öğrenci Yurdu", "35.Cd.", "Başkent Sitesi", "Yunus Emre Camii", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "105-3",
    ad: "Gölbaşı - Milli Kütüphane",
    kalkis: "Bahçelievler Mh.",
    varis: "Nasuh Akar Mh.",
    mesafeKm: 24,
    sureDk: 60,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["06:20", "06:32", "06:56", "07:08", "07:20", "07:44", "08:30", "09:00", "10:00", "10:30", "11:30", "12:00", "13:00", "13:30", "14:30", "15:00", "15:48", "16:12", "16:36", "17:24", "17:36", "18:00", "19:00"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Kaymakamlık", "288 Sk.", "Mevlana Camii", "Bahçeli Park", "Şehit Meriç Alemdar Ortaokulu", "Saray Evleri Durağı", "Örencik Mahallesi", "Yağmur Evler Sitesi", "Trafo Durağı", "Anaokulu", "İbrahim Sıtkı Göçmen Parkı", "Öğretmenler Sitesi", "Seğmenler Mahallesi Muhtarlığı", "Seğmenler Sağlık Merkezi", "936.Sk.", "Mevlana Parkı", "279.Cd.", "Ankara Cd.", "Fatma Ercan Cami", "Üst Geçit", "Gölbaşı Stadyumu", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Dikmen Kavşağı", "Çeşme", "Akpınar", "Turhan Dökmeci İlköğretim Okulu", "Akpınar Mahallesi", "Gökkuşağı Mahallesi", "Koşuyolu Parkı", "Fen Lisesi", "Taurus Avm", "Balgat Köprüsü", "Yurtdışı Türkler Başkanlığı", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Ufuk Üniversitesi", "Sayıştay", "Milli Kütüphane"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "105-4",
    ad: "Milli Kütüphane - Gölbaşı",
    kalkis: "Emek Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 27,
    sureDk: 60,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["07:00", "07:24", "08:00", "08:30", "09:00", "09:30", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45", "12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "15:45", "16:00", "16:15", "16:30", "16:45", "17:00", "17:30", "18:00", "18:15", "18:45", "19:00", "19:20", "19:40", "20:00"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Milli Kütüphane", "Kültür Ve Turizm Bakanlığı", "Hazine Ve Maliye Bakanlığı", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Avm Durağı", "Sanayi Sitesi", "Şelale Parkı", "407.Sk.", "Şehit Gaffar Okkan", "Osmanlı Parkı", "Jandarma", "Gölbaşı Belediyesi", "Gölbaşı Kaymakamlık", "Mevlana Parkı", "936.Sk.", "Seğmenler Sağlık Merkezi", "Seğmenler Mahallesi Muhtarlığı", "Öğretmenler Sitesi", "İbrahim Sıtkı Göçmen Parkı", "Anaokulu", "Trafo Durağı", "Yağmur Evler Sitesi", "Örencik Mahallesi", "Saray Evleri Durağı", "Şehit Meriç Alemdar Ortaokulu", "Bahçeli Park", "Mevlana Camii", "288 Sk.", "Sevgi Çiçeği İlköğretim Okulu", "Diş Hastanesi", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Yurtlar", "Spor Bilimleri Fakültesi", "Kurum Belge Arşivi", "Yabancı Diller", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Milli İrade Öğrenci Yurdu", "35.Cd.", "Başkent Sitesi", "Yunus Emre Camii", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "106-3",
    ad: "Gölbaşı - Yurtlar - AŞTİ - Akköprü - Ulus",
    kalkis: "Bahçelievler Mh.",
    varis: "Doğanbey Mh.",
    mesafeKm: 29,
    sureDk: 55,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["05:45", "06:00", "19:30", "19:45", "20:00", "20:20", "20:40", "21:00", "21:20", "21:40", "22:00", "22:30"],
      cumartesi: ["05:45", "06:00", "06:15", "06:30", "06:40", "06:50", "07:00", "07:10", "07:20", "07:30", "07:40", "07:50", "08:00", "08:15", "08:30", "08:45", "09:00", "09:20", "09:40", "10:00", "10:20", "10:40", "11:00", "11:20", "11:40", "12:00", "12:20", "12:40", "13:00", "13:20", "13:40", "14:00", "14:20", "14:40", "15:00", "15:15", "15:30", "15:45", "16:00", "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45", "18:00", "18:20", "18:40", "19:00", "19:20", "19:40", "20:00", "20:20", "20:45", "21:10", "21:35", "22:00", "22:30"],
      pazar: ["05:45", "06:00", "06:15", "06:35", "06:55", "07:15", "07:35", "07:55", "08:15", "08:35", "08:55", "09:15", "09:35", "09:55", "10:15", "10:35", "10:55", "11:15", "11:35", "11:55", "12:15", "12:35", "12:55", "13:15", "13:35", "13:55", "14:15", "14:35", "14:55", "15:15", "15:30", "15:45", "16:00", "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45", "18:00", "18:20", "18:40", "19:00", "19:20", "19:40", "20:00", "20:20", "20:45", "21:10", "21:35", "22:00", "22:30"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Kaymakamlık", "288 Sk.", "Mevlana Camii", "Bahçeli Park", "Şehit Meriç Alemdar Ortaokulu", "Saray Evleri Durağı", "Örencik Mahallesi", "Yağmur Evler Sitesi", "Trafo Durağı", "Anaokulu", "İbrahim Sıtkı Göçmen Parkı", "Öğretmenler Sitesi", "Seğmenler Mahallesi Muhtarlığı", "Seğmenler Sağlık Merkezi", "936.Sk.", "Mevlana Parkı", "279.Cd.", "Ankara Cd.", "Fatma Ercan Cami", "Üst Geçit", "Gölbaşı Stadyumu", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Dikmen Kavşağı", "Çeşme", "Akpınar", "Turhan Dökmeci İlköğretim Okulu", "Akpınar Mahallesi", "Gökkuşağı Mahallesi", "Koşuyolu Parkı", "Fen Lisesi", "Taurus Avm", "Balgat Köprüsü", "Yurtdışı Türkler Başkanlığı", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Ufuk Üniversitesi", "AŞTİ", "Bahçelievler", "Gazi Hastanesi", "Diş Hekimliği Fakültesi", "Etiler Ordu Evi", "Emniyet Sarayı", "Çevikkuvvet", "Atatürk Kültür Merkezi", "19 Mayıs Stadyumu"
    ],
  },
  {
    no: "106-4",
    ad: "Ulus - Kızılay - Gölbaşı - Yurtlar",
    kalkis: "Doğanbey Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 33,
    sureDk: 53,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["20:10", "20:20", "20:30", "20:40", "20:50", "21:00", "21:10", "21:20", "21:30", "21:40", "21:50", "22:00", "22:10", "22:20", "22:30", "22:40", "22:50", "23:00", "23:10", "23:22", "23:34"],
      cumartesi: ["06:35", "06:50", "07:05", "07:20", "07:35", "07:50", "08:05", "08:20", "08:35", "08:50", "09:05", "09:20", "09:35", "09:50", "10:10", "10:30", "10:50", "11:10", "11:30", "11:50", "12:10", "12:30", "12:50", "13:10", "13:30", "13:50", "14:10", "14:30", "14:50", "15:10", "15:30", "15:50", "16:05", "16:20", "16:35", "16:50", "17:05", "17:20", "17:35", "17:50", "18:05", "18:20", "18:35", "18:50", "19:05", "19:20", "19:35", "19:50", "20:05", "20:20", "20:35", "20:50", "21:05", "21:20", "21:35", "21:50", "22:05", "22:20", "22:35", "22:50", "23:05", "23:20", "23:35"],
      pazar: ["06:40", "07:00", "07:20", "07:40", "08:00", "08:20", "08:40", "09:00", "09:20", "09:40", "10:00", "10:20", "10:40", "11:00", "11:20", "11:40", "12:00", "12:20", "12:40", "13:00", "13:20", "13:40", "14:00", "14:20", "14:40", "15:00", "15:20", "15:35", "15:50", "16:05", "16:20", "16:35", "16:50", "17:05", "17:20", "17:35", "17:50", "18:05", "18:20", "18:35", "18:50", "19:05", "19:20", "19:35", "19:50", "20:05", "20:20", "20:35", "20:50", "21:05", "21:20", "21:35", "21:50", "22:05", "22:20", "22:35", "22:50", "23:05", "23:20", "23:35"],
    },
    duraklar: [
      "Ulus Ziraat Bankası", "Opera", "Sıhhiye", "Kızılay", "Milli Eğitim Bakanlığı", "Karayolları Genel Müdürlüğü", "Milli Kütüphane", "Kültür Ve Turizm Bakanlığı", "Hazine Ve Maliye Bakanlığı", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Avm Durağı", "Sanayi Sitesi", "Şelale Parkı", "407.Sk.", "Şehit Gaffar Okkan", "Osmanlı Parkı", "Jandarma", "Gölbaşı Belediyesi", "Gölbaşı Kaymakamlık", "Mevlana Parkı", "936.Sk.", "Seğmenler Sağlık Merkezi", "Seğmenler Mahallesi Muhtarlığı", "Öğretmenler Sitesi", "İbrahim Sıtkı Göçmen Parkı", "Anaokulu", "Trafo Durağı", "Yağmur Evler Sitesi", "Örencik Mahallesi", "Saray Evleri Durağı", "Şehit Meriç Alemdar Ortaokulu", "Bahçeli Park", "Mevlana Camii", "288 Sk.", "Sevgi Çiçeği İlköğretim Okulu", "Diş Hastanesi", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Yurtlar", "Spor Bilimleri Fakültesi", "Kurum Belge Arşivi", "Yabancı Diller", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Milli İrade Öğrenci Yurdu", "35.Cd.", "Başkent Sitesi", "Yunus Emre Camii", "Yeşil Dostlar Sitesi"
    ],
  },
  {
    no: "107-6",
    ad: "Gölbaşı - TOKİ - AŞTİ - Akköprü - Ulus",
    kalkis: "Doğanbey Mh.",
    varis: "Doğanbey Mh.",
    mesafeKm: 66,
    sureDk: 105,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["00:30", "02:00", "03:30", "05:00", "23:00"],
      cumartesi: ["00:30", "02:00", "03:30", "05:00", "23:00"],
      pazar: ["00:30", "02:00", "03:30", "05:00", "23:00"],
    },
    duraklar: [
      "Ulus Ziraat Bankası", "Opera", "Sıhhiye", "Kızılay", "Milli Eğitim Bakanlığı", "Karayolları Genel Müdürlüğü", "Milli Kütüphane", "Kültür Ve Turizm Bakanlığı", "Hazine Ve Maliye Bakanlığı", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Avm Durağı", "Sanayi Sitesi", "Şelale Parkı", "407.Sk.", "Şehit Gaffar Okkan", "Osmanlı Parkı", "Jandarma", "Gölbaşı Belediyesi", "Diş Hastanesi", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Milli İrade Öğrenci Yurdu", "35.Cd.", "Başkent Sitesi", "Yunus Emre Camii", "Yeşil Dostlar Sitesi", "Gölbaşı Hareket Noktası", "Kır Çiçeği Evleri", "Cumhuriyet Parkı", "Gölbaşı Kaymakamlık", "288 Sk.", "Mevlana Camii", "Bahçeli Park", "Şehit Meriç Alemdar Ortaokulu", "Saray Evleri Durağı", "Örencik Mahallesi", "Yağmur Evler Sitesi", "Trafo Durağı", "Anaokulu", "İbrahim Sıtkı Göçmen Parkı", "Öğretmenler Sitesi", "Seğmenler Mahallesi Muhtarlığı", "Seğmenler Sağlık Merkezi", "Şehit Oğuz Kaan Usta", "Seymenler", "Şehir Parkı", "İmam Hatip Lisesi", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "Kreş Durağı", "Eymir Yurdu", "Erdem Beyazıt Anadolu Lisesi", "Tuz Gölü Cd.", "Gediz Sk.", "Eğirdir Gölü Cd.", "Köyceğiz Gölü Cd.", "Belmek", "Park Eymir Ticaret Merkezi", "Manyas Gölü Cd.", "Yıldız Camii", "Sapanca Gölü Cd.", "Akçay Cd.", "Adem Bilhan Uysal İlkokulu", "Işıklı Göl Durağı", "Yedigöller Cd.", "Şht.sebahattin Koçak Anadolu İmam Hatip Lise", "Hilal Camii", "Safa Okulları", "936.Sk.", "Mevlana Parkı", "279.Cd.", "Ankara Cd.", "Fatma Ercan Cami", "Üst Geçit", "Gölbaşı Stadyumu", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "Akpınar", "Turhan Dökmeci İlkokulu", "Koşuyolu Parkı", "Yurtdışı Türkler Başkanlığı", "Ufuk Üniversitesi", "AŞTİ", "Bahçelievler", "Gazi Hastanesi", "Diş Hekimliği Fakültesi", "Etiler Ordu Evi", "Emniyet Sarayı", "Atatürk Kültür Merkezi", "19 Mayıs Stadyumu", "İlk Meclis Durağı"
    ],
    notlar: "00:30 de gölbaşı, 01:30 da ulustan hareket eder",
  },
  {
    no: "115",
    ad: "Gölbaşı - Yurtlar - Kızılay - Ulus",
    kalkis: "Bahçelievler Mh.",
    varis: "Doğanbey Mh.",
    mesafeKm: 25,
    sureDk: 50,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["06:30", "07:30"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Osmanlı Parkı", "Üniversiteliler Sk.", "Gölbaşı Mesleki Ve Teknik Anadolu Lisesi", "Yunus Emre Parkı", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Dikmen Kavşağı", "Çeşme", "Akpınar", "Turhan Dökmeci İlköğretim Okulu", "Akpınar Mahallesi", "Gökkuşağı Mahallesi", "Koşuyolu Parkı", "Fen Lisesi", "Taurus Avm", "Balgat Köprüsü", "Yurtdışı Türkler Başkanlığı", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Ufuk Üniversitesi", "Sayıştay", "Milli Kütüphane", "Kara Kuvvetleri Komutanlığı", "Karayolları Genel Müdürlüğü", "Güvenpark", "Kızılay", "Sıhhiye", "Opera", "Otel Durağı"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "115-1",
    ad: "Gölbaşı - Kampüs - Yurtlar - Kızılay - Ulus",
    kalkis: "Bahçelievler Mh.",
    varis: "Doğanbey Mh.",
    mesafeKm: 27,
    sureDk: 55,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["10:15", "12:15", "13:30", "14:00", "15:20", "16:16", "17:40"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Yabancı Diller", "Kurum Belge Arşivi", "Spor Bilimleri Fakültesi", "Yurtlar", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Osmanlı Parkı", "Üniversiteliler Sk.", "Gölbaşı Mesleki Ve Teknik Anadolu Lisesi", "Yunus Emre Parkı", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Dikmen Kavşağı", "Çeşme", "Akpınar", "Turhan Dökmeci İlköğretim Okulu", "Akpınar Mahallesi", "Gökkuşağı Mahallesi", "Koşuyolu Parkı", "Fen Lisesi", "Taurus Avm", "Balgat Köprüsü", "Yurtdışı Türkler Başkanlığı", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Ufuk Üniversitesi", "Sayıştay", "Milli Kütüphane", "Kara Kuvvetleri Komutanlığı", "Karayolları Genel Müdürlüğü", "Güvenpark", "Kızılay", "Sıhhiye", "Opera", "Otel Durağı"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "115-2",
    ad: "Ulus - Kızılay Gölbaşı - Kampüs - Yurtlar",
    kalkis: "Doğanbey Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 27,
    sureDk: 55,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["06:42", "07:15", "08:05", "10:20"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Ulus Ziraat Bankası", "Opera", "Sıhhiye", "Kızılay", "Milli Eğitim Bakanlığı", "Karayolları Genel Müdürlüğü", "Milli Kütüphane", "Kültür Ve Turizm Bakanlığı", "Hazine Ve Maliye Bakanlığı", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Avm Durağı", "Sanayi Sitesi", "Şelale Parkı", "407.Sk.", "Şehit Gaffar Okkan", "Osmanlı Parkı", "Jandarma", "Gölbaşı Belediyesi", "Diş Hastanesi", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Yurtlar", "Spor Bilimleri Fakültesi", "Kurum Belge Arşivi", "Yabancı Diller", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Milli İrade Öğrenci Yurdu", "35.Cd.", "Başkent Sitesi", "Yunus Emre Camii", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "115-3",
    ad: "Gölbaşı - Yurtlar - Milli Kütüphane",
    kalkis: "Bahçelievler Mh.",
    varis: "Nasuh Akar Mh.",
    mesafeKm: 20,
    sureDk: 55,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["06:50", "07:10", "07:50", "08:12", "08:48", "09:15"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Osmanlı Parkı", "Üniversiteliler Sk.", "Gölbaşı Mesleki Ve Teknik Anadolu Lisesi", "Yunus Emre Parkı", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Dikmen Kavşağı", "Çeşme", "Akpınar", "Turhan Dökmeci İlköğretim Okulu", "Akpınar Mahallesi", "Gökkuşağı Mahallesi", "Koşuyolu Parkı", "Fen Lisesi", "Taurus Avm", "Balgat Köprüsü", "Yurtdışı Türkler Başkanlığı", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Ufuk Üniversitesi", "Sayıştay", "Milli Kütüphane"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "115-4",
    ad: "Gölbaşı - Kampüs - Yurtlar - Milli Kütüphane",
    kalkis: "Bahçelievler Mh.",
    varis: "Nasuh Akar Mh.",
    mesafeKm: 22,
    sureDk: 32,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["09:45", "10:45", "11:15", "11:45", "12:45", "13:10", "13:40", "14:20", "14:40", "15:00", "15:40", "16:00", "16:40", "16:56", "17:12", "17:20", "18:00", "18:20"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Yabancı Diller", "Kurum Belge Arşivi", "Spor Bilimleri Fakültesi", "Yurtlar", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Osmanlı Parkı", "Üniversiteliler Sk.", "Gölbaşı Mesleki Ve Teknik Anadolu Lisesi", "Yunus Emre Parkı", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Dikmen Kavşağı", "Çeşme", "Akpınar", "Turhan Dökmeci İlköğretim Okulu", "Akpınar Mahallesi", "Gökkuşağı Mahallesi", "Koşuyolu Parkı", "Fen Lisesi", "Taurus Avm", "Balgat Köprüsü", "Yurtdışı Türkler Başkanlığı", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Ufuk Üniversitesi", "Sayıştay", "Milli Kütüphane"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "115-8",
    ad: "Milli Kütüphane - Gölbaşı - Kampüs - Yurtlar",
    kalkis: "Emek Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 22,
    sureDk: 60,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["07:12", "07:36", "07:48", "08:10", "08:20", "08:40", "08:50", "09:10", "09:20", "09:45", "17:15", "17:45", "18:30"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Milli Kütüphane", "Kültür Ve Turizm Bakanlığı", "Hazine Ve Maliye Bakanlığı", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Avm Durağı", "Sanayi Sitesi", "Şelale Parkı", "407.Sk.", "Şehit Gaffar Okkan", "Osmanlı Parkı", "Jandarma", "Gölbaşı Belediyesi", "Diş Hastanesi", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Yurtlar", "Spor Bilimleri Fakültesi", "Kurum Belge Arşivi", "Yabancı Diller", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Milli İrade Öğrenci Yurdu", "35.Cd.", "Başkent Sitesi", "Yunus Emre Camii", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "150-1",
    ad: "1.Bölge Yerleşkesi - Konya Yolu - Ulus",
    kalkis: "Karaoğlan Mh.",
    varis: "Doğanbey Mh.",
    mesafeKm: 34,
    sureDk: 45,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["08:10", "09:10", "10:00", "11:00", "12:00", "13:00", "14:00", "15:10", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:10"],
      cumartesi: ["08:15", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:10", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:10"],
      pazar: ["08:15", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:10", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:10"],
    },
    duraklar: [
      "Maç Tesisleri", "Neru", "Bakap Giriş", "Bakap", "Koluman", "Paşa Kapısı", "Ulaşan Otel", "Serkent Sitesi", "Vilayetler", "Ankara Cd.", "Fatma Ercan Cami", "Üst Geçit", "Gölbaşı Stadyumu", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Dikmen Kavşağı", "Çeşme", "Akpınar", "Turhan Dökmeci İlköğretim Okulu", "Akpınar Mahallesi", "Gökkuşağı Mahallesi", "Koşuyolu Parkı", "Fen Lisesi", "Taurus Avm", "Balgat Köprüsü", "Yurtdışı Türkler Başkanlığı", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Ufuk Üniversitesi", "AŞTİ", "Bahçelievler", "Gazi Hastanesi", "Diş Hekimliği Fakültesi", "Etiler Ordu Evi", "Emniyet Sarayı", "Çevikkuvvet", "Atatürk Kültür Merkezi", "19 Mayıs Stadyumu", "İlk Meclis Durağı"
    ],
    notlar: "Bakap a gider",
  },
  {
    no: "150-2",
    ad: "Ulus - Konya Yolu - 1.Bölge Yerleşkesi",
    kalkis: "Doğanbey Mh.",
    varis: "Karaoğlan Mh.",
    mesafeKm: 34,
    sureDk: 45,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["07:20", "08:10", "09:10", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
      cumartesi: ["07:10", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
      pazar: ["07:10", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
    },
    duraklar: [
      "Ulus Ziraat Bankası", "Otel Durağı", "Tesviyeciler Durağı", "Çevik Kuvvet", "Emniyet Sarayı", "Etiler Ordu Evi", "Diş Hekimliği Fakültesi", "Gazi Hastanesi", "Zübeyde Hanım Yurt Müdürlüğü", "Emek", "AŞTİ", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Avm Durağı", "Sanayi Sitesi", "Şelale Parkı", "Osmanlı Parkı", "Üst Geçit", "Ankara Cd.", "Ptt Gölbaşı Şubesi", "Vilayetler", "Serkent Sitesi", "Ulaşan Otel", "Paşa Kapısı", "Koluman", "Bakap Giriş", "Bakap", "Neru", "Maç Tesisleri"
    ],
    notlar: "Bakap a gider",
  },
  {
    no: "195-1",
    ad: "Gölbaşı TOKİ - Kızılay - Ulus",
    kalkis: "Bahçelievler Mh.",
    varis: "Doğanbey Mh.",
    mesafeKm: 36,
    sureDk: 65,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["06:05", "06:17", "06:31", "06:59", "07:27", "07:48", "08:10", "09:00", "10:00", "11:00", "11:35", "12:20", "13:05", "13:50", "14:35", "15:15", "16:05", "17:05", "18:00", "19:30", "21:00", "22:00"],
      cumartesi: ["06:05", "06:40", "07:25", "08:10", "09:00", "10:00", "11:00", "11:45", "12:30", "13:15", "14:00", "14:45", "15:30", "16:15", "17:00", "18:00", "19:30", "21:00", "22:00"],
      pazar: ["06:05", "06:40", "07:25", "08:10", "09:00", "10:00", "11:00", "11:45", "12:30", "13:15", "14:00", "14:45", "15:30", "16:15", "17:00", "18:00", "19:30", "21:00", "22:00"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Kaymakamlık", "Mevlana Parkı", "936.Sk.", "Şehit Oğuz Kaan Usta", "Seymenler", "Şehir Parkı", "İmam Hatip Lisesi", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "Kreş Durağı", "Eymir Yurdu", "Erdem Beyazıt Anadolu Lisesi", "Tuz Gölü Cd.", "Gediz Sk.", "Eğirdir Gölü Cd.", "Köyceğiz Gölü Cd.", "Belmek", "Park Eymir Ticaret Merkezi", "Manyas Gölü Cd.", "Yıldız Camii", "Sapanca Gölü Cd.", "Akçay Cd.", "Adem Bilhan Uysal İlkokulu", "Işıklı Göl Durağı", "Yedigöller Cd.", "Şht.sebahattin Koçak Anadolu İmam Hatip Lise", "Hilal Camii", "Safa Okulları", "Kaymak Sitesi", "Eymir Ve Şafak Mahallesi Muhtarlığı", "Cemil Yıldırım Orta Okulu", "Cumhuriyet Spor Salonu", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Dikmen Kavşağı", "Çeşme", "Akpınar", "Turhan Dökmeci İlköğretim Okulu", "Akpınar Mahallesi", "Gökkuşağı Mahallesi", "Koşuyolu Parkı", "Fen Lisesi", "Taurus Avm", "Balgat Köprüsü", "Yurtdışı Türkler Başkanlığı", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Ufuk Üniversitesi", "Sayıştay", "Milli Kütüphane", "Kara Kuvvetleri Komutanlığı", "Karayolları Genel Müdürlüğü", "Güvenpark", "Kızılay", "Sıhhiye", "Opera", "Otel Durağı"
    ],
    notlar: "Gölbaşı tokiden başlar",
  },
  {
    no: "195-2",
    ad: "Ulus - Kızılay - Gölbaşı TOKİ",
    kalkis: "Doğanbey Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 37,
    sureDk: 70,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["06:30", "06:50", "07:20", "07:50", "08:20", "08:50", "09:40", "10:30", "11:30", "12:30", "13:10", "13:50", "14:20", "14:50", "15:20", "15:50", "16:20", "16:50", "17:20", "17:50", "18:20", "18:50", "19:20", "19:50", "20:20", "21:00", "21:40", "22:20", "23:15"],
      cumartesi: ["06:50", "07:30", "08:10", "08:50", "09:30", "10:30", "11:30", "12:30", "13:20", "14:10", "15:00", "15:45", "16:30", "17:15", "18:00", "18:45", "19:30", "20:15", "21:00", "21:40", "22:20", "23:15"],
      pazar: ["06:50", "07:30", "08:10", "08:50", "09:30", "10:30", "11:30", "12:30", "13:20", "14:10", "15:00", "15:45", "16:30", "17:15", "18:00", "18:45", "19:30", "20:15", "21:00", "21:40", "22:20", "23:15"],
    },
    duraklar: [
      "Ulus Ziraat Bankası", "Opera", "Sıhhiye", "Kızılay", "Milli Eğitim Bakanlığı", "Karayolları Genel Müdürlüğü", "Milli Kütüphane", "Kültür Ve Turizm Bakanlığı", "Hazine Ve Maliye Bakanlığı", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Avm Durağı", "Sanayi Sitesi", "Haymana Yolu", "Yunus Emre Parkı", "Cumhuriyet Spor Salonu", "Cemil Yıldırım Orta Okulu", "Tek Camii", "Kaymak Sitesi", "Şehir Parkı", "İmam Hatip Lisesi", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "Kreş Durağı", "Eymir Yurdu", "Erdem Beyazıt Anadolu Lisesi", "Tuz Gölü Cd.", "Hilal Cami", "Şht.sebahattin Koçak Anadolu İmam Hatip Lise", "Yedigöller Cd.", "Işıklı Göl Durağı", "Adem Bilhan Uysal İlkokulu", "Akçay Cd.", "Sapanca Gölü Cd.", "Yıldız Camii", "Manyas Gölü Cd.", "Park Eymir Ticaret Merkezi", "Belmek", "Köyceğiz Gölü Cd.", "Eğirdir Gölü Cd.", "Gediz Sk.", "Safa Okulları", "Seymenler", "Şehit Oğuz Kaan Usta", "936.Sk.", "Mevlana Parkı", "Gölbaşı Kaymakamlık", "Diş Hastanesi", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Milli İrade Öğrenci Yurdu", "35.Cd.", "Başkent Sitesi", "Yunus Emre Camii", "Yeşil Dostlar Sitesi"
    ],
  },
  {
    no: "195-3",
    ad: "Gölbaşı TOKİ - Milli Kütüphane",
    kalkis: "Bahçelievler Mh.",
    varis: "Nasuh Akar Mh.",
    mesafeKm: 30,
    sureDk: 80,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["06:10", "06:24", "06:38", "06:45", "06:52", "07:06", "07:13", "07:20", "07:34", "07:41", "07:55", "08:02", "08:25", "08:40", "09:20", "09:40", "10:20", "10:40", "11:20", "11:50", "12:05", "12:35", "12:50", "13:20", "13:35", "14:05", "14:20", "14:50", "15:02", "15:27", "15:40", "15:53", "16:20", "16:35", "16:50", "17:20", "17:40", "18:30", "19:00", "20:00", "20:30", "21:30"],
      cumartesi: ["06:10", "06:25", "06:55", "07:10", "07:40", "07:55", "08:25", "08:40", "09:20", "09:40", "10:20", "10:40", "11:15", "11:30", "12:00", "12:15", "12:45", "13:00", "13:30", "13:45", "14:15", "14:30", "15:00", "15:15", "15:45", "16:00", "16:30", "16:45", "17:20", "17:40", "18:30", "19:00", "20:00", "20:30", "21:30"],
      pazar: ["06:10", "06:25", "06:55", "07:10", "07:40", "07:55", "08:25", "08:40", "09:20", "09:40", "10:20", "10:40", "11:15", "11:30", "12:00", "12:15", "12:45", "13:00", "13:30", "13:45", "14:15", "14:30", "15:00", "15:15", "15:45", "16:00", "16:30", "16:45", "17:20", "17:40", "18:30", "19:00", "20:00", "20:30", "21:30"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Kaymakamlık", "Mevlana Parkı", "936.Sk.", "Şehit Oğuz Kaan Usta", "Seymenler", "Şehir Parkı", "İmam Hatip Lisesi", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "Kreş Durağı", "Eymir Yurdu", "Erdem Beyazıt Anadolu Lisesi", "Tuz Gölü Cd.", "Gediz Sk.", "Eğirdir Gölü Cd.", "Köyceğiz Gölü Cd.", "Belmek", "Park Eymir Ticaret Merkezi", "Manyas Gölü Cd.", "Yıldız Camii", "Sapanca Gölü Cd.", "Akçay Cd.", "Adem Bilhan Uysal İlkokulu", "Işıklı Göl Durağı", "Yedigöller Cd.", "Şht.sebahattin Koçak Anadolu İmam Hatip Lise", "Hilal Camii", "Safa Okulları", "Kaymak Sitesi", "Eymir Ve Şafak Mahallesi Muhtarlığı", "Cemil Yıldırım Orta Okulu", "Cumhuriyet Spor Salonu", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Dikmen Kavşağı", "Çeşme", "Akpınar", "Turhan Dökmeci İlköğretim Okulu", "Akpınar Mahallesi", "Gökkuşağı Mahallesi", "Koşuyolu Parkı", "Fen Lisesi", "Taurus Avm", "Balgat Köprüsü", "Yurtdışı Türkler Başkanlığı", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Ufuk Üniversitesi", "Sayıştay", "Milli Kütüphane"
    ],
  },
  {
    no: "195-4",
    ad: "Milli Kütüphane - Gölbaşı TOKİ",
    kalkis: "Emek Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 31,
    sureDk: 90,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["07:10", "07:25", "07:40", "08:10", "08:40", "09:10", "09:40", "10:10", "10:40", "11:10", "11:40", "12:10", "12:40", "13:10", "13:40", "14:00", "14:20", "14:40", "15:00", "15:20", "15:40", "15:55", "16:10", "16:25", "16:40", "16:55", "17:10", "17:22", "17:34", "17:46", "17:58", "18:10", "18:22", "18:34", "18:46", "18:58", "19:10", "19:25", "19:40", "19:55", "20:10", "20:25", "20:40", "20:55", "21:10", "21:25", "21:40", "22:00", "22:20", "22:40", "23:00"],
      cumartesi: ["07:15", "07:40", "08:05", "08:30", "08:55", "09:20", "09:45", "10:10", "10:35", "11:05", "11:35", "12:05", "12:35", "13:00", "13:20", "13:40", "14:00", "14:20", "14:40", "15:00", "15:20", "15:40", "16:00", "16:20", "16:40", "16:55", "17:10", "17:25", "17:40", "17:55", "18:10", "18:25", "18:40", "18:55", "19:10", "19:25", "19:40", "19:55", "20:10", "20:25", "20:40", "20:55", "21:10", "21:25", "21:40", "22:00", "22:20", "22:40", "23:00"],
      pazar: ["07:15", "07:40", "08:05", "08:30", "08:55", "09:20", "09:45", "10:10", "10:35", "11:05", "11:35", "12:05", "12:35", "13:00", "13:20", "13:40", "14:00", "14:20", "14:40", "15:00", "15:20", "15:40", "16:00", "16:20", "16:40", "16:55", "17:10", "17:25", "17:40", "17:55", "18:10", "18:25", "18:40", "19:00", "19:20", "19:40", "20:00", "20:20", "20:40", "21:00", "21:20", "21:40", "22:00", "22:20", "22:40", "23:00"],
    },
    duraklar: [
      "Milli Kütüphane", "Kültür Ve Turizm Bakanlığı", "Hazine Ve Maliye Bakanlığı", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Avm Durağı", "Sanayi Sitesi", "Haymana Yolu", "Yunus Emre Parkı", "Cumhuriyet Spor Salonu", "Cemil Yıldırım Orta Okulu", "Tek Camii", "Kaymak Sitesi", "Şehir Parkı", "İmam Hatip Lisesi", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "Kreş Durağı", "Eymir Yurdu", "Erdem Beyazıt Anadolu Lisesi", "Tuz Gölü Cd.", "Hilal Cami", "Şht.sebahattin Koçak Anadolu İmam Hatip Lise", "Yedigöller Cd.", "Işıklı Göl Durağı", "Adem Bilhan Uysal İlkokulu", "Akçay Cd.", "Sapanca Gölü Cd.", "Yıldız Camii", "Manyas Gölü Cd.", "Park Eymir Ticaret Merkezi", "Belmek", "Köyceğiz Gölü Cd.", "Eğirdir Gölü Cd.", "Gediz Sk.", "Safa Okulları", "Seymenler", "Şehit Oğuz Kaan Usta", "936.Sk.", "Mevlana Parkı", "Gölbaşı Kaymakamlık", "Diş Hastanesi", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Milli İrade Öğrenci Yurdu", "35.Cd.", "Başkent Sitesi", "Yunus Emre Camii", "Yeşil Dostlar Sitesi"
    ],
  },
  {
    no: "198-1",
    ad: "Gölbaşı - Haymana Yolu - Ulus",
    kalkis: "Bahçelievler Mh.",
    varis: "Doğanbey Mh.",
    mesafeKm: 64,
    sureDk: 140,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["17:00"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Baldudak İlkokulu", "Cemre Parkı", "774 Sk.", "Güzel Yalı Evleri", "Gölkonakları", "Mogan Park", "Patalya Hotel", "Güney Sitesi", "Yıldırım Cd.", "Karçiçeği Sitesi", "Şiringölköy Sitesi", "Fizikçiler Sitesi", "Çeviker Konakları", "Eskidostlar Sitesi", "Yeşil Site", "Cemil Özgür Villaları", "Enda Konutları", "Çevre Ve Orman Bakanlığı Labaratuvarı", "Aquapark", "Hacılar Kavşağı", "Hacılar Blv.", "Gökkuşağı Sitesi Kavşağı", "Gökkuşağı Sitesi", "Üçhisar Sitesi", "Hacılar Yolu", "Andost Sitesi", "Doğakent Sitesi", "Aydos Sitesi", "1362.Sk. 1.Durak", "1362.Sk. 2.Durak", "Hacılar Köyü Camii", "Hacılar Köyü İlköğretim Okulu", "Hacılar Blv. 1.Durak", "Hacılar Blv. 2.Durak", "Merkezkent Sitesi", "1482.Cd.", "Martıköy Sitesi", "Kuğu Köy Villaları", "Elit Sitesi", "Çocuk Parkı", "At Çiftliği", "Has Villaları", "1629.Cd.", "Bahçekent", "Kardelen Evleri", "Balıkpınar Kavşağı", "Hacı Hasan Köyü", "Hacı Hasan Cami", "Hacıhasan Kavşağı", "Hacı Hasan Kavşağı", "Gölbaşı Haymana Yolu", "Haymana Yolu", "Demka Tel Örgü", "Sayıştay Eğitim Merkezi", "Patalya Otel", "Mogan Parkı", "Darüşşifa", "Meslek Lisesi", "Yunus Emre Parkı", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Dikmen Kavşağı", "Çeşme", "Akpınar", "Turhan Dökmeci İlköğretim Okulu", "Akpınar Mahallesi", "Gökkuşağı Mahallesi", "Koşuyolu Parkı", "Fen Lisesi", "Taurus Avm", "Balgat Köprüsü", "Yurtdışı Türkler Başkanlığı", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Ufuk Üniversitesi", "AŞTİ", "Bahçelievler", "Gazi Hastanesi", "Diş Hekimliği Fakültesi", "Etiler Ordu Evi", "Emniyet Sarayı", "Çevikkuvvet", "Atatürk Kültür Merkezi", "19 Mayıs Stadyumu"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "198-2",
    ad: "Gölbaşı - Haymana Yolu - Ulus",
    kalkis: "Doğanbey Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 65,
    sureDk: 120,
    kategori: "sehir-merkezi",
    saatler: {
      haftaici: ["08:00"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "İlk Meclis Durağı", "Ulus Ziraat Bankası", "Otel Durağı", "Tesviyeciler Durağı", "Çevik Kuvvet", "Emniyet Sarayı", "Etiler Ordu Evi", "Diş Hekimliği Fakültesi", "Gazi Hastanesi", "Zübeyde Hanım Yurt Müdürlüğü", "Emek", "AŞTİ", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Avm Durağı", "Sanayi Sitesi", "Haymana Yolu", "Cemre Parkı", "774 Sk.", "Güzel Yalı Evleri", "Gölkonakları", "Mogan Park", "Patalya Hotel", "Güney Sitesi", "Yıldırım Cd.", "Karçiçeği Sitesi", "Şiringölköy Sitesi", "Fizikçiler Sitesi", "Çeviker Konakları", "Eskidostlar Sitesi", "Yeşil Site", "Cemil Özgür Villaları", "Enda Konutları", "Çevre Ve Orman Bakanlığı Labaratuvarı", "Aquapark", "Hacılar Kavşağı", "Hacılar Blv.", "Gökkuşağı Sitesi Kavşağı", "Gökkuşağı Sitesi", "Üçhisar Sitesi", "Hacılar Yolu", "Andost Sitesi", "Doğakent Sitesi", "Aydos Sitesi", "1362.Sk. 1.Durak", "1362.Sk. 2.Durak", "Hacılar Köyü Camii", "Hacılar Köyü İlköğretim Okulu", "Hacılar Blv. 1.Durak", "Hacılar Blv. 2.Durak", "Merkezkent Sitesi", "Martıköy Sitesi", "Kuğu Köy Villaları", "Elit Sitesi", "Çocuk Parkı", "At Çiftliği", "Has Villaları", "1629.Cd.", "Bahçekent", "Kardelen Evleri", "Balıkpınar Kavşağı", "Hacı Hasan Köyü", "Hacı Hasan Cami", "Hacıhasan Kavşağı", "Hacı Hasan Kavşağı", "Gölbaşı Haymana Yolu", "Demka Tel Örgü", "Sayıştay Eğitim Merkezi", "Patalya Otel", "Mogan Parkı", "Baldudak İlkokulu", "Jandarma", "Gölbaşı Belediyesi", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Milli İrade Öğrenci Yurdu", "35.Cd.", "Başkent Sitesi", "Yunus Emre Camii", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "104-1",
    ad: "Gölbaşı - Akköprü",
    kalkis: "Bahçelievler Mh.",
    varis: "Gazi Mh.",
    mesafeKm: 28,
    sureDk: 45,
    kategori: "akkopru-asti",
    saatler: {
      haftaici: ["06:14", "06:26", "06:38", "06:50", "07:02", "07:14", "07:26", "07:38", "07:50", "08:15", "08:45", "09:15", "09:45", "10:15", "10:45", "11:15", "11:45", "12:15", "12:45", "13:15", "13:45", "14:15", "14:45", "15:12", "15:36", "16:00", "16:24", "16:48", "17:12", "17:48", "18:15", "18:45"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Kaymakamlık", "288 Sk.", "Mevlana Camii", "Bahçeli Park", "Şehit Meriç Alemdar Ortaokulu", "Saray Evleri Durağı", "Örencik Mahallesi", "Yağmur Evler Sitesi", "Trafo Durağı", "Anaokulu", "İbrahim Sıtkı Göçmen Parkı", "Öğretmenler Sitesi", "Seğmenler Mahallesi Muhtarlığı", "Seğmenler Sağlık Merkezi", "936.Sk.", "Mevlana Parkı", "279.Cd.", "Ankara Cd.", "Fatma Ercan Cami", "Üst Geçit", "Gölbaşı Stadyumu", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Dikmen Kavşağı", "Çeşme", "Akpınar", "Turhan Dökmeci İlköğretim Okulu", "Akpınar Mahallesi", "Gökkuşağı Mahallesi", "Koşuyolu Parkı", "Fen Lisesi", "Taurus Avm", "Balgat Köprüsü", "Yurtdışı Türkler Başkanlığı", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Ufuk Üniversitesi", "AŞTİ", "Bahçelievler", "Gazi Hastanesi", "Diş Hekimliği Fakültesi", "Etiler Ordu Evi", "Emniyet Sarayı", "Akköprü"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "104-2",
    ad: "Akköprü - Gölbaşı",
    kalkis: "Gazi Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 30,
    sureDk: 60,
    kategori: "akkopru-asti",
    saatler: {
      haftaici: ["07:00", "07:30", "08:00", "08:30", "08:56", "09:31", "10:10", "10:45", "11:05", "11:25", "11:45", "12:05", "12:25", "12:45", "13:05", "13:25", "13:45", "14:05", "14:25", "14:45", "15:05", "15:25", "15:45", "16:00", "16:15", "16:30", "16:45", "17:00", "17:30", "18:00", "18:30", "18:45", "19:00", "19:20", "19:40", "20:00"],
      cumartesi: ["07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
      pazar: ["07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
    },
    duraklar: [
      "Akköprü", "Etiler Ordu Evi", "Diş Hekimliği Fakültesi", "Gazi Hastanesi", "Zübeyde Hanım Yurt Müdürlüğü", "Emek", "AŞTİ", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Avm Durağı", "Sanayi Sitesi", "Şelale Parkı", "407.Sk.", "Şehit Gaffar Okkan", "Osmanlı Parkı", "Jandarma", "Gölbaşı Belediyesi", "Gölbaşı Kaymakamlık", "Mevlana Parkı", "936.Sk.", "Seğmenler Sağlık Merkezi", "Seğmenler Mahallesi Muhtarlığı", "Öğretmenler Sitesi", "İbrahim Sıtkı Göçmen Parkı", "Anaokulu", "Trafo Durağı", "Yağmur Evler Sitesi", "Örencik Mahallesi", "Saray Evleri Durağı", "Şehit Meriç Alemdar Ortaokulu", "Bahçeli Park", "Mevlana Camii", "288 Sk.", "Sevgi Çiçeği İlköğretim Okulu", "Diş Hastanesi", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Yurtlar", "Spor Bilimleri Fakültesi", "Kurum Belge Arşivi", "Yabancı Diller", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Milli İrade Öğrenci Yurdu", "35.Cd.", "Başkent Sitesi", "Yunus Emre Camii", "Yeşil Dostlar Sitesi"
    ],
  },
  {
    no: "114",
    ad: "Gölbaşı Yurtlar - AŞTİ - Akköprü",
    kalkis: "Bahçelievler Mh.",
    varis: "Gazi Mh.",
    mesafeKm: 23,
    sureDk: 40,
    kategori: "akkopru-asti",
    saatler: {
      haftaici: ["06:20", "06:40", "07:00", "07:20", "07:40", "08:00", "08:24", "08:36", "09:00", "09:30"],
      cumartesi: ["06:40", "07:10", "07:40", "08:10", "08:40", "09:10", "09:40", "10:10", "10:40", "11:10", "11:40", "12:10", "12:40", "13:10", "13:40", "14:10", "14:40", "15:00", "15:20", "15:40", "16:00", "16:20", "16:40", "17:00", "17:20", "17:40", "18:00", "18:20", "18:40", "19:00"],
      pazar: ["06:40", "07:10", "07:40", "08:10", "08:40", "09:10", "09:40", "10:10", "10:40", "11:10", "11:40", "12:10", "12:40", "13:10", "13:40", "14:10", "14:40", "15:00", "15:20", "15:40", "16:00", "16:20", "16:40", "17:00", "17:20", "17:40", "18:20", "19:00"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Osmanlı Parkı", "Üniversiteliler Sk.", "Gölbaşı Mesleki Ve Teknik Anadolu Lisesi", "Yunus Emre Parkı", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Dikmen Kavşağı", "Çeşme", "Akpınar", "Turhan Dökmeci İlköğretim Okulu", "Akpınar Mahallesi", "Gökkuşağı Mahallesi", "Koşuyolu Parkı", "Fen Lisesi", "Taurus Avm", "Balgat Köprüsü", "Yurtdışı Türkler Başkanlığı", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Ufuk Üniversitesi", "AŞTİ", "Bahçelievler", "Gazi Hastanesi", "Diş Hekimliği Fakültesi", "Etiler Ordu Evi", "Emniyet Sarayı", "Akköprü"
    ],
  },
  {
    no: "114-1",
    ad: "Gölbaşı - Kampüs - Yurtlar - AŞTİ - Akköprü",
    kalkis: "Bahçelievler Mh.",
    varis: "Gazi Mh.",
    mesafeKm: 25,
    sureDk: 45,
    kategori: "akkopru-asti",
    saatler: {
      haftaici: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:20", "13:50", "14:10", "14:30", "14:50", "15:10", "15:30", "15:50", "16:08", "16:24", "16:32", "16:48", "17:04", "17:30", "17:50", "18:10", "18:30"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Yabancı Diller", "Kurum Belge Arşivi", "Spor Bilimleri Fakültesi", "Yurtlar", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Osmanlı Parkı", "Üniversiteliler Sk.", "Gölbaşı Mesleki Ve Teknik Anadolu Lisesi", "Yunus Emre Parkı", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Dikmen Kavşağı", "Çeşme", "Akpınar", "Turhan Dökmeci İlköğretim Okulu", "Akpınar Mahallesi", "Gökkuşağı Mahallesi", "Koşuyolu Parkı", "Fen Lisesi", "Taurus Avm", "Balgat Köprüsü", "Yurtdışı Türkler Başkanlığı", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Ufuk Üniversitesi", "AŞTİ", "Bahçelievler", "Gazi Hastanesi", "Diş Hekimliği Fakültesi", "Etiler Ordu Evi", "Emniyet Sarayı", "Akköprü"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "114-2",
    ad: "Akköprü - AŞTİ - Gölbaşı - Kampüs - Yurtlar",
    kalkis: "Gazi Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 25,
    sureDk: 45,
    kategori: "akkopru-asti",
    saatler: {
      haftaici: ["07:10", "07:20", "07:40", "07:50", "08:06", "08:12", "08:18", "08:24", "08:36", "08:42", "08:49", "09:03", "09:10", "09:17", "09:24", "09:40", "09:55", "10:25", "17:15", "17:45", "18:15"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Akköprü", "Etiler Ordu Evi", "Diş Hekimliği Fakültesi", "Gazi Hastanesi", "Zübeyde Hanım Yurt Müdürlüğü", "Emek", "AŞTİ", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Avm Durağı", "Sanayi Sitesi", "Şelale Parkı", "407.Sk.", "Şehit Gaffar Okkan", "Osmanlı Parkı", "Jandarma", "Gölbaşı Belediyesi", "Diş Hastanesi", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Yurtlar", "Spor Bilimleri Fakültesi", "Kurum Belge Arşivi", "Yabancı Diller", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Milli İrade Öğrenci Yurdu", "35.Cd.", "Başkent Sitesi", "Yunus Emre Camii", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "165-1",
    ad: "Gölbaşı TOKİ - Akköprü",
    kalkis: "Bahçelievler Mh.",
    varis: "Gazi Mh.",
    mesafeKm: 34,
    sureDk: 75,
    kategori: "akkopru-asti",
    saatler: {
      haftaici: ["06:35", "06:50", "07:05", "07:20", "07:35"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Kaymakamlık", "Mevlana Parkı", "936.Sk.", "Şehit Oğuz Kaan Usta", "Seymenler", "Şehir Parkı", "İmam Hatip Lisesi", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "Kreş Durağı", "Eymir Yurdu", "Erdem Beyazıt Anadolu Lisesi", "Tuz Gölü Cd.", "Gediz Sk.", "Eğirdir Gölü Cd.", "Köyceğiz Gölü Cd.", "Belmek", "Park Eymir Ticaret Merkezi", "Manyas Gölü Cd.", "Yıldız Camii", "Sapanca Gölü Cd.", "Akçay Cd.", "Adem Bilhan Uysal İlkokulu", "Işıklı Göl Durağı", "Yedigöller Cd.", "Şht.sebahattin Koçak Anadolu İmam Hatip Lise", "Hilal Camii", "Safa Okulları", "Kaymak Sitesi", "Eymir Ve Şafak Mahallesi Muhtarlığı", "Cemil Yıldırım Orta Okulu", "Cumhuriyet Spor Salonu", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Dikmen Kavşağı", "Çeşme", "Akpınar", "Turhan Dökmeci İlköğretim Okulu", "Akpınar Mahallesi", "Gökkuşağı Mahallesi", "Koşuyolu Parkı", "Fen Lisesi", "Taurus Avm", "Balgat Köprüsü", "Yurtdışı Türkler Başkanlığı", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Ufuk Üniversitesi", "AŞTİ", "Bahçelievler", "Gazi Hastanesi", "Diş Hekimliği Fakültesi", "Etiler Ordu Evi", "Emniyet Sarayı", "Akköprü"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "165-2",
    ad: "Akköprü - Gölbaşı TOKİ",
    kalkis: "Gazi Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 34,
    sureDk: 75,
    kategori: "akkopru-asti",
    saatler: {
      haftaici: ["17:35", "18:05", "18:35", "19:05"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Akköprü", "Etiler Ordu Evi", "Diş Hekimliği Fakültesi", "Gazi Hastanesi", "Zübeyde Hanım Yurt Müdürlüğü", "Emek", "AŞTİ", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Avm Durağı", "Sanayi Sitesi", "Haymana Yolu", "Yunus Emre Parkı", "Cumhuriyet Spor Salonu", "Cemil Yıldırım Orta Okulu", "Tek Camii", "Kaymak Sitesi", "Şehir Parkı", "İmam Hatip Lisesi", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "Kreş Durağı", "Eymir Yurdu", "Erdem Beyazıt Anadolu Lisesi", "Tuz Gölü Cd.", "Hilal Cami", "Şht.sebahattin Koçak Anadolu İmam Hatip Lise", "Yedigöller Cd.", "Işıklı Göl Durağı", "Adem Bilhan Uysal İlkokulu", "Akçay Cd.", "Sapanca Gölü Cd.", "Yıldız Camii", "Manyas Gölü Cd.", "Park Eymir Ticaret Merkezi", "Belmek", "Köyceğiz Gölü Cd.", "Eğirdir Gölü Cd.", "Gediz Sk.", "Safa Okulları", "Seymenler", "Şehit Oğuz Kaan Usta", "936.Sk.", "Mevlana Parkı", "Gölbaşı Kaymakamlık", "Diş Hastanesi", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Milli İrade Öğrenci Yurdu", "35.Cd.", "Başkent Sitesi", "Yunus Emre Camii", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "109-1",
    ad: "Gölbaşı - Çankaya",
    kalkis: "Bahçelievler Mh.",
    varis: "Sancak Mh.",
    mesafeKm: 27,
    sureDk: 60,
    kategori: "incek-cankaya",
    saatler: {
      haftaici: ["06:45", "07:55", "11:15", "12:50", "16:05", "17:05", "18:05"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Özgür Sitesi", "71.Cd.", "Rüyakent Sitesi", "27.Sk.", "Umut Park", "Serkent Sitesi", "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Kaymakamlık", "288 Sk.", "Mevlana Camii", "Bahçeli Park", "Şehit Meriç Alemdar Ortaokulu", "Saray Evleri Durağı", "Örencik Mahallesi", "Yağmur Evler Sitesi", "Trafo Durağı", "Anaokulu", "İbrahim Sıtkı Göçmen Parkı", "Öğretmenler Sitesi", "Seğmenler Mahallesi Muhtarlığı", "Seğmenler Sağlık Merkezi", "936.Sk.", "Mevlana Parkı", "279.Cd.", "Ankara Cd.", "Fatma Ercan Cami", "Üst Geçit", "Gölbaşı Stadyumu", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Kuzu Effect Avm", "TRT", "MSB Lojmanları", "Sinpaş", "Mng Sitesi", "Tapu Kadastro", "Yıldızevler Polis Merkezi", "İlkbahar Mahallesi", "Korman Sitesi", "Turan Güneş Blv.", "Nurçin Sayan İlkokulu", "Başkent Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır",
  },
  {
    no: "109-2",
    ad: "Çankaya - Gölbaşı",
    kalkis: "Yıldızevler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 29,
    sureDk: 60,
    kategori: "incek-cankaya",
    saatler: {
      haftaici: ["07:35", "08:55", "12:10", "13:40", "17:15", "18:15", "19:15"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Başkent Sitesi", "Nurçin Sayan İlkokulu", "Turan Güneş Blv.", "Korman Sitesi", "Hilal Mahallesi", "Tepebaşı Camii", "Tapu Kadastro", "Ankara Müzik Ve Güzel Sanatlar Üniversitesi", "Mng Sitesi", "Sinpaş", "MSB Lojmanları", "TRT", "Park Oran Konutları", "Kuzu Effect Avm", "İncek Kavşağı", "Avm Durağı", "Sanayi Sitesi", "Şelale Parkı", "407.Sk.", "Şehit Gaffar Okkan", "Osmanlı Parkı", "Jandarma", "Gölbaşı Belediyesi", "Gölbaşı Kaymakamlık", "Mevlana Parkı", "936.Sk.", "Seğmenler Sağlık Merkezi", "Seğmenler Mahallesi Muhtarlığı", "Öğretmenler Sitesi", "İbrahim Sıtkı Göçmen Parkı", "Anaokulu", "Trafo Durağı", "Yağmur Evler Sitesi", "Örencik Mahallesi", "Saray Evleri Durağı", "Şehit Meriç Alemdar Ortaokulu", "Bahçeli Park", "Mevlana Camii", "288 Sk.", "Sevgi Çiçeği İlköğretim Okulu", "Diş Hastanesi", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Milli İrade Öğrenci Yurdu", "35.Cd.", "Yunus Emre Camii", "Yeşil Dostlar Sitesi", "Özgür Sitesi", "71.Cd.", "Rüyakent Sitesi", "27.Sk.", "Umut Park", "Serkent Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır, Ankara müzik ve güzel sanatlar ünv.gider",
  },
  {
    no: "191",
    ad: "Opera - Taşpınar Mahallesi",
    kalkis: "Doğanbey Mh.",
    varis: "Anafartalar Mh.",
    mesafeKm: 96,
    sureDk: 105,
    kategori: "incek-cankaya",
    saatler: {
      haftaici: ["06:30", "06:42", "07:10", "07:26", "08:01", "09:00", "10:00", "11:05", "12:45", "14:20", "15:30", "16:50", "17:50", "19:05"],
      cumartesi: ["06:47", "07:19", "07:59", "09:00", "10:00", "11:05", "12:45", "14:20", "15:20", "16:45", "17:45", "19:05"],
      pazar: ["06:50", "07:17", "08:02", "09:00", "10:00", "11:05", "12:40", "14:20", "15:20", "16:40", "17:45", "19:05"],
    },
    duraklar: [
      "Opera", "Sıhhiye", "Kızılay", "Milli Eğitim Bakanlığı", "Karayolları Genel Müdürlüğü", "Milli Kütüphane", "Kültür Ve Turizm Bakanlığı", "Hazine Ve Maliye Bakanlığı", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Anayasa Mahkemesi", "Adalet Akademisi", "Rasathane", "Ted Koleji", "Park Hayat Sitesi", "Tim Tower", "Nata İncek", "Nevaport", "Ada İncek", "İkra", "Papatya Sitesi", "Çiçekkent Sitesi", "Otan Sitesi", "Turkent Yapı Kooperatif", "Gölsite Kooperatifi", "Uptown Konutları", "Ted Koleji Kavşağı", "2855 Cd.", "2893 Cd.", "2897.Sk.", "2898 Cd.", "2909.Cd.", "Ayşe Yakup Eskitoros İlkokulu", "2925.Cd.", "Gökkuşağı Sitesi", "Altıngül Sitesi", "Kirazlı Sitesi", "Atakent Sitesi", "Aydınlar Sitesi", "Kızılcaşar Mahallesi", "Ahlatlıbel", "1844.Cd.", "Muhtarlık", "Yavuz Sultan Selim Blv.", "Duru Beytepe", "Beytepe Murat Erdi Eker Devlet Hastenesi", "Poliklinikler", "Acil Servis", "1746.Sk.", "Dörtevler", "Güneyce Camii", "Güneyce Sitesi", "Lösante Hastanesi", "2709.Sk.", "2696.Sk.", "Zafer Cd.", "Fransız Okulu", "İncek Polis Merkezi", "Atılım Üniversitesi", "Kızılcaşar", "Ankaville", "Yeşil Bahçe", "Koşuyolu Parkı", "Yurtdışı Türkler Başkanlığı", "Ufuk Üniversitesi", "Sayıştay", "Kara Kuvvetleri Komutanlığı", "Güvenpark"
    ],
    notlar: "Uç servis m.erdi eker hastaneden başlar",
  },
  {
    no: "192",
    ad: "Opera - Tulumtaş Mahallesi",
    kalkis: "Doğanbey Mh.",
    varis: "Anafartalar Mh.",
    mesafeKm: 103,
    sureDk: 115,
    kategori: "incek-cankaya",
    saatler: {
      haftaici: ["06:45", "07:12", "07:40", "07:54", "08:22", "09:30", "11:00", "14:00", "15:20", "18:10", "19:15"],
      cumartesi: ["06:31", "07:27", "07:51", "08:23", "09:20", "11:00", "14:00", "15:00", "17:15", "18:10", "19:15"],
      pazar: ["06:32", "07:26", "07:53", "08:20", "09:20", "11:00", "14:00", "15:00", "17:15", "18:10", "19:15"],
    },
    duraklar: [
      "Opera", "Sıhhiye", "Kızılay", "Milli Eğitim Bakanlığı", "Karayolları Genel Müdürlüğü", "Milli Kütüphane", "Kültür Ve Turizm Bakanlığı", "Hazine Ve Maliye Bakanlığı", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Anayasa Mahkemesi", "Adalet Akademisi", "Rasathane", "Ted Koleji Kavşağı", "Taşpınar", "Jandarma Okullar Komutanlığı", "2886.Cd.", "Ahlatlıbel", "Aydınlar Sitesi", "Yavuz Sultan Selim Blv.", "Duru Beytepe", "Beytepe Murat Erdi Eker Devlet Hastenesi", "Poliklinikler", "Acil Servis", "Rıdvan Ege Kampüsü", "İncek Polis Merkezi", "Atılım Üniversitesi", "Park 29 Sitesi", "Bağlar Cd.", "İncekköy Sitesi", "Zafer Cd.", "Sinpaş Konutları", "3648.Cd.", "İncek TOKİ Cami", "Sosyal Tesisler", "İyimaya Sk.", "Susam Sk.", "Sağlık Ocağı", "İncek", "İncek Arena", "Türkan Şoray Cd.", "Kara Mehmetoğlu Sk. 2", "Milli İrade Kız Anadolu İmam Hatip Lisesi", "Kara Mehmetoğlu Sk. 1", "İncek Mezarlığı", "Bahar Konakları", "Ataevler Sitesi", "Görgülü Sk.", "İncek Göl Kuleleri", "Çevik Sk.", "Evrensel Sk.", "Turgut Özal Blv.", "Kargen Sitesi", "İngöl Durağı", "Büyükşehir Misafirhanesi", "Koşu Yolu", "Tulumtaş", "Tulumtaş Mahallesi", "Ihlamur Sitesi", "Parlementerler Sitesi", "LÖSEV", "Kargen Konutları", "Cevregül Parlement Sitesi", "Karadal Sk.", "İncek TOKİ Camii", "Kızılcaşar Mahallesi", "Atakent Sitesi", "Kolej", "2898 Cd.", "Akpınar", "Koşuyolu Parkı", "Yurtdışı Türkler Başkanlığı", "Ufuk Üniversitesi", "Sayıştay", "Kara Kuvvetleri Komutanlığı", "Güvenpark"
    ],
    notlar: "Parlementerler sit.başlar incektoki leregitmez)",
  },
  {
    no: "192-1",
    ad: "Opera - Kızılay - Tulumtaş - Ballıkpınar Mahallesi",
    kalkis: "Doğanbey Mh.",
    varis: "Anafartalar Mh.",
    mesafeKm: 102,
    sureDk: 125,
    kategori: "incek-cankaya",
    saatler: {
      haftaici: ["06:30", "07:00", "08:50", "12:00", "13:00", "16:00", "17:20"],
      cumartesi: ["06:55", "12:00", "16:00"],
      pazar: ["06:59", "12:00", "16:00"],
    },
    duraklar: [
      "Opera", "Sıhhiye", "Kızılay", "Milli Eğitim Bakanlığı", "Karayolları Genel Müdürlüğü", "Milli Kütüphane", "Kültür Ve Turizm Bakanlığı", "Hazine Ve Maliye Bakanlığı", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Anayasa Mahkemesi", "Adalet Akademisi", "Rasathane", "Ted Koleji Kavşağı", "Taşpınar", "Jandarma Okullar Komutanlığı", "2886.Cd.", "Ahlatlıbel", "Aydınlar Sitesi", "Rıdvan Ege Kampüsü", "İncek Polis Merkezi", "Atılım Üniversitesi", "Park 29 Sitesi", "Bağlar Cd.", "İncekköy Sitesi", "Zafer Cd.", "Sinpaş Konutları", "İncek Yolu Durağı", "İncek TOKİ Konutları", "İyimaya Sk.", "Susam Sk.", "Sağlık Ocağı", "İncek", "İncek Mezarlığı", "Bahar Konakları", "Ataevler Sitesi", "Görgülü Sk.", "Çevik Sk.", "Evrensel Sk.", "Turgut Özal Blv.", "Kargen Sitesi", "Elit Sitesi", "Ladin Sitesi", "Kargen Konutları", "İngöl Durağı", "Büyükşehir Misafirhanesi", "Koşu Yolu", "Tulumtaş", "Tulumtaş Mahallesi", "Ihlamur Sitesi", "Parlementerler Sitesi", "Ali Baba Cd.", "Veli Dede Bahçesi", "Eğitim Teknolojileri Genel Müdürlüğü", "Su Deposu", "Ballıkpınar Cami", "Çocuk Parkı", "Şevketzade Konağı", "Küme Evleri", "LÖSEV", "2471.Sk.", "Taş Ev", "Parlement Sitesi", "Zümrüttepe Evleri", "Sonbaşak Sitesi", "Cevregül Parlement Sitesi", "Karadal Sk.", "Kızılcaşar Mahallesi", "Atakent Sitesi", "Kolej", "2898 Cd.", "Akpınar", "Koşuyolu Parkı", "Yurtdışı Türkler Başkanlığı", "Ufuk Üniversitesi", "Sayıştay", "Kara Kuvvetleri Komutanlığı", "Güvenpark"
    ],
    notlar: "M.id.kız and.i.h.lis.girer(göl kulelerine gider)",
  },
  {
    no: "193",
    ad: "Opera - Kızılay - İncek TOKİ",
    kalkis: "Doğanbey Mh.",
    varis: "Anafartalar Mh.",
    mesafeKm: 67,
    sureDk: 135,
    kategori: "incek-cankaya",
    saatler: {
      haftaici: ["06:10", "06:23", "06:30", "06:36", "06:45", "06:54", "07:06", "07:19", "07:33", "07:47", "08:08", "08:15", "08:29", "08:43", "09:10", "09:25", "09:40", "09:55", "10:10", "10:25", "10:40", "10:55", "11:10", "11:25", "11:40", "11:55", "12:10", "12:25", "12:40", "12:55", "13:10", "13:25", "13:40", "13:55", "14:10", "14:25", "14:40", "14:55", "15:10", "15:25", "15:37", "15:50", "16:03", "16:15", "16:27", "16:40", "16:55", "17:15", "17:40", "18:00", "18:20", "18:40", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"],
      cumartesi: ["06:23", "06:39", "06:45", "07:03", "07:11", "07:35", "07:43", "08:07", "08:15", "08:30", "08:50", "09:10", "09:30", "09:50", "10:10", "10:30", "10:50", "11:10", "11:25", "11:40", "11:55", "12:10", "12:25", "12:40", "12:55", "13:10", "13:25", "13:40", "13:55", "14:10", "14:25", "14:40", "14:55", "15:10", "15:25", "15:40", "15:55", "16:10", "16:25", "16:40", "16:55", "17:10", "17:25", "17:40", "18:00", "18:20", "18:40", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"],
      pazar: ["06:23", "06:41", "06:45", "07:08", "07:35", "07:44", "08:11", "08:30", "08:50", "09:10", "09:30", "09:50", "10:10", "10:30", "10:50", "11:10", "11:30", "11:50", "12:10", "12:30", "12:50", "13:10", "13:30", "13:50", "14:10", "14:30", "14:50", "15:10", "15:30", "15:50", "16:10", "16:30", "16:50", "17:10", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"],
    },
    duraklar: [
      "Opera", "Sıhhiye", "Kızılay", "Milli Eğitim Bakanlığı", "Karayolları Genel Müdürlüğü", "Milli Kütüphane", "Kültür Ve Turizm Bakanlığı", "Hazine Ve Maliye Bakanlığı", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Anayasa Mahkemesi", "Adalet Akademisi", "Rasathane", "Ted Koleji Kavşağı", "Taşpınar", "Jandarma Okullar Komutanlığı", "2886.Cd.", "Ahlatlıbel", "Aydınlar Sitesi", "Rıdvan Ege Kampüsü", "İncek Polis Merkezi", "Atılım Üniversitesi", "Park 29 Sitesi", "Bağlar Cd.", "İncekköy Sitesi", "Zafer Cd.", "Sinpaş Konutları", "1.Nizamiye", "2.Nizamiye", "İncek Prestij", "3.Nizamiye", "3346 Cd.", "Atabilge Aka Konutları", "Park Platin Konakları", "Can Atabilge Sitesi", "4974.Cd.", "Alacaatlı", "İncek Eftal Evleri", "İncek TOKİ Konutları", "İncek Yolu Durağı", "Başlar Cd.", "Metin Sk.", "Atabilge", "İncek Loft 1.Nizamiye", "İncek Loft 2.Nizamiye", "Hacılar", "İncek Göl Kuleleri Parkı", "Milli İrade Kız Anadolu İmam Hatip Lisesi", "Kara Mehmetoğlu Sk. 1", "Türkan Şoray Cd.", "İncek", "Sağlık Ocağı", "Susam Sk.", "Karadal Sk.", "Kızılcaşar Mahallesi", "Atakent Sitesi", "Kirazlı Sitesi", "Altıngül Sitesi", "2909.Cd.", "2898 Cd.", "Akpınar", "Koşuyolu Parkı", "Yurtdışı Türkler Başkanlığı", "Ufuk Üniversitesi", "Sayıştay", "Kara Kuvvetleri Komutanlığı", "Güvenpark"
    ],
    notlar: "İncek bağlar cd.nden başlar",
  },
  {
    no: "196",
    ad: "Gölbaşı - Taşpınar - İncek - Tulumtaş",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 115,
    sureDk: 140,
    kategori: "incek-cankaya",
    saatler: {
      haftaici: ["07:10", "07:25", "07:35", "16:00", "17:05", "17:10"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Kaymakamlık", "Mevlana Parkı", "936.Sk.", "Şehit Oğuz Kaan Usta", "Seymenler", "Şehir Parkı", "İmam Hatip Lisesi", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "Kreş Durağı", "Eymir Yurdu", "Erdem Beyazıt Anadolu Lisesi", "Tuz Gölü Cd.", "Hilal Cami", "Şht.sebahattin Koçak Anadolu İmam Hatip Lise", "Yedigöller Cd.", "Işıklı Göl Durağı", "Adem Bilhan Uysal İlkokulu", "Akçay Cd.", "Sapanca Gölü Cd.", "Yıldız Camii", "Manyas Gölü Cd.", "Park Eymir Ticaret Merkezi", "Belmek", "Köyceğiz Gölü Cd.", "Eğirdir Gölü Cd.", "Gediz Sk.", "Safa Okulları", "Gölbaşı Belediyesi", "Jandarma", "Baldudak İlkokulu", "Cemre Parkı", "774 Sk.", "Güzel Yalı Evleri", "Gölkonakları", "Mogan Park", "Patalya Hotel", "607.Cd.", "Yıldırım Cd.", "Kızılcaşar Yolu", "2855 Cd.", "Çeşme", "2893 Cd.", "2897.Sk.", "2898 Cd.", "Ahlatlıbel", "Aydınlar Sitesi", "Rıdvan Ege Kampüsü", "İncek Polis Merkezi", "Atılım Üniversitesi", "Park 29 Sitesi", "Bağlar Cd.", "İncekköy Sitesi", "Zafer Cd.", "Sinpaş Konutları", "1.Nizamiye", "2.Nizamiye", "İncek Prestij", "3.Nizamiye", "3346 Cd.", "Atabilge Aka Konutları", "İncek Eftal Evleri", "İncek TOKİ Konutları", "İncek Yolu Durağı", "Başlar Cd.", "Metin Sk.", "Atabilge", "İncek Loft 1.Nizamiye", "İncek Loft 2.Nizamiye", "Milli İrade Kız Anadolu İmam Hatip Lisesi", "Kara Mehmetoğlu Sk. 1", "Türkan Şoray Cd.", "İncek Mezarlığı", "Bahar Konakları", "Ataevler Sitesi", "Görgülü Sk.", "Çevik Sk.", "Evrensel Sk.", "Turgut Özal Blv.", "Kargen Sitesi", "Kargen Konutları", "İngöl Durağı", "Büyükşehir Misafirhanesi", "Koşu Yolu", "Tulumtaş", "Tulumtaş Mahallesi", "Ihlamur Sitesi", "Parlementerler Sitesi", "LÖSEV", "Cevregül Parlement Sitesi", "İncek", "Sağlık Ocağı", "Susam Sk.", "Karadal Sk.", "Kızılcaşar Mahallesi", "Atakent Sitesi", "Kolej", "Yeşil Bahçe", "Mogan Parkı", "Osmanlı Parkı", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır, 11735 no lu duraktan başlar",
  },
  {
    no: "197",
    ad: "Opera - Taşpınar - İncek - Tulumtaş Mahallesi",
    kalkis: "Doğanbey Mh.",
    varis: "Akpınar Mh.",
    mesafeKm: 76,
    sureDk: 115,
    kategori: "incek-cankaya",
    saatler: {
      haftaici: ["20:50", "21:50", "22:50"],
      cumartesi: ["20:50", "21:50", "22:50"],
      pazar: ["20:50", "21:50", "22:50"],
    },
    duraklar: [
      "Opera", "Sıhhiye", "Kızılay", "Milli Eğitim Bakanlığı", "Karayolları Genel Müdürlüğü", "Milli Kütüphane", "Kültür Ve Turizm Bakanlığı", "Hazine Ve Maliye Bakanlığı", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Cumhurbaşkanlığı İletişim Başkanlığı", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Anayasa Mahkemesi", "Adalet Akademisi", "Rasathane", "Ted Koleji", "Park Hayat Sitesi", "Tim Tower", "Nata İncek", "Nevaport", "Ada İncek", "İkra", "Uptown Konutları", "2855 Cd.", "2893 Cd.", "2897.Sk.", "2898 Cd.", "Atakent Sitesi", "Aydınlar Sitesi", "Kızılcaşar Mahallesi", "Ahlatlıbel", "1844.Cd.", "Muhtarlık", "Yavuz Sultan Selim Blv.", "Duru Beytepe", "Beytepe Murat Erdi Eker Devlet Hastenesi", "1746.Sk.", "Dörtevler", "Güneyce Camii", "Güneyce Sitesi", "Lösante Hastanesi", "2709.Sk.", "2696.Sk.", "Zafer Cd.", "Fransız Okulu", "İncek Polis Merkezi", "Atılım Üniversitesi", "Park 29 Sitesi", "Bağlar Cd.", "İyimaya Sk.", "Susam Sk.", "Sağlık Ocağı", "İncek", "İncek Mezarlığı", "Bahar Konakları", "Ataevler Sitesi", "Görgülü Sk.", "Çevik Sk.", "Evrensel Sk.", "Turgut Özal Blv.", "Kargen Sitesi", "Kargen Konutları", "İngöl Durağı", "Büyükşehir Misafirhanesi", "Koşu Yolu", "Tulumtaş", "Tulumtaş Mahallesi", "Ihlamur Sitesi", "Parlementerler Sitesi", "LÖSEV", "Cevregül Parlement Sitesi", "Karadal Sk.", "Rıdvan Ege Kampüsü", "Kolej", "Yeşil Bahçe", "Ted Koleji Kavşağı"
    ],
    notlar: "(dönüşsüz srv)kepekli kavşaktan kızılay a gitmez",
  },
  {
    no: "101",
    ad: "Gölbaşı - Haymana Yolu - Bahçelievler",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 43,
    sureDk: 73,
    kategori: "kirsal",
    saatler: {
      haftaici: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "15:30", "16:55", "18:15", "19:30"],
      cumartesi: ["07:00", "08:00", "09:00", "11:00", "13:00", "15:00", "17:00", "18:00", "19:30"],
      pazar: ["07:00", "10:00", "12:00", "14:00", "16:00", "17:00", "18:00"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Baldudak İlkokulu", "Cemre Parkı", "774 Sk.", "Güzel Yalı Evleri", "Gölkonakları", "Mogan Park", "Patalya Hotel", "607.Cd.", "Güney Sitesi", "Yıldırım Cd.", "Karçiçeği Sitesi", "Şiringölköy Sitesi", "Nesibe Aydın Okulları", "Villa Kur Sitesi", "492.Cd.", "Fizikçiler Sitesi", "Çeviker Konakları", "Eskidostlar Sitesi", "Yeşil Site", "Cemil Özgür Villaları", "Enda Konutları", "Çevre Ve Orman Bakanlığı Labaratuvarı", "438.Cd.", "441.Sk.", "Kırevleri Durağı", "Nilüfer Sk.", "Gökkuşağı Sitesi", "Üçhisar Sitesi", "Hacılar Blv.", "431.Sk.", "Haymana Yolu", "Gölbaşı Haymana Yolu", "Hacı Hasan Kavşağı", "Demka Tel Örgü", "Hacılar Kavşağı", "Aquapark", "Sayıştay Eğitim Merkezi", "Patalya Otel", "Mogan Parkı", "Darüşşifa", "Meslek Lisesi", "Yunus Emre Parkı", "Şehit Gaffar Okkan", "Osmanlı Parkı", "Diş Hastanesi", "Gürşen Sitesi", "Şenpınar Sitesi", "Gülkent Göl Villaları", "Hanımlar Lokali", "Yeşil Dostlar Sitesi", "Özgür Sitesi", "Umut Park", "Serkent Sitesi", "Papatya Sitesi", "Luna Gölbaşı Sitesi", "Gölbaşı Anadolu Lisesi", "TRT Haberciler Evleri", "208.Sk.", "Öz Örenkent Sitesi", "Başkent Sitesi"
    ],
  },
  {
    no: "101-1",
    ad: "Gölbaşı - Haymana Yolu - Bahçelievler - Karaoğlan Mahallesi",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 49,
    sureDk: 83,
    kategori: "kirsal",
    saatler: {
      haftaici: ["06:40", "16:15"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Baldudak İlkokulu", "Cemre Parkı", "774 Sk.", "Güzel Yalı Evleri", "Gölkonakları", "Mogan Park", "Patalya Hotel", "Güney Sitesi", "Yıldırım Cd.", "Karçiçeği Sitesi", "Şiringölköy Sitesi", "Nesibe Aydın Okulları", "Villa Kur Sitesi", "Fizikçiler Sitesi", "Çeviker Konakları", "Eskidostlar Sitesi", "Yeşil Site", "Cemil Özgür Villaları", "Enda Konutları", "Çevre Ve Orman Bakanlığı Labaratuvarı", "438.Cd.", "441.Sk.", "Kırevleri Durağı", "Gökkuşağı Sitesi", "Üçhisar Sitesi", "Hacılar Blv.", "431.Sk.", "Haymana Yolu", "Gölbaşı Haymana Yolu", "Hacı Hasan Kavşağı", "Demka Tel Örgü", "Hacılar Kavşağı", "Aquapark", "Sayıştay Eğitim Merkezi", "Patalya Otel", "Mogan Parkı", "Darüşşifa", "Meslek Lisesi", "Yunus Emre Parkı", "Şehit Gaffar Okkan", "Osmanlı Parkı", "Diş Hastanesi", "Gürşen Sitesi", "Şenpınar Sitesi", "Gülkent Göl Villaları", "Hanımlar Lokali", "Yeşil Dostlar Sitesi", "Özgür Sitesi", "71.Cd.", "Rüyakent Sitesi", "Karaoğlan Mahallesi", "Serpme Evler Durağı", "Karaoğlan Cami", "Gençler Durağı", "Umut Park", "Serkent Sitesi", "Papatya Sitesi", "Gölbaşı Anadolu Lisesi", "TRT Haberciler Evleri", "208.Sk.", "Öz Örenkent Sitesi", "Başkent Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır, Karaoğlan mh.gider",
  },
  {
    no: "108",
    ad: "Gölbaşı - Haymana Yolu - Hacılar Mh.",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 44,
    sureDk: 80,
    kategori: "kirsal",
    saatler: {
      haftaici: ["06:30", "07:35", "10:00", "12:00", "14:00", "16:30", "18:00", "20:00"],
      cumartesi: ["07:30", "10:00", "13:30", "18:00", "20:00"],
      pazar: ["07:30", "10:00", "13:30", "18:00", "20:00"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Baldudak İlkokulu", "Cemre Parkı", "774 Sk.", "Güzel Yalı Evleri", "Gölkonakları", "Mogan Park", "Patalya Otel", "Sayıştay Eğitim Merkezi", "Çevre Ve Orman Bakanlığı Labaratuvarı", "Aquapark", "Hacılar Kavşağı", "Hacılar Blv.", "Gökkuşağı Sitesi Kavşağı", "1423.Sk.", "Gölpark Sitesi", "1409.Cd.", "Hacılar Yolu", "Andost Sitesi", "Doğakent Sitesi", "Aydos Sitesi", "1362.Sk. 1.Durak", "1362.Sk. 2.Durak", "Hacılar Köyü Camii", "Hacılar Köyü İlköğretim Okulu", "Hacılar Blv. 1.Durak", "Hacılar Blv. 2.Durak", "Merkezkent Sitesi", "1482.Cd.", "Martıköy Sitesi", "Kuğu Köy Villaları", "Nergis Cd.", "Elit Sitesi", "Ihlamur Cd.", "Ballıkpınar Cami", "Çocuk Parkı", "At Çiftliği", "Has Villaları", "1850 Cd.", "Villa Voga Sitesi", "Villa Doğa Sitesi", "Kösen Villaları", "1629.Cd.", "Bahçekent", "Kardelen Evleri", "Balıkpınar Kavşağı", "Hacı Hasan Köyü", "Hacı Hasan Cami", "Hacıhasan Kavşağı", "Hacı Hasan Kavşağı", "Gölbaşı Haymana Yolu", "Haymana Yolu", "Demka Tel Örgü", "Mogan Parkı", "Osmanlı Parkı", "Diş Hastanesi", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
  },
  {
    no: "137",
    ad: "Gölbaşı Krıminal Merk. - Yaylabağ Mh.",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 27,
    sureDk: 40,
    kategori: "kirsal",
    saatler: {
      haftaici: ["07:25", "16:15"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Kaymakamlık", "Mevlana Parkı", "936.Sk.", "Zübeyde Hanım Kültür Merkezi", "914.Sk.", "Çakmak Sk.", "Tek Camii", "Kaymak Sitesi", "Şehir Parkı", "İmam Hatip Lisesi", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "Kreş Durağı", "Eymir Yurdu", "Erdem Beyazıt Anadolu Lisesi", "Beyşehir Gölü Cd.", "Yaylabağ", "Hacı Çeşmesi", "Yaylabağ Muhtarlık", "Yaylabağ Yolu", "Yaylabağ Köyü", "Eymir", "Safa Okulları", "Eymir Ve Şafak Mahallesi Muhtarlığı", "Gölbaşı Zübeyde Hanım Meslek Lisesi", "Diş Hastanesi", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır, 08:00 yaylabağ dan",
  },
  {
    no: "140",
    ad: "Gölbaşı - Karacaören - Gölbek - Çeltek",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 151,
    sureDk: 170,
    kategori: "kirsal",
    saatler: {
      haftaici: ["07:00", "18:00"],
      cumartesi: [],
      pazar: ["07:00", "18:00"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Osmanlı Parkı", "Vilayetler", "Serkent Sitesi", "Ulaşan Otel", "Paşa Kapısı", "Koluman", "Maç Gıda", "Karaoğlan Köy Girişi", "1.Bölge Yerleşkesi", "Kantar Durağı", "Muayene İstasyonu", "Özel Birlikler", "Oğulbey Kavşağı", "Bala Kavşağı", "Vergi Kontrol", "İş Makineleri", "Aselsan Ormanı", "Yağlıpınar Kavşağı", "Tepe Mobilya", "Türksat", "Alçı Fabrikası", "Adore Mobilya", "Ahiboz", "Mahmatlı Kavşağı", "Selametli Kavşağı", "Süt Toplama Merkezi", "Karayolları", "Çimşit Giriş", "Mezarlık", "Karacaören", "Gölbek Yolu", "Gölbek", "Çeltek", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "07:00 g.başı-08:30 çeltek çar.cma.pzr ç.şır",
  },
  {
    no: "142",
    ad: "Tohumlar - Çavuşlu - Yayla - Karahasanlı - Evciler",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 119,
    sureDk: 150,
    kategori: "kirsal",
    saatler: {
      haftaici: ["06:20", "17:30"],
      cumartesi: ["08:10", "18:00"],
      pazar: ["08:10", "18:00"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Osmanlı Parkı", "Vilayetler", "Serkent Sitesi", "Ulaşan Otel", "Paşa Kapısı", "Koluman", "Maç Gıda", "Karaoğlan Köy Girişi", "1.Bölge Yerleşkesi", "Kantar Durağı", "Muayene İstasyonu", "Özel Birlikler", "Oğulbey Kavşağı", "Bala Kavşağı", "Dalsan Alçı", "Bilgi Gıda", "Acıdevrent Köprüsü", "Acıdevrent", "Ankara Bala Yolu", "İnci İklim Durağı", "Verem Yokuşu", "Bala Yolu", "Esenyayla Durağı", "Tohumlar", "Tohumlar 1", "Tohumlar Yolu", "Tohumlar Giriş", "Tohumlar Mahallesi", "Tohumlar Küme Evleri", "Kömürcü Köyü", "Evciler Köyü", "Karahasanlı Köy Çıkışı", "Karahasanlı Köyü", "Karahasanlı Köy Girişi", "Karahasanlı Köy Yolu", "Yayla Köyü", "Akarlar Köyü", "Çavuşlu Köyü", "Benzinlik", "Üzüm Bağı Durağı", "Tahtalı Durağı", "Petrol Durağı", "Diş Hastanesi", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "06:20 gölbaşından 07:00 tohumlardan hareket eder",
  },
  {
    no: "146",
    ad: "Gölbaşı - Gülbağı - Akörençarsak - Derekışla - Berçarsak - Sofular - Karahamzalı",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 192,
    sureDk: 180,
    kategori: "kirsal",
    saatler: {
      haftaici: ["08:00", "18:00"],
      cumartesi: [],
      pazar: ["08:00", "18:00"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Osmanlı Parkı", "Vilayetler", "Serkent Sitesi", "Ulaşan Otel", "Paşa Kapısı", "Koluman", "Maç Gıda", "Karaoğlan Köy Girişi", "1.Bölge Yerleşkesi", "Kantar Durağı", "Muayene İstasyonu", "Özel Birlikler", "Oğulbey Kavşağı", "Bala Kavşağı", "Vergi Kontrol", "İş Makineleri", "Aselsan Ormanı", "Yağlıpınar Kavşağı", "Tepe Mobilya", "Türksat", "Alçı Fabrikası", "Adore Mobilya", "Ahiboz", "Mahmatlı Kavşağı", "Selametli Kavşağı", "Süt Toplama Merkezi", "Karayolları", "Çimşit Giriş", "Çiftlik Durağı", "Gülbağı Mahallesi Girişi", "Dinlenme Tesisleri", "Konya Yolu Çıkışı", "Akörençarsak", "Derekışla Köy Meydanı", "Belçarsak Köy Meydanı", "Belçarsak", "Yaylalıözü Mahallesi Yol Ayrımı", "Yaylalıözü", "Musa Ünal Ortaokulu", "Sofular Köy Meydanı", "Sofular Çıkışı", "Karahamzalı", "Gülbağı Mahallesi", "Gülbağı İç Yolu", "Gülbağı Çıkışı", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "08:00 gölbaşı 09:30 karahamzalı dan",
  },
  {
    no: "147",
    ad: "Gölbaşı - Bezirhane - Emirler Mh.",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 132,
    sureDk: 120,
    kategori: "kirsal",
    saatler: {
      haftaici: ["08:00", "14:00", "18:15"],
      cumartesi: ["06:20", "09:30", "18:15"],
      pazar: ["09:30", "18:15"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Vilayetler", "Serkent Sitesi", "Ulaşan Otel", "Paşa Kapısı", "Koluman", "Maç Gıda", "Karaoğlan Köy Girişi", "1.Bölge Yerleşkesi", "Kantar Durağı", "Muayene İstasyonu", "Özel Birlikler", "Oğulbey Kavşağı", "Bala Kavşağı", "Vergi Kontrol", "İş Makineleri", "Aselsan Ormanı", "Yağlıpınar Kavşağı", "Tepe Mobilya", "Türksat", "Alçı Fabrikası", "Adore Mobilya", "Ahiboz", "Mahmatlı Kavşağı", "Selametli Kavşağı", "Süt Toplama Merkezi", "Karayolları", "Bezirhane Giriş", "Bezirhane İlköğretim Okulu", "Çeşme Durağı", "Bezirhane Cami", "Bakkal Durağı", "Bahçeler İçi", "Fen İşleri", "Yda", "Çimşit Giriş", "Çimşit Yolu", "Köy Konağı", "Çimşit Mh.", "Çimşit Mahallesi", "Emirler Mahallesi", "Emirler Mahallesi İç Yolu", "Şehit Tuncay Yıldırım Durağı", "Muhtarlık", "Emirler Son Durak", "Çarsak Yolu", "Yeni Yapan Çarsak Camii", "Hanburun Mahallesi", "Emirler", "Hamzalı", "Soğulcak Mahallesi", "Soğulcak Köyü", "Soğulcak Çıkışı", "Diş Hastanesi", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Hanburun a gider",
  },
  {
    no: "147-1",
    ad: "Gölbaşı - Bezirhane - Emirler Mh. - Hastane",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 137,
    sureDk: 165,
    kategori: "kirsal",
    saatler: {
      haftaici: ["16:15"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Öğretmenler Sitesi", "İbrahim Sıtkı Göçmen Parkı", "Anaokulu", "Trafo Durağı", "Yağmur Evler Sitesi", "Safa Okulları", "Kreş Durağı", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "İmam Hatip Lisesi", "Şehir Parkı", "Seymenler", "Şehit Oğuz Kaan Usta", "936.Sk.", "Mevlana Parkı", "Gölbaşı Kaymakamlık", "Gölbaşı Belediyesi", "Jandarma", "Vilayetler", "Serkent Sitesi", "Ulaşan Otel", "Paşa Kapısı", "Koluman", "Maç Gıda", "Karaoğlan Köy Girişi", "1.Bölge Yerleşkesi", "Kantar Durağı", "Muayene İstasyonu", "Özel Birlikler", "Oğulbey Kavşağı", "Bala Kavşağı", "Vergi Kontrol", "İş Makineleri", "Aselsan Ormanı", "Yağlıpınar Kavşağı", "Tepe Mobilya", "Türksat", "Alçı Fabrikası", "Adore Mobilya", "Ahiboz", "Mahmatlı Kavşağı", "Selametli Kavşağı", "Süt Toplama Merkezi", "Karayolları", "Bezirhane Giriş", "Bezirhane İlköğretim Okulu", "Çeşme Durağı", "Bezirhane Cami", "Bakkal Durağı", "Bahçeler İçi", "Fen İşleri", "Yda", "Çimşit Giriş", "Çimşit Yolu", "Köy Konağı", "Çimşit Mh.", "Çimşit Mahallesi", "Emirler Mahallesi", "Emirler Mahallesi İç Yolu", "Şehit Tuncay Yıldırım Durağı", "Muhtarlık", "Emirler Son Durak", "Çarsak Yolu", "Yeni Yapan Çarsak Camii", "Hanburun Mahallesi", "Emirler", "Hamzalı", "Soğulcak Mahallesi", "Soğulcak Köyü", "Soğulcak Çıkışı", "Diş Hastanesi", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır, Hanburun ve gölbaşı dvlt hast.gider",
  },
  {
    no: "147-2",
    ad: "Gölbaşı - Bezirhane - Emirler Mh. - Hastane",
    kalkis: "Hanburun Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 72,
    sureDk: 80,
    kategori: "kirsal",
    saatler: {
      haftaici: ["06:15"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Hanburun Mahallesi", "Yeni Yapan Çarsak Camii", "Çarsak Yolu", "Emirler", "Hamzalı", "Muhtarlık", "Çeşme Durağı", "Şehit Tuncay Yıldırım Durağı", "Emirler Mahallesi", "Emirler Mahallesi İç Yolu", "Çimşit Mahallesi", "Çimşit Mh.", "Köy Konağı", "Çimşit Yolu", "Çimşit Giriş", "Yda", "Bezirhane Giriş", "Bezirhane İlköğretim Okulu", "Bezirhane Cami", "Bakkal Durağı", "Bahçeler İçi", "Fen İşleri", "Karayolları", "Süt Toplama Merkezi", "Soğulcak Mahallesi", "Soğulcak Köyü", "Soğulcak Çıkışı", "Selametli Kavşağı", "Mahmatlı Kavşağı", "Alçı Fabrikası", "Ahiboz", "Adore Mobilya", "Türksat", "Tepe Mobilya", "Yağlıpınar Kavşağı", "Aselsan Ormanı", "İş Makineleri", "Vergi Kontrol", "Bala Kavşağı", "Oğulbey Kavşağı", "Özel Birlikler", "Muayene İstasyonu", "Kantar Durağı", "1.Bölge Yerleşkesi", "Karaoğlan Köy Girişi", "Maç Gıda", "Koluman", "Paşa Kapısı", "Ulaşan Otel", "Serkent Sitesi", "Vilayetler", "Gölbaşı Belediyesi", "Jandarma", "Osmanlı Parkı", "Gölbaşı Kaymakamlık", "Mevlana Parkı", "936.Sk.", "Şehit Oğuz Kaan Usta", "Seymenler", "Şehir Parkı", "İmam Hatip Lisesi", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "Kreş Durağı", "Eymir Yurdu", "Yağmur Evler Sitesi", "Trafo Durağı", "Anaokulu", "İbrahim Sıtkı Göçmen Parkı", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Milli İrade Öğrenci Yurdu", "35.Cd.", "Başkent Sitesi", "Yunus Emre Camii", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır, Y.yap.çarsakdan bşlr(gölbaşı dvlt hast.)",
  },
  {
    no: "148",
    ad: "Gölbaşı - Yöreli - Abazlı Mh.",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 125,
    sureDk: 90,
    kategori: "kirsal",
    saatler: {
      haftaici: ["07:00", "18:00"],
      cumartesi: ["09:00", "18:30"],
      pazar: ["09:00", "18:30"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Osmanlı Parkı", "Vilayetler", "Serkent Sitesi", "Ulaşan Otel", "Paşa Kapısı", "Koluman", "Maç Gıda", "Karaoğlan Köy Girişi", "1.Bölge Yerleşkesi", "Kantar Durağı", "Muayene İstasyonu", "Özel Birlikler", "Oğulbey Kavşağı", "Bala Kavşağı", "Vergi Kontrol", "İş Makineleri", "Aselsan Ormanı", "Yağlıpınar Kavşağı", "Tepe Mobilya", "Türksat", "Alçı Fabrikası", "Adore Mobilya", "Ahiboz", "Mahmatlı Kavşağı", "Selametli Kavşağı", "Bağiçi Köy Yolu Besi Çiftliği", "Soğulcak Giriş", "Soğulcak Köyü", "Seğmenler Su Fabrikası", "Bağiçi Yayla Yolu", "Bağiçi Mahallesi", "Bağlar Durağı", "Bağiçi Köyü", "Yöreli Kaz Çiftliği", "Yöreli Köyü", "Yöreli Köyü Çıkışı", "Yöreli Yolu", "Yöreli TOKİ", "Hobi Bahçeleri", "Abazlı Giriş", "Küme Evleri", "Mezarlık", "Abazlı TOKİ Evleri", "TOKİ Evleri 1", "Abazlı Mahallesi", "Abazlı", "Köy Meydanı", "Abazlı Köy Çıkışı", "Gölbaşı Kaymakamlık", "Mevlana Parkı", "936.Sk.", "Şehit Oğuz Kaan Usta", "Seymenler", "Şehir Parkı", "İmam Hatip Lisesi", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "Kreş Durağı", "Eymir Yurdu", "Yağmur Evler Sitesi", "Trafo Durağı", "Anaokulu", "İbrahim Sıtkı Göçmen Parkı", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Abazlı mh.başlar, soğulcak, gölbaşı dvl.gider",
  },
  {
    no: "149",
    ad: "Gölbaşı - Selametli",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 96,
    sureDk: 100,
    kategori: "kirsal",
    saatler: {
      haftaici: ["08:00", "18:20"],
      cumartesi: ["06:30", "10:00", "18:20"],
      pazar: ["10:00", "18:20"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Vilayetler", "Serkent Sitesi", "Ulaşan Otel", "Paşa Kapısı", "Koluman", "Maç Gıda", "Karaoğlan Köy Girişi", "1.Bölge Yerleşkesi", "Kantar Durağı", "Muayene İstasyonu", "Özel Birlikler", "Oğulbey Kavşağı", "Bala Kavşağı", "Vergi Kontrol", "İş Makineleri", "Aselsan Ormanı", "Yağlıpınar Kavşağı", "Tepe Mobilya", "Türksat", "Alçı Fabrikası", "Adore Mobilya", "Ahiboz", "Mahmatlı Kavşağı", "Selametli Kavşağı", "Bahçeköy", "Mahmatlı Bahçe", "Çoban Çeşmesi", "Çakmaklı Bel", "Tepebaşı", "Selametli Sağlık Ocağı", "Hakan Ülger Ortaokulu", "Köy İçi", "Selametli Yardımlaşma Derneği", "Bakkal Durağı", "Selametli Cami", "Eski Belediye", "İnci Su", "Mahmatlı Köyü", "Mahmatlı Köyü Son Durak", "Diş Hastanesi", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Gölbaşı na dönüş yapmaz",
  },
  {
    no: "149-1",
    ad: "Gölbaşı - Selametli - Hastane",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 101,
    sureDk: 145,
    kategori: "kirsal",
    saatler: {
      haftaici: ["16:15"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Öğretmenler Sitesi", "İbrahim Sıtkı Göçmen Parkı", "Anaokulu", "Trafo Durağı", "Yağmur Evler Sitesi", "Safa Okulları", "Kreş Durağı", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "İmam Hatip Lisesi", "Şehir Parkı", "Seymenler", "Şehit Oğuz Kaan Usta", "936.Sk.", "Mevlana Parkı", "Gölbaşı Kaymakamlık", "Gölbaşı Belediyesi", "Jandarma", "Vilayetler", "Serkent Sitesi", "Ulaşan Otel", "Paşa Kapısı", "Koluman", "Maç Gıda", "Karaoğlan Köy Girişi", "1.Bölge Yerleşkesi", "Kantar Durağı", "Muayene İstasyonu", "Özel Birlikler", "Oğulbey Kavşağı", "Bala Kavşağı", "Vergi Kontrol", "İş Makineleri", "Aselsan Ormanı", "Yağlıpınar Kavşağı", "Tepe Mobilya", "Türksat", "Alçı Fabrikası", "Adore Mobilya", "Ahiboz", "Mahmatlı Kavşağı", "Selametli Kavşağı", "Bahçeköy", "Mahmatlı Bahçe", "Çoban Çeşmesi", "Çakmaklı Bel", "Tepebaşı", "Selametli Sağlık Ocağı", "Hakan Ülger Ortaokulu", "Köy İçi", "Selametli Yardımlaşma Derneği", "Bakkal Durağı", "Selametli Cami", "Eski Belediye", "İnci Su", "Mahmatlı Köyü", "Mahmatlı Köyü Son Durak", "Diş Hastanesi", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır, Gölbaşı dvlt hast.gider",
  },
  {
    no: "149-2",
    ad: "Gölbaşı - Selametli - Hastane",
    kalkis: "Selametli Şehit Emrah Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 58,
    sureDk: 70,
    kategori: "kirsal",
    saatler: {
      haftaici: ["06:30"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Hakan Ülger Ortaokulu", "Köy İçi", "Selametli Yardımlaşma Derneği", "Bakkal Durağı", "Selametli Cami", "Eski Belediye", "Selametli Sağlık Ocağı", "Tepebaşı", "Çakmaklı Bel", "Çoban Çeşmesi", "Mahmatlı Bahçe", "Selametli Kavşağı", "İnci Su", "Mahmatlı Köyü", "Mahmatlı Köyü Son Durak", "Mahmatlı Kavşağı", "Alçı Fabrikası", "Ahiboz", "Adore Mobilya", "Türksat", "Tepe Mobilya", "Yağlıpınar Kavşağı", "Aselsan Ormanı", "İş Makineleri", "Vergi Kontrol", "Bala Kavşağı", "Oğulbey Kavşağı", "Özel Birlikler", "Muayene İstasyonu", "Kantar Durağı", "1.Bölge Yerleşkesi", "Karaoğlan Köy Girişi", "Maç Gıda", "Koluman", "Paşa Kapısı", "Ulaşan Otel", "Serkent Sitesi", "Vilayetler", "Gölbaşı Belediyesi", "Jandarma", "Osmanlı Parkı", "Gölbaşı Kaymakamlık", "Mevlana Parkı", "936.Sk.", "Şehit Oğuz Kaan Usta", "Seymenler", "Şehir Parkı", "İmam Hatip Lisesi", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "Kreş Durağı", "Eymir Yurdu", "Yağmur Evler Sitesi", "Trafo Durağı", "Anaokulu", "İbrahim Sıtkı Göçmen Parkı", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Milli İrade Öğrenci Yurdu", "35.Cd.", "Başkent Sitesi", "Yunus Emre Camii", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır, Selametliden başlar(gölbaşı dvlt hast.gider)",
  },
  {
    no: "151",
    ad: "Gölbaşı - Karagedik Mh.",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 72,
    sureDk: 95,
    kategori: "kirsal",
    saatler: {
      haftaici: ["06:15", "12:00", "14:45", "20:30"],
      cumartesi: ["11:15", "15:15", "17:15", "20:30"],
      pazar: ["06:25", "12:15", "15:15"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Osmanlı Parkı", "Vilayetler", "Serkent Sitesi", "Ulaşan Otel", "Paşa Kapısı", "Koluman", "Maç Gıda", "Karaoğlan Köy Girişi", "1.Bölge Yerleşkesi", "Kantar Durağı", "Muayene İstasyonu", "Özel Birlikler", "Oğulbey Kavşağı", "Bala Kavşağı", "Vergi Kontrol", "İş Makineleri", "Aselsan Ormanı", "Yağlıpınar Kavşağı", "Yağlıpınar Mahallesi", "Yağlıpınar Mahallesi Muhtarlığı", "Tepe Mobilya", "Türksat", "Alçı Fabrikası", "Adore Mobilya", "Ahiboz Giriş", "Ahiboz Jandarma", "Ahiboz İlköğretim Okulu", "İtfaiye Durağı", "Ahiboz", "Karagedik Yolu", "Ercan Mahalle Muhtarlığı", "Hacı Ali Ersoy Cami", "Postane Durağı", "Çeşme", "Karagedik Cami", "Evren Durağı", "Hacı Enver Bektaş Cami", "Köşk Durağı", "Ali Güder Çok Programlı Lisesi", "1.Cd. Son Durak", "Ali Güder Anadolu Lisesi", "Pazar Yeri", "Ahiboz Çıkış", "Diş Hastanesi", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Karagedik mahallesinden başlar",
  },
  {
    no: "151-1",
    ad: "Gölbaşı - Karagedik - Hastane",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 77,
    sureDk: 120,
    kategori: "kirsal",
    saatler: {
      haftaici: ["15:30"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Öğretmenler Sitesi", "İbrahim Sıtkı Göçmen Parkı", "Anaokulu", "Trafo Durağı", "Yağmur Evler Sitesi", "Safa Okulları", "Kreş Durağı", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "İmam Hatip Lisesi", "Şehir Parkı", "Seymenler", "Şehit Oğuz Kaan Usta", "936.Sk.", "Mevlana Parkı", "Gölbaşı Kaymakamlık", "Gölbaşı Belediyesi", "Jandarma", "Vilayetler", "Serkent Sitesi", "Ulaşan Otel", "Paşa Kapısı", "Koluman", "Maç Gıda", "Karaoğlan Köy Girişi", "1.Bölge Yerleşkesi", "Kantar Durağı", "Muayene İstasyonu", "Özel Birlikler", "Oğulbey Kavşağı", "Bala Kavşağı", "Vergi Kontrol", "İş Makineleri", "Aselsan Ormanı", "Yağlıpınar Kavşağı", "Yağlıpınar Mahallesi", "Yağlıpınar Mahallesi Muhtarlığı", "Tepe Mobilya", "Türksat", "Alçı Fabrikası", "Adore Mobilya", "Ahiboz Giriş", "Ahiboz Jandarma", "Ahiboz İlköğretim Okulu", "İtfaiye Durağı", "Ahiboz", "Karagedik Yolu", "Ercan Mahalle Muhtarlığı", "Hacı Ali Ersoy Cami", "Postane Durağı", "Çeşme", "Karagedik Cami", "Evren Durağı", "Hacı Enver Bektaş Cami", "Köşk Durağı", "Ali Güder Çok Programlı Lisesi", "1.Cd. Son Durak", "Ali Güder Anadolu Lisesi", "Pazar Yeri", "Ahiboz Çıkış", "Diş Hastanesi", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır, Gölbaşı dvlt.hast.gider",
  },
  {
    no: "151-2",
    ad: "Gölbaşı - Karagedik - Kırıklı Mahallesi",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 80,
    sureDk: 95,
    kategori: "kirsal",
    saatler: {
      haftaici: ["07:15", "16:45"],
      cumartesi: ["06:25", "16:15"],
      pazar: ["19:30"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Vilayetler", "Serkent Sitesi", "Ulaşan Otel", "Paşa Kapısı", "Koluman", "Maç Gıda", "Karaoğlan Köy Girişi", "1.Bölge Yerleşkesi", "Kantar Durağı", "Muayene İstasyonu", "Özel Birlikler", "Oğulbey Kavşağı", "Bala Kavşağı", "Vergi Kontrol", "İş Makineleri", "Aselsan Ormanı", "Yağlıpınar Kavşağı", "Tepe Mobilya", "Türksat", "Alçı Fabrikası", "Adore Mobilya", "Ahiboz Giriş", "Ahiboz Jandarma", "Ahiboz İlköğretim Okulu", "İtfaiye Durağı", "Ahiboz", "Karagedik Yolu", "Ercan Mahalle Muhtarlığı", "Hacı Ali Ersoy Cami", "Postane Durağı", "Çeşme", "Karagedik Cami", "Evren Durağı", "Hacı Enver Bektaş Cami", "Köşk Durağı", "Ali Güder Çok Programlı Lisesi", "1.Cd. Son Durak", "Ali Güder Anadolu Lisesi", "Kırıklı Mahallesi", "Kırıklı", "Kırıklı Son Durak", "Kırıklı Yolu", "Pazar Yeri", "Ahiboz Çıkış", "Diş Hastanesi", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Karagedik.mh.başlar, kırıklı ya girer",
  },
  {
    no: "151-4",
    ad: "Gölbaşı - Karagedik Mh.(tepeyurt)",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 84,
    sureDk: 85,
    kategori: "kirsal",
    saatler: {
      haftaici: ["09:00", "13:45", "18:15", "19:30"],
      cumartesi: ["07:15", "18:30"],
      pazar: ["07:15"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Vilayetler", "Serkent Sitesi", "Ulaşan Otel", "Paşa Kapısı", "Koluman", "Maç Gıda", "Karaoğlan Köy Girişi", "1.Bölge Yerleşkesi", "Kantar Durağı", "Muayene İstasyonu", "Özel Birlikler", "Oğulbey Kavşağı", "Bala Kavşağı", "Vergi Kontrol", "İş Makineleri", "Aselsan Ormanı", "Yağlıpınar Kavşağı", "Yağlıpınar Mahallesi", "Yağlıpınar Mahallesi Muhtarlığı", "Tepe Mobilya", "Türksat", "Alçı Fabrikası", "Adore Mobilya", "Ahiboz Giriş", "Ahiboz Jandarma", "Ahiboz İlköğretim Okulu", "İtfaiye Durağı", "Ahiboz", "Karagedik Yolu", "Ercan Mahalle Muhtarlığı", "Hacı Ali Ersoy Cami", "Postane Durağı", "Çeşme", "Karagedik Cami", "Evren Durağı", "Hacı Enver Bektaş Cami", "Köşk Durağı", "Ali Güder Çok Programlı Lisesi", "1.Cd. Son Durak", "Ali Güder Anadolu Lisesi", "Kırıklı Mahallesi", "Kırıklı", "Kırıklı Son Durak", "Tepeyurt Çıkış", "Tepeyurt", "Kırıklı Yolu", "Pazar Yeri", "Ahiboz Çıkış", "Diş Hastanesi", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Kırıklı-tepeyurt",
  },
  {
    no: "151-5",
    ad: "Gölbaşı - Karagedik Mh.(dikilitaş)",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 90,
    sureDk: 90,
    kategori: "kirsal",
    saatler: {
      haftaici: ["10:45"],
      cumartesi: ["09:15"],
      pazar: ["09:15"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Vilayetler", "Serkent Sitesi", "Ulaşan Otel", "Paşa Kapısı", "Koluman", "Maç Gıda", "Karaoğlan Köy Girişi", "1.Bölge Yerleşkesi", "Kantar Durağı", "Muayene İstasyonu", "Özel Birlikler", "Oğulbey Kavşağı", "Bala Kavşağı", "Vergi Kontrol", "İş Makineleri", "Aselsan Ormanı", "Yağlıpınar Kavşağı", "Yağlıpınar Mahallesi", "Yağlıpınar Mahallesi Muhtarlığı", "Tepe Mobilya", "Türksat", "Alçı Fabrikası", "Adore Mobilya", "Ahiboz Giriş", "Ahiboz Jandarma", "Ahiboz İlköğretim Okulu", "İtfaiye Durağı", "Ahiboz", "Karagedik Yolu", "Ercan Mahalle Muhtarlığı", "Hacı Ali Ersoy Cami", "Postane Durağı", "Çeşme", "Karagedik Cami", "Evren Durağı", "Hacı Enver Bektaş Cami", "Köşk Durağı", "Ali Güder Çok Programlı Lisesi", "1.Cd. Son Durak", "Ali Güder Anadolu Lisesi", "Dikilitaş", "Pazar Yeri", "Ahiboz Çıkış", "Diş Hastanesi", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Dikilitaş-yağlıpınar 12:10 de karagedik ten",
  },
  {
    no: "151-6",
    ad: "Gölbaşı - Karagedik Mahallesi(dikilitaş - Tepeyurt)",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 96,
    sureDk: 90,
    kategori: "kirsal",
    saatler: {
      haftaici: ["06:45", "17:30"],
      cumartesi: ["13:15"],
      pazar: ["17:15"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Vilayetler", "Serkent Sitesi", "Ulaşan Otel", "Paşa Kapısı", "Koluman", "Maç Gıda", "Karaoğlan Köy Girişi", "1.Bölge Yerleşkesi", "Kantar Durağı", "Muayene İstasyonu", "Özel Birlikler", "Oğulbey Kavşağı", "Bala Kavşağı", "Vergi Kontrol", "İş Makineleri", "Aselsan Ormanı", "Yağlıpınar Kavşağı", "Tepe Mobilya", "Türksat", "Alçı Fabrikası", "Adore Mobilya", "Ahiboz Giriş", "Ahiboz Jandarma", "Ahiboz İlköğretim Okulu", "İtfaiye Durağı", "Ahiboz", "Karagedik Yolu", "Ercan Mahalle Muhtarlığı", "Hacı Ali Ersoy Cami", "Postane Durağı", "Çeşme", "Karagedik Cami", "Evren Durağı", "Hacı Enver Bektaş Cami", "Köşk Durağı", "Ali Güder Çok Programlı Lisesi", "1.Cd. Son Durak", "Ali Güder Anadolu Lisesi", "Dikilitaş", "Tepeyurt", "Kırıklı Yolu", "Pazar Yeri", "Ahiboz Çıkış", "Diş Hastanesi", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Dikilitaştan başlar, t.yurt, karagedik mh.gider",
  },
  {
    no: "151-8",
    ad: "Gölbaşı - Karagedik - Hastane",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 77,
    sureDk: 120,
    kategori: "kirsal",
    saatler: {
      haftaici: ["07:30"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Vilayetler", "Serkent Sitesi", "Ulaşan Otel", "Paşa Kapısı", "Koluman", "Maç Gıda", "Karaoğlan Köy Girişi", "1.Bölge Yerleşkesi", "Kantar Durağı", "Muayene İstasyonu", "Özel Birlikler", "Oğulbey Kavşağı", "Bala Kavşağı", "Vergi Kontrol", "İş Makineleri", "Aselsan Ormanı", "Yağlıpınar Kavşağı", "Yağlıpınar Mahallesi", "Yağlıpınar Mahallesi Muhtarlığı", "Tepe Mobilya", "Türksat", "Alçı Fabrikası", "Adore Mobilya", "Ahiboz Giriş", "Ahiboz Jandarma", "Ahiboz İlköğretim Okulu", "İtfaiye Durağı", "Ahiboz", "Karagedik Yolu", "Ercan Mahalle Muhtarlığı", "Hacı Ali Ersoy Cami", "Postane Durağı", "Çeşme", "Karagedik Cami", "Evren Durağı", "Hacı Enver Bektaş Cami", "Köşk Durağı", "Ali Güder Çok Programlı Lisesi", "1.Cd. Son Durak", "Ali Güder Anadolu Lisesi", "Pazar Yeri", "Ahiboz Çıkış", "Gölbaşı Kaymakamlık", "Mevlana Parkı", "936.Sk.", "Şehit Oğuz Kaan Usta", "Seymenler", "Şehir Parkı", "İmam Hatip Lisesi", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "Kreş Durağı", "Eymir Yurdu", "Yağmur Evler Sitesi", "Trafo Durağı", "Anaokulu", "İbrahim Sıtkı Göçmen Parkı", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır, Yağlıpınar-gölbaşı dvlt.hast.gider",
  },
  {
    no: "157",
    ad: "Opera - Gölbaşı - Oyaca Mahallesi",
    kalkis: "Doğanbey Mh.",
    varis: "Doğanbey Mh.",
    mesafeKm: 151,
    sureDk: 135,
    kategori: "kirsal",
    saatler: {
      haftaici: ["06:15", "07:00", "07:01", "07:30", "10:00", "10:01", "12:30", "13:00", "15:05", "15:30", "16:00", "17:00", "17:30", "18:00", "18:45", "19:30", "21:00"],
      cumartesi: ["07:00", "07:50", "08:30", "10:00", "10:01", "12:00", "13:00", "15:00", "15:01", "17:00", "17:30", "18:00", "18:45", "19:30", "21:00"],
      pazar: ["06:30", "08:30", "10:00", "12:00", "13:00", "15:00", "15:01", "17:00", "17:30", "18:00", "18:45", "19:30", "21:00"],
    },
    duraklar: [
      "Atatürk Spor Salonu", "Ankara Tren Garı", "Selim Sırrı Tarcan Spor Salonu", "Adliye", "Maltepe Pazarı", "Ankara Yüksek Hızlı Tren Garı", "Dört Mevsim Parkı", "Etiler Ordu Evi", "Efan Park", "Tevfik İleri İmam Hatip Lisesi", "Diş Hekimliği Fakültesi", "Gazi Hastanesi", "Zübeyde Hanım Yurt Müdürlüğü", "Emek", "AŞTİ", "Ufuk Üniversitesi Hastanesi", "Ö.Harekat Şehitleri Anadolu İmam Hatip Lisesi", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "Avm Durağı", "Şelale Parkı", "Osmanlı Parkı", "Üst Geçit", "Ankara Cd. 1", "Gölbaşı İlkokulu", "Jandarma", "Baldudak İlkokulu", "Cemre Parkı", "774 Sk.", "Gölkonakları", "Mogan Park", "Patalya Otel", "Sayıştay Eğitim Merkezi", "Çevre Ve Orman Bakanlığı Labaratuvarı", "Aquapark", "Hacılar Kavşağı", "431.Sk.", "Haymana Yolu", "Gölbaşı Haymana Yolu", "Hacıhasan Kavşağı", "Ballıkpınar Kavşağı", "Mogan Sevgi Çiçeği Evleri", "Çayırkuşu", "Yavrucak Mahallesi", "Velihimmetli Kavşağı", "Fatih Çiftliği", "Demirel Kardeşler Çiftliği", "Gökçehöyük Giriş", "Gökçehöyük Mah", "Gökçehöyük İlköğretim Okulu", "Mezarlık", "Köy Pazarı", "Haberciler Sitesi", "Gökçenar Sitesi", "Meneviş Evleri", "Görece Sitesi", "Beydağı Yapı Kooperatifi", "Doka", "Ziraat Fakültesi", "Tarla Bitkileri Üretme Çiftliği", "İkizce Köyü", "İkizce Merkez Çıkış", "Esenbel Konutları", "Dikilitaş", "Boyalık Köyü Kavşağı", "Göznur Konakları", "Oyaca Çıkış", "Oyaca Giriş", "Oyaca Lisesi", "Oyaca Mezarlık", "Mükremin Başaran İlkokulu", "Oyaca Son Durak", "Tarım Kredi Kooperatifi", "Fatih Sk.", "Oyaca Merkez", "Oyaca İlköğretim Okulu", "Boyalık Hobi Bahçeleri", "Küme Evleri", "Boyalık Köyü Girişi", "Kültür Merkezi", "Boyalık Mahallesi Mezarlık", "Culuk Köy Girişi", "Culuk İçi Trafo", "Culuk Köy Meydanı", "Ziraat Fakültesi Lojmanları", "Topaklı Yol Ayrımı", "Çakır Çiftliği", "Gökçehöyük Mahallesi", "Gökçehöyük Çıkış", "Balıkpınar Kavşağı", "Kardelen Evleri", "Hacı Hasan Kavşağı", "Demka Tel Örgü", "Mogan Parkı", "Plevne Sk.", "Fatma Ercan Cami", "Gölbaşı Stadyumu", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 3.Durak", "Akpınar", "Akpınar Mahallesi", "Koşuyolu Parkı", "Ufuk Üniversitesi", "Bahçelievler", "Emniyet Sarayı", "Çevikkuvvet", "Atatürk Kültür Merkezi", "19 Mayıs Stadyumu"
    ],
    notlar: "Oyacadan başlar",
  },
  {
    no: "177",
    ad: "Gölbaşı - Velihimmetli",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 79,
    sureDk: 100,
    kategori: "kirsal",
    saatler: {
      haftaici: ["06:25", "11:00", "14:15", "17:30", "19:15"],
      cumartesi: ["06:25", "14:15", "19:15"],
      pazar: ["10:30", "19:15"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Baldudak İlkokulu", "Cemre Parkı", "774 Sk.", "Güzel Yalı Evleri", "Gölkonakları", "Mogan Park", "Patalya Otel", "Sayıştay Eğitim Merkezi", "Çevre Ve Orman Bakanlığı Labaratuvarı", "Aquapark", "Hacılar Kavşağı", "Hacılar Blv.", "Gökkuşağı Sitesi Kavşağı", "1409.Cd.", "Hacılar Yolu", "Andost Sitesi", "Merkezkent Sitesi", "1482.Cd.", "Martıköy Sitesi", "Kuğu Köy Villaları", "Has Bahçe", "Kardelen", "Çocuk Parkı", "Ballıkpınar Cami", "Su Deposu", "Eğitim Teknolojileri Genel Müdürlüğü", "Veli Dede Bahçesi", "Şevketzade Konağı", "Küme Evleri", "LÖSEV", "Ihlamur Sitesi", "Parlementerler Sitesi", "Alibaba Bahçesi", "Koparan İlköğretim Okulu", "Koparan Camii", "Çeşme Durağı", "Mezarlık Durağı", "Koparan Çıkış", "Bağlar Durağı", "Okurlar Durağı", "Bahçeler Durağı", "Paşalar Durağı", "Keskinler Durağı", "Ücret Kavşağı", "Halaçlı Köyü", "Köprü Durağı", "Velihimmetli", "Trafo Durağı", "Velihimmetli İlköğretim Okulu", "Üstünbaş Durağı", "Velihimmetli Çıkış", "Çömlek Atölyesi", "Hacımuratlı Köy Ayrımı", "Özaltın Çiftliği", "Hacımuratlı Köyü", "Hacı Muratlı Son Durak", "Aselin Bahçesi", "Ata Alçı", "Havalıkent Cd.", "Nart Sitesi Yolu", "Hacı Muratlı Kooperatifi", "Elif Doğa Kooperatifi", "Hobi Bahçeleri", "Mavi Köşk", "Garnizon Kavşağı", "Gökçehöyük Çıkış", "Fatih Çiftliği", "Velihimmetli Kavşağı", "Yavrucak Mahallesi", "Haymana Yolu", "Çayırkuşu", "Mogan Sevgi Çiçeği Evleri", "Balıkpınar Kavşağı", "Hacı Hasan Kavşağı", "Gölbaşı Haymana Yolu", "Demka Tel Örgü", "Osmanlı Parkı", "Diş Hastanesi", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "H.muratlıdan başlar, ıhlamur sit.gider",
  },
  {
    no: "179",
    ad: "Gölbaşı - Örencik - Yurtbeyi Mh.",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 21,
    sureDk: 32,
    kategori: "kirsal",
    saatler: {
      haftaici: ["06:40", "07:45", "13:00", "17:00", "19:00"],
      cumartesi: ["06:40", "19:00"],
      pazar: ["06:40", "19:00"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Kaymakamlık", "Mevlana Parkı", "İnönü Ortaokulu", "Seğmenler Mahallesi Muhtarlığı", "Öğretmenler Sitesi", "İbrahim Sıtkı Göçmen Parkı", "Anaokulu", "Trafo Durağı", "Yağmur Evler Sitesi", "Örencik Cami", "Yurtbeyi Kavşağı", "Serpme Evler", "Manzara Evleri Sitesi Yolu", "Elmalık Durağı", "Çiftlik Durağı", "Yurtbeyi Yeşilöz Cami", "Yurtbeyi 2", "Yurtbeyi 1", "Taşçılar Durağı", "Yurtbeyi Son Durak", "Diş Hastanesi", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "07:00 de yurtbeyden kalkar",
  },
  {
    no: "180",
    ad: "Gölbaşı - Karaoğlan Mh. - Oğulbey Mh. - Karaali Mh.",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 90,
    sureDk: 105,
    kategori: "kirsal",
    saatler: {
      haftaici: ["06:30", "07:30", "15:00", "18:00"],
      cumartesi: ["06:30", "19:00"],
      pazar: ["06:30", "19:00"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Vilayetler", "Serkent Sitesi", "71.Cd.", "Rüyakent Sitesi", "Karaoğlan Mahallesi", "Serpme Evler Durağı", "Karaoğlan Cami", "Gençler Durağı", "Neru", "Maç Gıda", "Karaoğlan Köy Girişi", "1.Bölge Yerleşkesi", "Kantar Durağı", "Oğulbey Yolu", "Oğulbey Mahallesi", "Çeşme Durağı", "Oğulbey İlköğretim Okulu", "Oğulbey Cami", "Oğulbey Kavşağı", "Vergi Kontrol", "İş Makineleri", "Yağlıpınar Kavşağı", "Tepe Mobilya", "Türksat", "Alçı Fabrikası", "Adore Mobilya", "Ahiboz Giriş", "Ahiboz Jandarma", "Ahiboz İlköğretim Okulu", "İtfaiye Durağı", "Demir Grup", "Günalan Yolu", "Yörem Villaları", "Angera Doğal Yaşam Köyü", "Kırkevler Sitesi", "Karaali Yolu", "Çeşme", "Karaali Son Durak", "Karaali İlköğretim Okulu", "Mandıra Durağı", "Çocuk Parkı", "Karaali Cami", "Belediye Garajı", "Sakarya Cd.", "Ahiboz Yolu", "Ahiboz Çıkış", "Oğulbey Köyü", "Muayene İstasyonu", "Diş Hastanesi", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
    notlar: "06:30 karaali 12049 no lu duraktan başlar",
  },
  {
    no: "182",
    ad: "Gölbaşı - Gökçehöyük - Subaşı Mahallesi",
    kalkis: "Bahçelievler Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 93,
    sureDk: 110,
    kategori: "kirsal",
    saatler: {
      haftaici: ["06:00", "17:00", "19:15"],
      cumartesi: ["06:00", "12:30", "19:15"],
      pazar: ["12:30", "19:15"],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Belediyesi", "Jandarma", "Baldudak İlkokulu", "Cemre Parkı", "774 Sk.", "Güzel Yalı Evleri", "Gölkonakları", "Mogan Park", "Patalya Otel", "Sayıştay Eğitim Merkezi", "Çevre Ve Orman Bakanlığı Labaratuvarı", "Aquapark", "Hacılar Kavşağı", "431.Sk.", "Haymana Yolu", "Gölbaşı Haymana Yolu", "Hacıhasan Kavşağı", "Oğuz Sitesi", "Ballıkpınar Kavşağı", "Mogan Sevgi Çiçeği Evleri", "Çayırkuşu", "Yavrucak Mahallesi", "Velihimmetli Kavşağı", "Fatih Çiftliği", "Demirel Kardeşler Çiftliği", "Gökçehöyük İlköğretim Okulu", "Mezarlık", "Köy Pazarı", "Haberciler Sitesi", "Gökçenar Sitesi", "Görece Sitesi", "Beydağı Yapı Kooperatifi", "Doka", "İkizce", "Çiftlik Durağı", "Topaklı Mahallesi", "Topaklı İlköğretim Okulu", "Topaklı Mezarlık", "Topaklı", "Çayırlı Mahallesi Giriş", "Çayırlı Köyü İlkokulu", "Çayırlı Mahallesi", "Tavuk Çiftliği", "Çeşme Durağı", "Subaşı Son Durak", "Deveci Mahallesi", "Deveci Köyü Cami", "Gökçehöyük Mahallesi", "Gökçehöyük Çıkış", "Balıkpınar Kavşağı", "Kardelen Evleri", "Hacı Hasan Kavşağı", "Demka Tel Örgü", "Mogan Parkı", "Osmanlı Parkı", "Diş Hastanesi", "Başkent Sitesi", "Yeşil Dostlar Sitesi"
    ],
  },
  {
    no: "118-1",
    ad: "Gölbaşı TOKİ - Çukurambar - 100.Yıl",
    kalkis: "Bahçelievler Mh.",
    varis: "İşçi Blokları Mh.",
    mesafeKm: 33,
    sureDk: 60,
    kategori: "golbasi-ici",
    saatler: {
      haftaici: ["06:50"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Gölbaşı Hareket Noktası", "Yunus Emre Camii", "Kır Çiçeği Evleri", "35.Cd.", "Milli İrade Öğrenci Yurdu", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Ankara Üniversitesi Teknokent", "Öğrenci Yurtları", "Cumhuriyet Parkı", "Gölbaşı Kaymakamlık", "Mevlana Parkı", "936.Sk.", "Şehit Oğuz Kaan Usta", "Seymenler", "Şehir Parkı", "İmam Hatip Lisesi", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "Kreş Durağı", "Eymir Yurdu", "Erdem Beyazıt Anadolu Lisesi", "Tuz Gölü Cd.", "Gediz Sk.", "Eğirdir Gölü Cd.", "Köyceğiz Gölü Cd.", "Belmek", "Park Eymir Ticaret Merkezi", "Manyas Gölü Cd.", "Yıldız Camii", "Sapanca Gölü Cd.", "Akçay Cd.", "Adem Bilhan Uysal İlkokulu", "Işıklı Göl Durağı", "Yedigöller Cd.", "Şht.sebahattin Koçak Anadolu İmam Hatip Lise", "Hilal Camii", "Safa Okulları", "Kaymak Sitesi", "Eymir Ve Şafak Mahallesi Muhtarlığı", "Cemil Yıldırım Orta Okulu", "Cumhuriyet Spor Salonu", "Gölbaşı Mezarlığı", "Gölbaşı Sanayi Sitesi", "Avm 1.Durak", "Avm 2.Durak", "Avm 3.Durak", "İncek Kavşağı", "Dikmen Kavşağı", "Çeşme", "Akpınar", "Turhan Dökmeci İlköğretim Okulu", "Akpınar Mahallesi", "Gökkuşağı Mahallesi", "Koşuyolu Parkı", "Fen Lisesi", "Taurus Avm", "Onur Sitesi", "Firdevs Camii", "Engelsiz Çocuk Parkı", "Çukurambar Tuğba Altınok Camii", "Kuruçay Sitesi", "Öğretmenler Parkı", "İlhan Erdost Durağı", "Merkez Çarşı", "Kılıçaslan Lisesi", "Pazar Yeri"
    ],
    notlar: "Sadece hafta içi çalışır, 14043 no lu duraktan başlar",
  },
  {
    no: "118-2",
    ad: "100.Yıl - Çukurambar - Gölbaşı TOKİ",
    kalkis: "İşçi Blokları Mh.",
    varis: "Bahçelievler Mh.",
    mesafeKm: 32,
    sureDk: 60,
    kategori: "golbasi-ici",
    saatler: {
      haftaici: ["15:15"],
      cumartesi: [],
      pazar: [],
    },
    duraklar: [
      "Pazar Yeri", "Ezgi Evleri", "Merkez Çarşı", "Üçgen Çarşı", "Öğretmenler Parkı", "Kuruçay Sitesi", "Çukurambar Tuğba Altınok Camii", "Engelsiz Çocuk Parkı", "Firdevs Camii", "Yeni Konak", "Balgat Köprüsü", "Taurus Avm", "Fen Lisesi", "Ardiye", "Gökkuşağı Mahallesi", "Akpınar Mahallesi", "Turhan Dökmeci İlköğretim Okulu", "Çeşme", "Dikmen Kavşağı", "İncek Kavşağı", "Avm Durağı", "Sanayi Sitesi", "Haymana Yolu", "Yunus Emre Parkı", "Cumhuriyet Spor Salonu", "Cemil Yıldırım Orta Okulu", "Tek Camii", "Kaymak Sitesi", "Şehir Parkı", "İmam Hatip Lisesi", "Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi", "Kreş Durağı", "Eymir Yurdu", "Erdem Beyazıt Anadolu Lisesi", "Tuz Gölü Cd.", "Hilal Cami", "Şht.sebahattin Koçak Anadolu İmam Hatip Lise", "Yedigöller Cd.", "Işıklı Göl Durağı", "Adem Bilhan Uysal İlkokulu", "Akçay Cd.", "Sapanca Gölü Cd.", "Yıldız Camii", "Manyas Gölü Cd.", "Park Eymir Ticaret Merkezi", "Belmek", "Köyceğiz Gölü Cd.", "Eğirdir Gölü Cd.", "Gediz Sk.", "Safa Okulları", "Seymenler", "Şehit Oğuz Kaan Usta", "936.Sk.", "Mevlana Parkı", "Gölbaşı Kaymakamlık", "Öğrenci Yurtları", "Ankara Üniversitesi Teknokent", "Gölbaşı Şehit Özel Harekatçılar Öğrenci Yurdu", "Milli İrade Öğrenci Yurdu", "35.Cd.", "Başkent Sitesi", "Yunus Emre Camii", "Yeşil Dostlar Sitesi"
    ],
    notlar: "Sadece hafta içi çalışır, 100.yıl pazar yeri 10819 no lu duraktan başlar",
  }
];
