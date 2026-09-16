export interface Mahalle {
  slug: string;
  name: string;
  /** businesses.neighborhood ve gundem_posts.neighborhoods'taki ham (normalize edilmemiş) yazım varyasyonları. */
  aliases: string[];
  intro: string;
  population2023: number;
  /** TÜİK ADNKS, yıl bazlı — tr.wikipedia.org üzerinden doğrulandı. */
  populationHistory: { year: number; count: number }[];
  muhtar: {
    name: string;
    phone?: string;
    mobile: string;
    /** Muhtarlık binasının Google Haritalar'da doğrulanmış konumu (tam POI eşleşmesi). */
    officeLat: number;
    officeLng: number;
  };
  /** Mahallenin genel merkez koordinatı (tr.wikipedia.org). */
  lat: number;
  lng: number;
}

/**
 * Şu an sitede yeterli işletmesi olan (≥5) mahalleler — sayfa yayınlama eşiği.
 * Gölbaşı'nda resmi olarak 53 mahalle var (ankaragolbasi.bel.tr/muhtarliklar),
 * ama geri kalanı için henüz işletme verisi yok; boş/içeriksiz sayfa açmamak
 * için bilerek dışarıda bırakıldı. Yeni bir mahalle işletme biriktirdikçe
 * buraya bir kayıt eklemek yeterli.
 *
 * Nüfus verileri: TÜİK ADNKS 2023, tr.wikipedia.org üzerinden doğrulandı.
 * Muhtar bilgileri: ankaragolbasi.bel.tr/muhtarliklar (resmi kaynak).
 * Muhtarlık ofis konumları: Google Haritalar'da "[Mahalle] Mahallesi Muhtarlığı"
 * aramasıyla tam POI eşleşmesi bulunarak doğrulandı.
 */
export const MAHALLELER: Mahalle[] = [
  {
    slug: "bahcelievler",
    name: "Bahçelievler",
    aliases: ["Bahçelievler Mahallesi", "Bahçelievler"],
    intro:
      "Bahçelievler Mahallesi, Gölbaşı ilçesinin idari merkezidir — Kaymakamlık, Nüfus Müdürlüğü, Vergi Dairesi, İlçe Millî Eğitim Müdürlüğü ve Tapu Müdürlüğü gibi ilçenin neredeyse tüm resmi kurumları bu mahallede, Hükümet Konağı çevresinde toplanmıştır. 2023 ADNKS verilerine göre 27.184 nüfusuyla Gölbaşı'nın en kalabalık mahallesidir.\n\nResmi kurumların yanı sıra öğrenci yurtları, kuaför ve güzellik salonları, döner ve fast-food restoranları gibi günlük ihtiyaçlara yönelik işletmeler de yoğun olarak bu mahallede yer almaktadır. İlçe merkezine yakınlığı sayesinde Gölbaşı'nın en işlek ve ulaşımı kolay mahallelerinden biridir.",
    population2023: 27184,
    populationHistory: [
      { year: 2007, count: 12881 },
      { year: 2008, count: 14173 },
      { year: 2009, count: 14679 },
      { year: 2010, count: 15061 },
      { year: 2011, count: 15552 },
      { year: 2012, count: 17184 },
      { year: 2013, count: 17385 },
      { year: 2014, count: 18242 },
      { year: 2015, count: 18759 },
      { year: 2016, count: 17713 },
      { year: 2017, count: 22065 },
      { year: 2018, count: 22549 },
      { year: 2019, count: 24267 },
      { year: 2020, count: 23017 },
      { year: 2021, count: 23574 },
      { year: 2022, count: 25960 },
      { year: 2023, count: 27184 },
    ],
    muhtar: {
      name: "Cihat Ceylan",
      mobile: "0532 589 42 51",
      officeLat: 39.7899111,
      officeLng: 32.8072206,
    },
    lat: 39.79,
    lng: 32.81,
  },
  {
    slug: "segmenler",
    name: "Seğmenler",
    aliases: ["Seğmenler Mahallesi", "Seğmenler"],
    intro:
      "Seğmenler Mahallesi, Gölbaşı Şehit Ahmet Özsoy Devlet Hastanesi'ne ev sahipliği yapan, 2023 ADNKS verilerine göre 21.720 nüfuslu geniş bir yerleşim bölgesidir. Mahalle, ilçenin sağlık hizmetlerinin merkezinde yer almasının yanı sıra yoğun bir esnaf ve hizmet ağına da sahiptir.\n\nElektrikçiden çeyiz mağazasına, anaokulundan sürücü kursuna, fast-food restoranlarından güzellik salonlarına kadar geniş bir yelpazede işletme Seğmenler'de hizmet vermektedir.",
    population2023: 21720,
    populationHistory: [
      { year: 2007, count: 12588 },
      { year: 2008, count: 13063 },
      { year: 2009, count: 13957 },
      { year: 2010, count: 14345 },
      { year: 2011, count: 14786 },
      { year: 2012, count: 16149 },
      { year: 2013, count: 15993 },
      { year: 2014, count: 16157 },
      { year: 2015, count: 17185 },
      { year: 2016, count: 17743 },
      { year: 2017, count: 18362 },
      { year: 2018, count: 18085 },
      { year: 2019, count: 19479 },
      { year: 2020, count: 20508 },
      { year: 2021, count: 21050 },
      { year: 2022, count: 21854 },
      { year: 2023, count: 21720 },
    ],
    muhtar: {
      name: "Murat Elmas",
      mobile: "0530 405 04 74",
      officeLat: 39.7892883,
      officeLng: 32.8153915,
    },
    lat: 39.78997,
    lng: 32.82153,
  },
  {
    slug: "gaziosmanpasa",
    name: "Gaziosmanpaşa",
    aliases: ["Gaziosmanpaşa Mahallesi", "Gaziosmanpaşa"],
    intro:
      "Gaziosmanpaşa Mahallesi, Gölbaşı Belediyesi'nin Sahil Caddesi üzerindeki binasına, İlçe Jandarma Komutanlığı'na ve Hasan Celal Güzel İlçe Halk Kütüphanesi'ne ev sahipliği yapan, ilçenin göl kıyısındaki idari ve sosyal merkezlerinden biridir. 2023 ADNKS verilerine göre 7.854 nüfusuyla merkez mahalleler arasında en küçüğü olsa da, konumu itibarıyla Gölbaşı'nın en işlek noktalarından biridir.\n\nPTT şubesi, oteller, kahvaltı salonları ve pastaneler de dahil olmak üzere göl kıyısı boyunca çeşitli işletmeler bu mahallede yer almaktadır.",
    population2023: 7854,
    populationHistory: [
      { year: 2007, count: 6056 },
      { year: 2008, count: 6214 },
      { year: 2009, count: 6646 },
      { year: 2010, count: 6877 },
      { year: 2011, count: 7155 },
      { year: 2012, count: 7481 },
      { year: 2013, count: 7793 },
      { year: 2014, count: 8008 },
      { year: 2015, count: 8068 },
      { year: 2016, count: 8163 },
      { year: 2017, count: 8105 },
      { year: 2018, count: 7709 },
      { year: 2019, count: 7881 },
      { year: 2020, count: 7898 },
      { year: 2021, count: 7996 },
      { year: 2022, count: 7998 },
      { year: 2023, count: 7854 },
    ],
    muhtar: {
      name: "Hasan Tümer",
      phone: "(0312) 484 11 28",
      mobile: "0507 669 78 80",
      officeLat: 39.79658,
      officeLng: 32.8059112,
    },
    lat: 39.79193,
    lng: 32.80378,
  },
  {
    slug: "eymir",
    name: "Eymir",
    aliases: ["Eymir Mahallesi", "Eymir"],
    intro:
      "Eymir Mahallesi, adını yakınındaki Eymir Gölü'nden alan, son 15 yılda hızla büyüyen bir Gölbaşı mahallesidir — nüfusu 2008'de 4.100 iken 2023 ADNKS verilerine göre 23.782'ye ulaşmıştır. Bu hızlı büyüme, mahalleyi ailelerin ve genç nüfusun tercih ettiği bir yerleşim bölgesi haline getirmiştir.\n\nMahalledeki işletmeler de bu aile profiline uygun şekilde şekillenmiştir: anaokulu ve gündüz bakımevleri, çocuk gelişimi ve aile danışmanlığı hizmetleri Eymir'de öne çıkan hizmet alanları arasındadır.",
    population2023: 23782,
    populationHistory: [
      { year: 2008, count: 4100 },
      { year: 2009, count: 6417 },
      { year: 2010, count: 12484 },
      { year: 2011, count: 19808 },
      { year: 2012, count: 21937 },
      { year: 2013, count: 22719 },
      { year: 2014, count: 23019 },
      { year: 2015, count: 24000 },
      { year: 2016, count: 24368 },
      { year: 2017, count: 24803 },
      { year: 2018, count: 25437 },
      { year: 2019, count: 25798 },
      { year: 2020, count: 25076 },
      { year: 2021, count: 23324 },
      { year: 2022, count: 24605 },
      { year: 2023, count: 23782 },
    ],
    muhtar: {
      name: "Dilek Orbay",
      phone: "(0312) 484 47 00",
      mobile: "0505 235 39 17",
      officeLat: 39.7910997,
      officeLng: 32.8505417,
    },
    lat: 39.80211,
    lng: 32.83531,
  },
  {
    slug: "karsiyaka",
    name: "Karşıyaka",
    aliases: ["Karşıyaka Mahallesi", "Karşıyaka"],
    intro:
      "Karşıyaka Mahallesi, adını Mogan Gölü'nün karşı kıyısında yer almasından alan, 2023 ADNKS verilerine göre 14.678 nüfuslu bir Gölbaşı mahallesidir. Göl manzaralı konumu, mahalleyi otel ve düğün/etkinlik salonları için tercih edilen bir bölge haline getirmiştir.\n\nMahallede göl kenarı otelleri, düğün ve balo salonları ile özel eğitim kurumları bir arada bulunmaktadır.",
    population2023: 14678,
    populationHistory: [
      { year: 2007, count: 4993 },
      { year: 2008, count: 6524 },
      { year: 2009, count: 7493 },
      { year: 2010, count: 8144 },
      { year: 2011, count: 9010 },
      { year: 2012, count: 9752 },
      { year: 2013, count: 10093 },
      { year: 2014, count: 10747 },
      { year: 2015, count: 11237 },
      { year: 2016, count: 11787 },
      { year: 2017, count: 12324 },
      { year: 2018, count: 12049 },
      { year: 2019, count: 12744 },
      { year: 2020, count: 13318 },
      { year: 2021, count: 13874 },
      { year: 2022, count: 14513 },
      { year: 2023, count: 14678 },
    ],
    muhtar: {
      name: "Gülay Candemir",
      phone: "(0312) 484 88 84",
      mobile: "0536 895 80 51",
      officeLat: 39.7992062,
      officeLng: 32.7999796,
    },
    lat: 39.79685,
    lng: 32.79789,
  },
];

export function getMahalleBySlug(slug: string): Mahalle | undefined {
  return MAHALLELER.find((m) => m.slug === slug);
}

/** `normalizeNeighborhood()` çıktısı olan kurallı isimden mahalle kaydını bulur. */
export function getMahalleByName(name: string): Mahalle | undefined {
  return MAHALLELER.find((m) => m.name === name);
}
