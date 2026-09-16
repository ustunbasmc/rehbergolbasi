export interface Mahalle {
  slug: string;
  name: string;
  /** businesses.neighborhood ve gundem_posts.neighborhoods'taki ham (normalize edilmemiş) yazım varyasyonları. */
  aliases: string[];
  intro: string;
  population2023: number;
  muhtar: {
    name: string;
    phone?: string;
    mobile: string;
  };
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
 */
export const MAHALLELER: Mahalle[] = [
  {
    slug: "bahcelievler",
    name: "Bahçelievler",
    aliases: ["Bahçelievler Mahallesi", "Bahçelievler"],
    intro:
      "Bahçelievler Mahallesi, Gölbaşı ilçesinin idari merkezidir — Kaymakamlık, Nüfus Müdürlüğü, Vergi Dairesi, İlçe Millî Eğitim Müdürlüğü ve Tapu Müdürlüğü gibi ilçenin neredeyse tüm resmi kurumları bu mahallede, Hükümet Konağı çevresinde toplanmıştır. 2023 ADNKS verilerine göre 27.184 nüfusuyla Gölbaşı'nın en kalabalık mahallesidir.\n\nResmi kurumların yanı sıra öğrenci yurtları, kuaför ve güzellik salonları, döner ve fast-food restoranları gibi günlük ihtiyaçlara yönelik işletmeler de yoğun olarak bu mahallede yer almaktadır. İlçe merkezine yakınlığı sayesinde Gölbaşı'nın en işlek ve ulaşımı kolay mahallelerinden biridir.",
    population2023: 27184,
    muhtar: { name: "Cihat Ceylan", mobile: "0532 589 42 51" },
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
    muhtar: { name: "Murat Elmas", mobile: "0530 405 04 74" },
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
    muhtar: { name: "Hasan Tümer", phone: "(0312) 484 11 28", mobile: "0507 669 78 80" },
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
    muhtar: { name: "Dilek Orbay", phone: "(0312) 484 47 00", mobile: "0505 235 39 17" },
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
    muhtar: { name: "Gülay Candemir", phone: "(0312) 484 88 84", mobile: "0536 895 80 51" },
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
