export interface Mahalle {
  slug: string;
  name: string;
  /** businesses.neighborhood ve gundem_posts.neighborhoods'taki ham (normalize edilmemiş) yazım varyasyonları. */
  aliases: string[];
  intro: string;
  /**
   * TÜİK ADNKS, yalnızca "merkez mahalle" olan 7 mahalle için (Bahçelievler,
   * Seğmenler, Gaziosmanpaşa, Eymir, Karşıyaka, Şafak, Örencik) tr.wikipedia.org
   * üzerinden doğrulanabildi — kırsal mahallelerin Wikipedia stub makalelerinde
   * nüfus verisi yok, bu yüzden bilinçli olarak boş bırakıldı (uydurma yok).
   */
  population2023?: number;
  populationHistory?: { year: number; count: number }[];
  muhtar: {
    name: string;
    phone?: string;
    mobile: string;
    /**
     * Muhtarlık binasının Google Haritalar'da doğrulanmış konumu (tam POI
     * eşleşmesi). Bulunamayan/araştırılmamış kırsal mahallelerde belirtilmez —
     * bu durumda sayfa mahalle merkezinin (lat/lng) konumunu kullanır.
     */
    officeLat?: number;
    officeLng?: number;
  };
  /** Mahallenin genel merkez koordinatı (tr.wikipedia.org veya Google Haritalar). */
  lat: number;
  lng: number;
}

const TURKISH_VOWEL_GROUP: Record<string, string> = {
  a: "ı", ı: "ı", e: "i", i: "i", o: "u", u: "u", ö: "ü", ü: "ü",
};
const TURKISH_VOICELESS_CONSONANTS = new Set(["f", "s", "t", "k", "ç", "ş", "h", "p"]);

/** "Koç" -> "'tur", "Ağören" -> "'dir", "Yılmaz" -> "'dır" (ünlü/ünsüz uyumuna göre ek-fiil "-dır"). */
export function turkishDirSuffix(name: string): string {
  const lower = name.toLocaleLowerCase("tr-TR");
  let vowelGroup = "ı";
  for (let i = lower.length - 1; i >= 0; i--) {
    const group = TURKISH_VOWEL_GROUP[lower[i]];
    if (group) {
      vowelGroup = group;
      break;
    }
  }
  const lastChar = lower[lower.length - 1];
  const consonant = TURKISH_VOICELESS_CONSONANTS.has(lastChar) ? "t" : "d";
  return `'${consonant}${vowelGroup}r`;
}

function genericIntro(name: string, muhtarName: string, extra?: string): string {
  const extraSentence = extra ? ` ${extra}` : "";
  return `${name} Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı bir mahalledir.${extraSentence} Mahalle muhtarı ${muhtarName}${turkishDirSuffix(muhtarName)}.\n\nBu mahalledeki işletmeler RehberGölbaşı'na eklendikçe burada listelenecektir — mahallenizde bir işletme işletiyorsanız ilk sırada yer almak için hemen ekleyebilirsiniz.`;
}

/**
 * Gölbaşı'nın resmi 53 mahallesinin tamamı (ankaragolbasi.bel.tr/muhtarliklar
 * ile doğrulandı). 7 "merkez mahalle" (Bahçelievler, Seğmenler, Gaziosmanpaşa,
 * Eymir, Karşıyaka, Şafak, Örencik) zengin içerik (nüfus trendi, araştırılmış
 * tanıtım metni, doğrulanmış muhtarlık ofis konumu) içerir; diğer 46 kırsal
 * mahalle için nüfus verisi/ofis konumu güvenilir bir kaynakta bulunamadığından
 * eklenmedi — sayfa yine de aynı formatta (muhtar, harita, işletme grupları,
 * SSS) yayınlanır ve işletme eklendikçe otomatik olarak listeye girer.
 *
 * Muhtar bilgileri: ankaragolbasi.bel.tr/muhtarliklar (resmi kaynak).
 * Koordinatlar: tr.wikipedia.org mahalle infobox'ları veya Google Haritalar'da
 * tam POI eşleşmesi (kırsal mahalleler için OpenStreetMap Nominatim / Google
 * Haritalar arama sonucu — bazıları yaklaşık merkez koordinatıdır).
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
      { year: 2007, count: 12881 }, { year: 2008, count: 14173 }, { year: 2009, count: 14679 },
      { year: 2010, count: 15061 }, { year: 2011, count: 15552 }, { year: 2012, count: 17184 },
      { year: 2013, count: 17385 }, { year: 2014, count: 18242 }, { year: 2015, count: 18759 },
      { year: 2016, count: 17713 }, { year: 2017, count: 22065 }, { year: 2018, count: 22549 },
      { year: 2019, count: 24267 }, { year: 2020, count: 23017 }, { year: 2021, count: 23574 },
      { year: 2022, count: 25960 }, { year: 2023, count: 27184 },
    ],
    muhtar: { name: "Cihat Ceylan", mobile: "0532 589 42 51", officeLat: 39.7899111, officeLng: 32.8072206 },
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
      { year: 2007, count: 12588 }, { year: 2008, count: 13063 }, { year: 2009, count: 13957 },
      { year: 2010, count: 14345 }, { year: 2011, count: 14786 }, { year: 2012, count: 16149 },
      { year: 2013, count: 15993 }, { year: 2014, count: 16157 }, { year: 2015, count: 17185 },
      { year: 2016, count: 17743 }, { year: 2017, count: 18362 }, { year: 2018, count: 18085 },
      { year: 2019, count: 19479 }, { year: 2020, count: 20508 }, { year: 2021, count: 21050 },
      { year: 2022, count: 21854 }, { year: 2023, count: 21720 },
    ],
    muhtar: { name: "Murat Elmas", mobile: "0530 405 04 74", officeLat: 39.7892883, officeLng: 32.8153915 },
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
      { year: 2007, count: 6056 }, { year: 2008, count: 6214 }, { year: 2009, count: 6646 },
      { year: 2010, count: 6877 }, { year: 2011, count: 7155 }, { year: 2012, count: 7481 },
      { year: 2013, count: 7793 }, { year: 2014, count: 8008 }, { year: 2015, count: 8068 },
      { year: 2016, count: 8163 }, { year: 2017, count: 8105 }, { year: 2018, count: 7709 },
      { year: 2019, count: 7881 }, { year: 2020, count: 7898 }, { year: 2021, count: 7996 },
      { year: 2022, count: 7998 }, { year: 2023, count: 7854 },
    ],
    muhtar: { name: "Hasan Tümer", phone: "(0312) 484 11 28", mobile: "0507 669 78 80", officeLat: 39.79658, officeLng: 32.8059112 },
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
      { year: 2008, count: 4100 }, { year: 2009, count: 6417 }, { year: 2010, count: 12484 },
      { year: 2011, count: 19808 }, { year: 2012, count: 21937 }, { year: 2013, count: 22719 },
      { year: 2014, count: 23019 }, { year: 2015, count: 24000 }, { year: 2016, count: 24368 },
      { year: 2017, count: 24803 }, { year: 2018, count: 25437 }, { year: 2019, count: 25798 },
      { year: 2020, count: 25076 }, { year: 2021, count: 23324 }, { year: 2022, count: 24605 },
      { year: 2023, count: 23782 },
    ],
    muhtar: { name: "Dilek Orbay", phone: "(0312) 484 47 00", mobile: "0505 235 39 17", officeLat: 39.7910997, officeLng: 32.8505417 },
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
      { year: 2007, count: 4993 }, { year: 2008, count: 6524 }, { year: 2009, count: 7493 },
      { year: 2010, count: 8144 }, { year: 2011, count: 9010 }, { year: 2012, count: 9752 },
      { year: 2013, count: 10093 }, { year: 2014, count: 10747 }, { year: 2015, count: 11237 },
      { year: 2016, count: 11787 }, { year: 2017, count: 12324 }, { year: 2018, count: 12049 },
      { year: 2019, count: 12744 }, { year: 2020, count: 13318 }, { year: 2021, count: 13874 },
      { year: 2022, count: 14513 }, { year: 2023, count: 14678 },
    ],
    muhtar: { name: "Gülay Candemir", phone: "(0312) 484 88 84", mobile: "0536 895 80 51", officeLat: 39.7992062, officeLng: 32.7999796 },
    lat: 39.79685,
    lng: 32.79789,
  },
  {
    slug: "safak",
    name: "Şafak",
    aliases: ["Şafak Mahallesi", "Şafak"],
    intro:
      "Şafak Mahallesi, Gölbaşı Mezarlığı'na ev sahipliği yapan, 2023 ADNKS verilerine göre 10.217 nüfuslu bir Gölbaşı mahallesidir. İlçe merkezine yakın konumu sayesinde Gölbaşı İlçe Emniyet Müdürlüğü ve Gölbaşı Müftülüğü gibi kurumlar da bu mahallede yer almaktadır.\n\nMahalle, hem resmi kurumlara yakınlığı hem de yerleşik nüfusuyla Gölbaşı'nın merkez mahallelerinden biri olarak öne çıkmaktadır.",
    population2023: 10217,
    populationHistory: [
      { year: 2007, count: 11066 }, { year: 2008, count: 8185 }, { year: 2009, count: 8345 },
      { year: 2010, count: 9064 }, { year: 2011, count: 9524 }, { year: 2012, count: 9765 },
      { year: 2013, count: 10085 }, { year: 2014, count: 10492 }, { year: 2015, count: 10762 },
      { year: 2016, count: 10935 }, { year: 2017, count: 10445 }, { year: 2018, count: 9953 },
      { year: 2019, count: 10287 }, { year: 2020, count: 10346 }, { year: 2021, count: 10257 },
      { year: 2022, count: 10500 }, { year: 2023, count: 10217 },
    ],
    muhtar: { name: "Bayram Özkan", phone: "(0312) 485 72 72", mobile: "0536 253 70 09", officeLat: 39.7975414, officeLng: 32.816543 },
    lat: 39.7958,
    lng: 32.80937,
  },
  {
    slug: "orencik",
    name: "Örencik",
    aliases: ["Örencik Mahallesi", "Örencik"],
    intro:
      "Örencik Mahallesi, Ankara'ya 23 km, Gölbaşı ilçe merkezine ise yalnızca 3 km uzaklıkta yer alan bir mahalledir. 2023 ADNKS verilerine göre 1.218 nüfusuyla merkez mahalleler arasında en az nüfuslu olanıdır.\n\nGölbaşı'nın tarihi köklerinden biri olan Örencik, ilçenin eski adı olan \"Gölhanı\"nın bağlı olduğu köy olması nedeniyle Gölbaşı'nın kuruluş tarihinde önemli bir yere sahiptir.",
    population2023: 1218,
    populationHistory: [
      { year: 2007, count: 1115 }, { year: 2008, count: 1148 }, { year: 2009, count: 1109 },
      { year: 2010, count: 1035 }, { year: 2011, count: 994 }, { year: 2012, count: 1041 },
      { year: 2013, count: 1069 }, { year: 2014, count: 1081 }, { year: 2015, count: 1087 },
      { year: 2016, count: 1040 }, { year: 2017, count: 1097 }, { year: 2018, count: 1078 },
      { year: 2019, count: 1085 }, { year: 2020, count: 1041 }, { year: 2021, count: 1050 },
      { year: 2022, count: 1074 }, { year: 2023, count: 1218 },
    ],
    muhtar: { name: "Lokman Çakır", mobile: "0542 292 30 07", officeLat: 39.7804158, officeLng: 32.8359128 },
    lat: 39.782587,
    lng: 32.834915,
  },

  // --- Kırsal mahalleler: nüfus verisi/kesin ofis konumu bulunamadı, aynı
  // sayfa formatı (muhtar, harita, işletme grupları, SSS) yine de geçerlidir.
  {
    slug: "akorencarsak",
    name: "Akörençarsak",
    aliases: ["Akörençarsak Mahallesi", "Akörençarsak"],
    intro: genericIntro("Akörençarsak", "Abdullah Ağören"),
    muhtar: { name: "Abdullah Ağören", mobile: "0531 790 43 96" },
    lat: 39.3213155,
    lng: 32.9485065,
  },
  {
    slug: "altincanak",
    name: "Altınçanak",
    aliases: ["Altınçanak Mahallesi", "Altınçanak", "Altunçanak"],
    intro: genericIntro("Altınçanak", "İhsan Özbek", "Mahalle, eskiden Balâ ilçesine bağlı bir köyken sonradan Gölbaşı'na bağlanmıştır."),
    muhtar: { name: "İhsan Özbek", mobile: "0534 550 11 71" },
    lat: 39.2650533,
    lng: 32.9223014,
  },
  {
    slug: "bagici",
    name: "Bağiçi",
    aliases: ["Bağiçi Mahallesi", "Bağiçi"],
    intro: genericIntro("Bağiçi", "Zeki Doğan"),
    muhtar: { name: "Zeki Doğan", mobile: "0532 462 56 73" },
    lat: 39.537796,
    lng: 32.909725,
  },
  {
    slug: "ballikpinar",
    name: "Ballıkpınar",
    aliases: ["Ballıkpınar Mahallesi", "Ballıkpınar"],
    intro: genericIntro(
      "Ballıkpınar",
      "Yılmaz Akbay",
      "Gölbaşı'ya 12 km uzaklıktaki mahalle, Kırım Tatar Türk nüfusunun yoğun olduğu bir yerleşim birimidir ve hafta sonları piknik için tercih edilen bir sayfiye yeridir."
    ),
    muhtar: { name: "Yılmaz Akbay", phone: "(0312) 499 40 31", mobile: "0533 958 71 23" },
    lat: 39.734459,
    lng: 32.7150987,
  },
  {
    slug: "bezirhane",
    name: "Bezirhane",
    aliases: ["Bezirhane Mahallesi", "Bezirhane"],
    intro: genericIntro("Bezirhane", "Feridun Uzumer", "Mahalle, Gölbaşı'nın bir yamaç mahallesidir."),
    muhtar: { name: "Feridun Uzumer", mobile: "0532 485 16 39" },
    lat: 39.4808861,
    lng: 32.8522676,
  },
  {
    slug: "boyalik",
    name: "Boyalık",
    aliases: ["Boyalık Mahallesi", "Boyalık"],
    intro: genericIntro("Boyalık", "Ahmet Serdar Yılmaz"),
    muhtar: { name: "Ahmet Serdar Yılmaz", mobile: "0537 680 65 54" },
    lat: 39.4744862,
    lng: 32.6664206,
  },
  {
    slug: "celtek",
    name: "Çeltek",
    aliases: ["Çeltek Mahallesi", "Çeltek"],
    intro: genericIntro("Çeltek", "Rasim Ak", "Mahalle, ilçenin en uzak yerleşimlerinden biri olup Ankara'ya 70 km, Haymana ilçesine ise 43 km uzaklıktadır."),
    muhtar: { name: "Rasim Ak", mobile: "0541 386 10 40" },
    lat: 39.279453,
    lng: 32.865177,
  },
  {
    slug: "cimsit",
    name: "Çimşit",
    aliases: ["Çimşit Mahallesi", "Çimşit"],
    intro: genericIntro("Çimşit", "Recep Demirel"),
    muhtar: { name: "Recep Demirel", mobile: "0535 977 66 67" },
    lat: 39.430328,
    lng: 32.891361,
  },
  {
    slug: "cayirli",
    name: "Çayırlı",
    aliases: ["Çayırlı Mahallesi", "Çayırlı"],
    intro: genericIntro("Çayırlı", "Nejdet Ökmen"),
    muhtar: { name: "Nejdet Ökmen", mobile: "0537 214 63 44" },
    lat: 39.630085,
    lng: 32.588692,
  },
  {
    slug: "dikilitas",
    name: "Dikilitaş",
    aliases: ["Dikilitaş Mahallesi", "Dikilitaş"],
    intro: genericIntro("Dikilitaş", "Ercan Öztürk", "Mahalle, Oyaca kasabası sınırları içinde yer almaktadır."),
    muhtar: { name: "Ercan Öztürk", phone: "(0312) 651 30 31", mobile: "0533 810 38 39" },
    lat: 39.551559,
    lng: 32.702043,
  },
  {
    slug: "emirler",
    name: "Emirler",
    aliases: ["Emirler Mahallesi", "Emirler"],
    intro: genericIntro("Emirler", "Sinan Gökkoyun"),
    muhtar: { name: "Sinan Gökkoyun", mobile: "0535 322 53 30" },
    lat: 39.416667,
    lng: 32.916667,
  },
  {
    slug: "golbek",
    name: "Gölbek",
    aliases: ["Gölbek Mahallesi", "Gölbek"],
    intro: genericIntro("Gölbek", "Kerem Çetinkaya"),
    muhtar: { name: "Kerem Çetinkaya", mobile: "0533 653 92 45" },
    lat: 39.321924,
    lng: 32.841545,
  },
  {
    slug: "gokcehoyuk",
    name: "Gökçehöyük",
    aliases: ["Gökçehöyük Mahallesi", "Gökçehöyük", "Gökçehüyük"],
    intro: genericIntro("Gökçehöyük", "Furkan Özgür Gümüş"),
    muhtar: { name: "Furkan Özgür Gümüş", mobile: "0539 643 73 40" },
    lat: 39.6649872,
    lng: 32.7322406,
  },
  {
    slug: "gunalan",
    name: "Günalan",
    aliases: ["Günalan Mahallesi", "Günalan"],
    intro: genericIntro("Günalan", "Şener Karatay"),
    muhtar: { name: "Şener Karatay", mobile: "0532 408 66 77" },
    lat: 39.621267,
    lng: 32.882117,
  },
  {
    slug: "hacihasan",
    name: "Hacıhasan",
    aliases: ["Hacıhasan Mahallesi", "Hacıhasan", "Hacı Hasan"],
    intro: genericIntro(
      "Hacıhasan",
      "Mehmet Mükerrem Çelik",
      "Türkiye'de yalnızca Gölbaşı'nda, Mogan Gölü kıyısında bu mahalle civarında yetişen endemik bir bitki olan Sevgi Çiçeği (Centaurea tchihatcheffii) ile tanınır."
    ),
    muhtar: { name: "Mehmet Mükerrem Çelik", phone: "(0312) 499 91 42", mobile: "0543 375 18 18" },
    lat: 39.7453195,
    lng: 32.7491913,
  },
  {
    slug: "hacilar",
    name: "Hacılar",
    aliases: ["Hacılar Mahallesi", "Hacılar"],
    intro: genericIntro("Hacılar", "Binnur Aykut"),
    muhtar: { name: "Binnur Aykut", mobile: "0532 480 96 27" },
    lat: 39.7684596,
    lng: 32.7124903,
  },
  {
    slug: "hacimuratli",
    name: "Hacımuratlı",
    aliases: ["Hacımuratlı Mahallesi", "Hacımuratlı"],
    intro: genericIntro("Hacımuratlı", "Uğur Açık"),
    muhtar: { name: "Uğur Açık", mobile: "0532 424 51 15" },
    lat: 39.679531,
    lng: 32.700028,
  },
  {
    slug: "halacli",
    name: "Halaçlı",
    aliases: ["Halaçlı Mahallesi", "Halaçlı", "Hallaçlı"],
    intro: genericIntro("Halaçlı", "Mehmet Şahin"),
    muhtar: { name: "Mehmet Şahin", mobile: "0537 964 11 72" },
    lat: 39.707187,
    lng: 32.6054109,
  },
  {
    slug: "ikizce",
    name: "İkizce",
    aliases: ["İkizce Mahallesi", "İkizce"],
    intro: genericIntro("İkizce", "Erkan Gökkaya"),
    muhtar: { name: "Erkan Gökkaya", mobile: "0530 561 08 10" },
    lat: 39.5952709,
    lng: 32.6620319,
  },
  {
    slug: "incek",
    name: "İncek",
    aliases: ["İncek Mahallesi", "İncek"],
    intro: genericIntro("İncek", "Ahmet Alp"),
    muhtar: { name: "Ahmet Alp", mobile: "0532 786 30 19" },
    lat: 39.806389,
    lng: 32.699722,
  },
  {
    slug: "karacaoren",
    name: "Karacaören",
    aliases: ["Karacaören Mahallesi", "Karacaören"],
    intro: genericIntro("Karacaören", "Mehmet Bahattin Şefik"),
    muhtar: { name: "Mehmet Bahattin Şefik", mobile: "0535 390 40 80" },
    lat: 39.364698,
    lng: 32.810503,
  },
  {
    slug: "karaali-merkez",
    name: "Karaali Merkez",
    aliases: ["Karaali Merkez Mahallesi", "Karaali Merkez", "Karaali"],
    intro: genericIntro("Karaali Merkez", "Haydar Yılmaz"),
    muhtar: { name: "Haydar Yılmaz", mobile: "0532 464 47 77" },
    lat: 39.654491,
    lng: 32.944856,
  },
  {
    slug: "karaali-yazlik",
    name: "Karaali Yazlık",
    aliases: ["Karaali Yazlık Mahallesi", "Karaali Yazlık"],
    intro: genericIntro("Karaali Yazlık", "İrfan Erdem"),
    muhtar: { name: "İrfan Erdem", mobile: "0532 230 57 60" },
    lat: 39.6094426,
    lng: 32.9663018,
  },
  {
    slug: "karagedik-aydin",
    name: "Karagedik Aydın",
    aliases: ["Karagedik Aydın Mahallesi", "Karagedik Aydın"],
    intro: genericIntro("Karagedik Aydın", "Fevzi Yüksek"),
    muhtar: { name: "Fevzi Yüksek", mobile: "0542 485 68 69" },
    lat: 39.572442,
    lng: 32.797738,
  },
  {
    slug: "karagedik-ercan",
    name: "Karagedik Ercan",
    aliases: ["Karagedik Ercan Mahallesi", "Karagedik Ercan"],
    intro: genericIntro("Karagedik Ercan", "Yusuf Duran"),
    muhtar: { name: "Yusuf Duran", mobile: "0536 760 29 02" },
    lat: 39.5848651,
    lng: 32.8253741,
  },
  {
    slug: "karaoglan",
    name: "Karaoğlan",
    aliases: ["Karaoğlan Mahallesi", "Karaoğlan"],
    intro: genericIntro("Karaoğlan", "Mehmet Atay"),
    muhtar: { name: "Mehmet Atay", mobile: "0535 769 27 55" },
    lat: 39.736697,
    lng: 32.833692,
  },
  {
    slug: "kirikli",
    name: "Kırıklı",
    aliases: ["Kırıklı Mahallesi", "Kırıklı"],
    intro: genericIntro("Kırıklı", "Ali Rıza Özdemir"),
    muhtar: { name: "Ali Rıza Özdemir", mobile: "0542 727 13 68" },
    lat: 39.531565,
    lng: 32.803324,
  },
  {
    slug: "kizilcasar",
    name: "Kızılcaşar",
    aliases: ["Kızılcaşar Mahallesi", "Kızılcaşar"],
    intro: genericIntro("Kızılcaşar", "Alper Yılmaz"),
    muhtar: { name: "Alper Yılmaz", phone: "(0312) 489 16 40", mobile: "0532 274 31 66" },
    lat: 39.8046433,
    lng: 32.7294309,
  },
  {
    slug: "koparan",
    name: "Koparan",
    aliases: ["Koparan Mahallesi", "Koparan"],
    intro: genericIntro("Koparan", "Fikret Kale"),
    muhtar: { name: "Fikret Kale", mobile: "0534 208 04 34" },
    lat: 39.726458,
    lng: 32.671437,
  },
  {
    slug: "mahmatlibahce",
    name: "Mahmatlıbahçe",
    aliases: ["Mahmatlıbahçe Mahallesi", "Mahmatlıbahçe"],
    intro: genericIntro("Mahmatlıbahçe", "Ergin Koç"),
    muhtar: { name: "Ergin Koç", mobile: "0539 737 07 13" },
    lat: 39.52545,
    lng: 32.841263,
  },
  {
    slug: "mahmatli",
    name: "Mahmatlı",
    aliases: ["Mahmatlı Mahallesi", "Mahmatlı"],
    intro: genericIntro("Mahmatlı", "Yılmaz Çetin"),
    muhtar: { name: "Yılmaz Çetin", mobile: "0532 715 29 36" },
    lat: 39.555284,
    lng: 32.902456,
  },
  {
    slug: "ogulbey",
    name: "Oğulbey",
    aliases: ["Oğulbey Mahallesi", "Oğulbey"],
    intro: genericIntro("Oğulbey", "Mustafa Cebeci", "1923 yılında Gölbaşı'nın nahiye merkezi olmasında rol oynayan Bucak Müdürlüğü ve Jandarma Karakolu buradan taşınmıştır."),
    muhtar: { name: "Mustafa Cebeci", mobile: "0531 705 13 06" },
    lat: 39.687228,
    lng: 32.826394,
  },
  {
    slug: "oyaca-akarsu",
    name: "Oyaca Akarsu",
    aliases: ["Oyaca Akarsu Mahallesi", "Oyaca Akarsu"],
    intro: genericIntro("Oyaca Akarsu", "Mustafa Erdoğan"),
    muhtar: { name: "Mustafa Erdoğan", mobile: "0536 510 86 22" },
    lat: 39.551365,
    lng: 32.593828,
  },
  {
    slug: "oyaca-yesilcam",
    name: "Oyaca Yeşilçam",
    aliases: ["Oyaca Yeşilçam Mahallesi", "Oyaca Yeşilçam"],
    intro: genericIntro("Oyaca Yeşilçam", "Erkan Dilmen"),
    muhtar: { name: "Erkan Dilmen", mobile: "0553 109 97 01" },
    lat: 39.536651,
    lng: 32.609913,
  },
  {
    slug: "selametli-sehit-emrah",
    name: "Selametli Şehit Emrah",
    aliases: ["Selametli Şehit Emrah Mahallesi", "Selametli Şehit Emrah", "Selametli"],
    intro: genericIntro("Selametli Şehit Emrah", "İsmail Nalbant"),
    muhtar: { name: "İsmail Nalbant", mobile: "0537 940 73 94" },
    lat: 39.48285,
    lng: 32.806702,
  },
  {
    slug: "sogulcak",
    name: "Soğulcak",
    aliases: ["Soğulcak Mahallesi", "Soğulcak"],
    intro: genericIntro("Soğulcak", "Hasan Işıkdemir"),
    muhtar: { name: "Hasan Işıkdemir", mobile: "0536 858 14 20" },
    lat: 39.522762,
    lng: 32.870966,
  },
  {
    slug: "subasi",
    name: "Subaşı",
    aliases: ["Subaşı Mahallesi", "Subaşı"],
    intro: genericIntro("Subaşı", "Yücel Kostak"),
    muhtar: { name: "Yücel Kostak", mobile: "0532 205 74 53" },
    lat: 39.63778,
    lng: 32.53613,
  },
  {
    slug: "taspinar",
    name: "Taşpınar",
    aliases: ["Taşpınar Mahallesi", "Taşpınar"],
    intro: genericIntro("Taşpınar", "Sebahattin Mert"),
    muhtar: { name: "Sebahattin Mert", mobile: "0530 558 19 64" },
    lat: 39.815205,
    lng: 32.7689479,
  },
  {
    slug: "tepeyurt",
    name: "Tepeyurt",
    aliases: ["Tepeyurt Mahallesi", "Tepeyurt"],
    intro: genericIntro("Tepeyurt", "Hurşit Şahin"),
    muhtar: { name: "Hurşit Şahin", mobile: "0531 426 87 17" },
    lat: 39.551471,
    lng: 32.819927,
  },
  {
    slug: "topakli",
    name: "Topaklı",
    aliases: ["Topaklı Mahallesi", "Topaklı"],
    intro: genericIntro("Topaklı", "Yasin Özer"),
    muhtar: { name: "Yasin Özer", mobile: "0533 925 98 37" },
    lat: 39.6298075,
    lng: 32.6390489,
  },
  {
    slug: "tulumtas",
    name: "Tulumtaş",
    aliases: ["Tulumtaş Mahallesi", "Tulumtaş"],
    intro: genericIntro("Tulumtaş", "Kazım Koç", "Gölbaşı Belediye Başkanı Yakup Odabaşı'nın doğduğu mahalledir."),
    muhtar: { name: "Kazım Koç", phone: "(0312) 499 60 68", mobile: "0532 789 51 49" },
    lat: 39.757964,
    lng: 32.653587,
  },
  {
    slug: "velihimmetli",
    name: "Velihimmetli",
    aliases: ["Velihimmetli Mahallesi", "Velihimmetli"],
    intro: genericIntro("Velihimmetli", "Ali İhsan Okman"),
    muhtar: { name: "Ali İhsan Okman", mobile: "0532 396 26 15" },
    lat: 39.690565,
    lng: 32.655174,
  },
  {
    slug: "yaglipinar",
    name: "Yağlıpınar",
    aliases: ["Yağlıpınar Mahallesi", "Yağlıpınar"],
    intro: genericIntro("Yağlıpınar", "Halil İbrahim Mirza"),
    muhtar: { name: "Halil İbrahim Mirza", phone: "(0312) 499 50 33", mobile: "0532 431 65 82" },
    lat: 39.652545,
    lng: 32.805518,
  },
  {
    slug: "yavrucak",
    name: "Yavrucak",
    aliases: ["Yavrucak Mahallesi", "Yavrucak", "Yavrucuk"],
    intro: genericIntro("Yavrucak", "Hasan Hüseyin Yaman"),
    muhtar: { name: "Hasan Hüseyin Yaman", mobile: "0532 512 32 55" },
    lat: 39.6976749,
    lng: 32.743666,
  },
  {
    slug: "yaylabag",
    name: "Yaylabağ",
    aliases: ["Yaylabağ Mahallesi", "Yaylabağ"],
    intro: genericIntro("Yaylabağ", "Adem Çetin"),
    muhtar: { name: "Adem Çetin", mobile: "0532 477 55 53" },
    lat: 39.79873,
    lng: 32.887268,
  },
  {
    slug: "yurtbeyi",
    name: "Yurtbeyi",
    aliases: ["Yurtbeyi Mahallesi", "Yurtbeyi"],
    intro: genericIntro("Yurtbeyi", "Ercan Aşkın"),
    muhtar: { name: "Ercan Aşkın", mobile: "0530 323 96 11" },
    lat: 39.752191,
    lng: 32.871402,
  },
];

export function getMahalleBySlug(slug: string): Mahalle | undefined {
  return MAHALLELER.find((m) => m.slug === slug);
}

/** `normalizeNeighborhood()` çıktısı olan kurallı isimden mahalle kaydını bulur. */
export function getMahalleByName(name: string): Mahalle | undefined {
  return MAHALLELER.find((m) => m.name === name);
}
