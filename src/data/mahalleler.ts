export interface Mahalle {
  slug: string;
  name: string;
  /** businesses.neighborhood ve gundem_posts.neighborhoods'taki ham (normalize edilmemiş) yazım varyasyonları. */
  aliases: string[];
  intro: string;
  /** TÜİK ADNKS — nufusune.com üzerinden alınıp Wikipedia'daki 2007-2023 verileriyle çapraz doğrulandı. */
  population: number;
  populationYear: number;
  populationHistory: { year: number; count: number }[];
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
  /** Mahallenin genel merkez koordinatı (tr.wikipedia.org veya Google Haritalar/OpenStreetMap). */
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

/**
 * Gölbaşı'nın resmi 54 mahallesinin tamamı (ankaragolbasi.bel.tr/muhtarliklar
 * ile doğrulandı). Nüfus verileri (güncel + 2007-2025 arası TÜİK ADNKS trendi)
 * nufusune.com üzerinden alınıp 7 "merkez mahalle" için Wikipedia'daki
 * 2007-2023 rakamlarıyla birebir çapraz doğrulandı — tüm mahalleler için
 * gerçek, güncel nüfus verisi mevcuttur (uydurma yok).
 *
 * Muhtar bilgileri: ankaragolbasi.bel.tr/muhtarliklar (resmi kaynak).
 * Muhtarlık ofis konumları (7 merkez mahalle): Google Haritalar'da tam POI
 * eşleşmesiyle doğrulandı. Koordinatlar: tr.wikipedia.org mahalle
 * infobox'ları, Google Haritalar POI eşleşmesi veya OpenStreetMap Nominatim
 * (kırsal mahalleler için).
 */
export const MAHALLELER: Mahalle[] = [
  {
    slug: "bahcelievler",
    name: "Bahçelievler",
    aliases: ["Bahçelievler Mahallesi", "Bahçelievler"],
    intro:
      "Bahçelievler Mahallesi, Gölbaşı ilçesinin idari merkezi konumundaki, Hükümet Konağı'nın da içinde bulunduğu bir mahalledir. İlçe merkezine yakınlığı sayesinde Gölbaşı'nın en işlek ve ulaşımı kolay mahallelerinden biridir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 29.306 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %128 artarak belirgin bir büyüme göstermiştir.",
    population: 29306,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 12881 }, { year: 2008, count: 14173 }, { year: 2009, count: 14679 }, { year: 2010, count: 15061 }, { year: 2011, count: 15552 }, { year: 2012, count: 17184 }, { year: 2013, count: 17385 }, { year: 2014, count: 18242 }, { year: 2015, count: 18759 }, { year: 2016, count: 17713 }, { year: 2017, count: 22065 }, { year: 2018, count: 22549 }, { year: 2019, count: 24267 }, { year: 2020, count: 23017 }, { year: 2021, count: 23574 }, { year: 2022, count: 25960 }, { year: 2023, count: 27184 }, { year: 2024, count: 28668 }, { year: 2025, count: 29306 }],
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
      "Seğmenler Mahallesi, Gölbaşı'nın devlet hastanesine ev sahipliği yaparak ilçenin sağlık hizmetlerinin odağında yer alan geniş bir yerleşim bölgesidir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 23.777 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %89 artarak belirgin bir büyüme göstermiştir.",
    population: 23777,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 12588 }, { year: 2008, count: 13063 }, { year: 2009, count: 13957 }, { year: 2010, count: 14345 }, { year: 2011, count: 14786 }, { year: 2012, count: 16149 }, { year: 2013, count: 15993 }, { year: 2014, count: 16157 }, { year: 2015, count: 17185 }, { year: 2016, count: 17743 }, { year: 2017, count: 18362 }, { year: 2018, count: 18085 }, { year: 2019, count: 19479 }, { year: 2020, count: 20508 }, { year: 2021, count: 21050 }, { year: 2022, count: 21854 }, { year: 2023, count: 21720 }, { year: 2024, count: 22714 }, { year: 2025, count: 23777 }],
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
      "Gaziosmanpaşa Mahallesi, Mogan Gölü kıyısında yer alan, Gölbaşı Belediyesi'nin de merkezi konumundaki idari ve sosyal bir mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 8.133 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %34 artmıştır.",
    population: 8133,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 6056 }, { year: 2008, count: 6214 }, { year: 2009, count: 6646 }, { year: 2010, count: 6877 }, { year: 2011, count: 7155 }, { year: 2012, count: 7481 }, { year: 2013, count: 7793 }, { year: 2014, count: 8008 }, { year: 2015, count: 8068 }, { year: 2016, count: 8163 }, { year: 2017, count: 8105 }, { year: 2018, count: 7709 }, { year: 2019, count: 7881 }, { year: 2020, count: 7898 }, { year: 2021, count: 7996 }, { year: 2022, count: 7998 }, { year: 2023, count: 7854 }, { year: 2024, count: 8129 }, { year: 2025, count: 8133 }],
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
      "Eymir Mahallesi, adını yakınındaki Eymir Gölü'nden alan, Mogan ve Eymir gölleri arasındaki konumuyla hem doğal hem kentsel bir karaktere sahip bir mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 24.586 nüfusa sahip olan mahallenin, 2008'den bu yana nüfusu %500 artarak belirgin bir büyüme göstermiştir.",
    population: 24586,
    populationYear: 2025,
    populationHistory: [{ year: 2008, count: 4100 }, { year: 2009, count: 6417 }, { year: 2010, count: 12484 }, { year: 2011, count: 19808 }, { year: 2012, count: 21937 }, { year: 2013, count: 22719 }, { year: 2014, count: 23019 }, { year: 2015, count: 24000 }, { year: 2016, count: 24368 }, { year: 2017, count: 24803 }, { year: 2018, count: 25437 }, { year: 2019, count: 25798 }, { year: 2020, count: 25076 }, { year: 2021, count: 23324 }, { year: 2022, count: 24605 }, { year: 2023, count: 23782 }, { year: 2024, count: 24369 }, { year: 2025, count: 24586 }],
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
      "Karşıyaka Mahallesi, adını Mogan Gölü'nün karşı kıyısında yer almasından alan, göl manzaralı bir Gölbaşı mahallesidir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 16.290 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %226 artarak belirgin bir büyüme göstermiştir.",
    population: 16290,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 4993 }, { year: 2008, count: 6524 }, { year: 2009, count: 7493 }, { year: 2010, count: 8144 }, { year: 2011, count: 9010 }, { year: 2012, count: 9752 }, { year: 2013, count: 10093 }, { year: 2014, count: 10747 }, { year: 2015, count: 11237 }, { year: 2016, count: 11787 }, { year: 2017, count: 12324 }, { year: 2018, count: 12049 }, { year: 2019, count: 12744 }, { year: 2020, count: 13318 }, { year: 2021, count: 13874 }, { year: 2022, count: 14513 }, { year: 2023, count: 14678 }, { year: 2024, count: 15479 }, { year: 2025, count: 16290 }],
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
  {
    slug: "safak",
    name: "Şafak",
    aliases: ["Şafak Mahallesi", "Şafak"],
    intro:
      "Şafak Mahallesi, Gölbaşı Mezarlığı'na ev sahipliği yapan, ilçe merkezine yakın konumuyla Gölbaşı'nın merkez mahallelerinden biridir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 10.908 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu görece istikrarlı seyretmiştir.",
    population: 10908,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 11066 }, { year: 2008, count: 8185 }, { year: 2009, count: 8345 }, { year: 2010, count: 9064 }, { year: 2011, count: 9524 }, { year: 2012, count: 9765 }, { year: 2013, count: 10085 }, { year: 2014, count: 10492 }, { year: 2015, count: 10762 }, { year: 2016, count: 10935 }, { year: 2017, count: 10445 }, { year: 2018, count: 9953 }, { year: 2019, count: 10287 }, { year: 2020, count: 10346 }, { year: 2021, count: 10257 }, { year: 2022, count: 10500 }, { year: 2023, count: 10217 }, { year: 2024, count: 10664 }, { year: 2025, count: 10908 }],
    muhtar: {
      name: "Bayram Özkan",
      phone: "(0312) 485 72 72",
      mobile: "0536 253 70 09",
      officeLat: 39.7975414,
      officeLng: 32.816543,
    },
    lat: 39.7958,
    lng: 32.80937,
  },
  {
    slug: "orencik",
    name: "Örencik",
    aliases: ["Örencik Mahallesi", "Örencik"],
    intro:
      "Örencik Mahallesi, Ankara'ya 23 km, Gölbaşı ilçe merkezine ise yalnızca 3 km uzaklıkta yer alan, Gölbaşı'nın eski adı olan \"Gölhanı\"nın bağlı olduğu köy olması nedeniyle ilçenin kuruluş tarihinde önemli bir yere sahip bir mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 4.219 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %278 artarak belirgin bir büyüme göstermiştir.",
    population: 4219,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 1115 }, { year: 2008, count: 1148 }, { year: 2009, count: 1109 }, { year: 2010, count: 1035 }, { year: 2011, count: 994 }, { year: 2012, count: 1041 }, { year: 2013, count: 1069 }, { year: 2014, count: 1081 }, { year: 2015, count: 1087 }, { year: 2016, count: 1040 }, { year: 2017, count: 1097 }, { year: 2018, count: 1078 }, { year: 2019, count: 1085 }, { year: 2020, count: 1041 }, { year: 2021, count: 1050 }, { year: 2022, count: 1074 }, { year: 2023, count: 1218 }, { year: 2024, count: 2959 }, { year: 2025, count: 4219 }],
    muhtar: {
      name: "Lokman Çakır",
      mobile: "0542 292 30 07",
      officeLat: 39.7804158,
      officeLng: 32.8359128,
    },
    lat: 39.782587,
    lng: 32.834915,
  },
  {
    slug: "ahiboz",
    name: "Ahiboz",
    aliases: ["Ahiboz Mahallesi", "Ahiboz"],
    intro:
      "Ahiboz Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, az nüfuslu bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 226 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %44 azalmıştır.",
    population: 226,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 405 }, { year: 2008, count: 395 }, { year: 2009, count: 387 }, { year: 2010, count: 375 }, { year: 2011, count: 355 }, { year: 2012, count: 371 }, { year: 2013, count: 334 }, { year: 2014, count: 296 }, { year: 2015, count: 287 }, { year: 2016, count: 289 }, { year: 2017, count: 253 }, { year: 2018, count: 275 }, { year: 2019, count: 257 }, { year: 2020, count: 240 }, { year: 2021, count: 236 }, { year: 2022, count: 220 }, { year: 2023, count: 223 }, { year: 2024, count: 213 }, { year: 2025, count: 226 }],
    muhtar: {
      name: "Şenol Ercan",
      phone: "(0312) 616 62 40",
      mobile: "0537 232 10 88",
    },
    lat: 39.6,
    lng: 32.85,
  },
  {
    slug: "akorencarsak",
    name: "Akörençarsak",
    aliases: ["Akörençarsak Mahallesi", "Akörençarsak"],
    intro:
      "Akörençarsak Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 347 nüfusa sahip olan mahallenin, 2013'ten bu yana nüfusu %15 artmıştır.",
    population: 347,
    populationYear: 2025,
    populationHistory: [{ year: 2013, count: 302 }, { year: 2014, count: 265 }, { year: 2015, count: 262 }, { year: 2016, count: 253 }, { year: 2017, count: 242 }, { year: 2018, count: 340 }, { year: 2019, count: 308 }, { year: 2020, count: 296 }, { year: 2021, count: 291 }, { year: 2022, count: 275 }, { year: 2023, count: 410 }, { year: 2024, count: 362 }, { year: 2025, count: 347 }],
    muhtar: {
      name: "Abdullah Ağören",
      mobile: "0531 790 43 96",
    },
    lat: 39.3213155,
    lng: 32.9485065,
  },
  {
    slug: "altincanak",
    name: "Altınçanak",
    aliases: ["Altınçanak Mahallesi", "Altınçanak", "Altunçanak"],
    intro:
      "Eskiden Balâ ilçesine bağlı bir köyken sonradan Gölbaşı'na bağlanan mahalle, Ankara'nın Gölbaşı ilçesine bağlı, az nüfuslu bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 109 nüfusa sahip olan mahallenin, 2013'ten bu yana nüfusu %27 artmıştır.",
    population: 109,
    populationYear: 2025,
    populationHistory: [{ year: 2013, count: 86 }, { year: 2014, count: 86 }, { year: 2015, count: 82 }, { year: 2016, count: 69 }, { year: 2017, count: 62 }, { year: 2018, count: 73 }, { year: 2019, count: 67 }, { year: 2020, count: 74 }, { year: 2021, count: 85 }, { year: 2022, count: 90 }, { year: 2023, count: 117 }, { year: 2024, count: 116 }, { year: 2025, count: 109 }],
    muhtar: {
      name: "İhsan Özbek",
      mobile: "0534 550 11 71",
    },
    lat: 39.2650533,
    lng: 32.9223014,
  },
  {
    slug: "bagici",
    name: "Bağiçi",
    aliases: ["Bağiçi Mahallesi", "Bağiçi"],
    intro:
      "Bağiçi Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 360 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %31 azalmıştır.",
    population: 360,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 520 }, { year: 2008, count: 621 }, { year: 2009, count: 450 }, { year: 2010, count: 362 }, { year: 2011, count: 344 }, { year: 2012, count: 293 }, { year: 2013, count: 489 }, { year: 2014, count: 391 }, { year: 2015, count: 332 }, { year: 2016, count: 302 }, { year: 2017, count: 292 }, { year: 2018, count: 528 }, { year: 2019, count: 384 }, { year: 2020, count: 340 }, { year: 2021, count: 307 }, { year: 2022, count: 302 }, { year: 2023, count: 470 }, { year: 2024, count: 385 }, { year: 2025, count: 360 }],
    muhtar: {
      name: "Zeki Doğan",
      mobile: "0532 462 56 73",
    },
    lat: 39.537796,
    lng: 32.909725,
  },
  {
    slug: "ballikpinar",
    name: "Ballıkpınar",
    aliases: ["Ballıkpınar Mahallesi", "Ballıkpınar"],
    intro:
      "Ankara'ya yakınlığı nedeniyle hafta sonları piknik amaçlı ziyaret edilen bir sayfiye yeri olan mahalle, Kırım Tatar Türk kökenli bir nüfusa ev sahipliği yapmaktadır. Ankara'nın Gölbaşı ilçesine bağlı, orta ölçekli bir yerleşim bölgesidir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 1.692 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %222 artarak belirgin bir büyüme göstermiştir.",
    population: 1692,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 525 }, { year: 2008, count: 628 }, { year: 2009, count: 629 }, { year: 2010, count: 667 }, { year: 2011, count: 681 }, { year: 2012, count: 715 }, { year: 2013, count: 737 }, { year: 2014, count: 800 }, { year: 2015, count: 832 }, { year: 2016, count: 883 }, { year: 2017, count: 899 }, { year: 2018, count: 982 }, { year: 2019, count: 1081 }, { year: 2020, count: 1196 }, { year: 2021, count: 1378 }, { year: 2022, count: 1443 }, { year: 2023, count: 1522 }, { year: 2024, count: 1585 }, { year: 2025, count: 1692 }],
    muhtar: {
      name: "Yılmaz Akbay",
      phone: "(0312) 499 40 31",
      mobile: "0533 958 71 23",
    },
    lat: 39.734459,
    lng: 32.7150987,
  },
  {
    slug: "bezirhane",
    name: "Bezirhane",
    aliases: ["Bezirhane Mahallesi", "Bezirhane"],
    intro:
      "Bir yamaç mahallesi olan Bezirhane, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 638 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %59 azalmıştır.",
    population: 638,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 1575 }, { year: 2008, count: 1293 }, { year: 2009, count: 1023 }, { year: 2010, count: 833 }, { year: 2011, count: 760 }, { year: 2012, count: 715 }, { year: 2013, count: 775 }, { year: 2014, count: 666 }, { year: 2015, count: 627 }, { year: 2016, count: 593 }, { year: 2017, count: 570 }, { year: 2018, count: 689 }, { year: 2019, count: 668 }, { year: 2020, count: 649 }, { year: 2021, count: 619 }, { year: 2022, count: 598 }, { year: 2023, count: 716 }, { year: 2024, count: 647 }, { year: 2025, count: 638 }],
    muhtar: {
      name: "Feridun Uzumer",
      mobile: "0532 485 16 39",
    },
    lat: 39.4808861,
    lng: 32.8522676,
  },
  {
    slug: "boyalik",
    name: "Boyalık",
    aliases: ["Boyalık Mahallesi", "Boyalık"],
    intro:
      "Boyalık Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 380 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu görece istikrarlı seyretmiştir.",
    population: 380,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 404 }, { year: 2008, count: 469 }, { year: 2009, count: 404 }, { year: 2010, count: 397 }, { year: 2011, count: 366 }, { year: 2012, count: 353 }, { year: 2013, count: 337 }, { year: 2014, count: 348 }, { year: 2015, count: 345 }, { year: 2016, count: 338 }, { year: 2017, count: 342 }, { year: 2018, count: 421 }, { year: 2019, count: 393 }, { year: 2020, count: 367 }, { year: 2021, count: 359 }, { year: 2022, count: 342 }, { year: 2023, count: 465 }, { year: 2024, count: 395 }, { year: 2025, count: 380 }],
    muhtar: {
      name: "Ahmet Serdar Yılmaz",
      mobile: "0537 680 65 54",
    },
    lat: 39.4744862,
    lng: 32.6664206,
  },
  {
    slug: "celtek",
    name: "Çeltek",
    aliases: ["Çeltek Mahallesi", "Çeltek"],
    intro:
      "İlçenin en uzak yerleşimlerinden biri olan mahalle, Ankara'ya 70 km, Haymana ilçesine ise 43 km uzaklıktadır. Ankara'nın Gölbaşı ilçesine bağlı, az nüfuslu bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 71 nüfusa sahip olan mahallenin, 2013'ten bu yana nüfusu görece istikrarlı seyretmiştir.",
    population: 71,
    populationYear: 2025,
    populationHistory: [{ year: 2013, count: 63 }, { year: 2014, count: 61 }, { year: 2015, count: 57 }, { year: 2016, count: 59 }, { year: 2017, count: 61 }, { year: 2018, count: 120 }, { year: 2019, count: 90 }, { year: 2020, count: 88 }, { year: 2021, count: 77 }, { year: 2022, count: 76 }, { year: 2023, count: 112 }, { year: 2024, count: 82 }, { year: 2025, count: 71 }],
    muhtar: {
      name: "Rasim Ak",
      mobile: "0541 386 10 40",
    },
    lat: 39.279453,
    lng: 32.865177,
  },
  {
    slug: "cimsit",
    name: "Çimşit",
    aliases: ["Çimşit Mahallesi", "Çimşit"],
    intro:
      "Çimşit Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 380 nüfusa sahip olan mahallenin, 2013'ten bu yana nüfusu %19 artmıştır.",
    population: 380,
    populationYear: 2025,
    populationHistory: [{ year: 2013, count: 318 }, { year: 2014, count: 249 }, { year: 2015, count: 246 }, { year: 2016, count: 245 }, { year: 2017, count: 271 }, { year: 2018, count: 337 }, { year: 2019, count: 307 }, { year: 2020, count: 301 }, { year: 2021, count: 285 }, { year: 2022, count: 301 }, { year: 2023, count: 580 }, { year: 2024, count: 430 }, { year: 2025, count: 380 }],
    muhtar: {
      name: "Recep Demirel",
      mobile: "0535 977 66 67",
    },
    lat: 39.430328,
    lng: 32.891361,
  },
  {
    slug: "cayirli",
    name: "Çayırlı",
    aliases: ["Çayırlı Mahallesi", "Çayırlı"],
    intro:
      "Çayırlı Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, az nüfuslu bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 199 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu görece istikrarlı seyretmiştir.",
    population: 199,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 204 }, { year: 2008, count: 258 }, { year: 2009, count: 237 }, { year: 2010, count: 215 }, { year: 2011, count: 226 }, { year: 2012, count: 199 }, { year: 2013, count: 241 }, { year: 2014, count: 205 }, { year: 2015, count: 205 }, { year: 2016, count: 199 }, { year: 2017, count: 190 }, { year: 2018, count: 221 }, { year: 2019, count: 206 }, { year: 2020, count: 185 }, { year: 2021, count: 181 }, { year: 2022, count: 179 }, { year: 2023, count: 265 }, { year: 2024, count: 221 }, { year: 2025, count: 199 }],
    muhtar: {
      name: "Nejdet Ökmen",
      mobile: "0537 214 63 44",
    },
    lat: 39.630085,
    lng: 32.588692,
  },
  {
    slug: "dikilitas",
    name: "Dikilitaş",
    aliases: ["Dikilitaş Mahallesi", "Dikilitaş"],
    intro:
      "Oyaca kasabası sınırları içinde yer alan mahalle, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 417 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %34 artmıştır.",
    population: 417,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 312 }, { year: 2008, count: 776 }, { year: 2009, count: 605 }, { year: 2010, count: 519 }, { year: 2011, count: 469 }, { year: 2012, count: 432 }, { year: 2013, count: 473 }, { year: 2014, count: 446 }, { year: 2015, count: 429 }, { year: 2016, count: 436 }, { year: 2017, count: 411 }, { year: 2018, count: 755 }, { year: 2019, count: 566 }, { year: 2020, count: 519 }, { year: 2021, count: 486 }, { year: 2022, count: 457 }, { year: 2023, count: 500 }, { year: 2024, count: 445 }, { year: 2025, count: 417 }],
    muhtar: {
      name: "Ercan Öztürk",
      phone: "(0312) 651 30 31",
      mobile: "0533 810 38 39",
    },
    lat: 39.551559,
    lng: 32.702043,
  },
  {
    slug: "emirler",
    name: "Emirler",
    aliases: ["Emirler Mahallesi", "Emirler"],
    intro:
      "Emirler Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 730 nüfusa sahip olan mahallenin, 2013'ten bu yana nüfusu görece istikrarlı seyretmiştir.",
    population: 730,
    populationYear: 2025,
    populationHistory: [{ year: 2013, count: 678 }, { year: 2014, count: 485 }, { year: 2015, count: 474 }, { year: 2016, count: 477 }, { year: 2017, count: 559 }, { year: 2018, count: 1210 }, { year: 2019, count: 896 }, { year: 2020, count: 798 }, { year: 2021, count: 726 }, { year: 2022, count: 726 }, { year: 2023, count: 1032 }, { year: 2024, count: 829 }, { year: 2025, count: 730 }],
    muhtar: {
      name: "Sinan Gökkoyun",
      mobile: "0535 322 53 30",
    },
    lat: 39.416667,
    lng: 32.916667,
  },
  {
    slug: "golbek",
    name: "Gölbek",
    aliases: ["Gölbek Mahallesi", "Gölbek"],
    intro:
      "Gölbek Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, az nüfuslu bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 260 nüfusa sahip olan mahallenin, 2013'ten bu yana nüfusu %40 artmıştır.",
    population: 260,
    populationYear: 2025,
    populationHistory: [{ year: 2013, count: 186 }, { year: 2014, count: 175 }, { year: 2015, count: 191 }, { year: 2016, count: 206 }, { year: 2017, count: 231 }, { year: 2018, count: 244 }, { year: 2019, count: 238 }, { year: 2020, count: 234 }, { year: 2021, count: 229 }, { year: 2022, count: 204 }, { year: 2023, count: 303 }, { year: 2024, count: 272 }, { year: 2025, count: 260 }],
    muhtar: {
      name: "Kerem Çetinkaya",
      mobile: "0533 653 92 45",
    },
    lat: 39.321924,
    lng: 32.841545,
  },
  {
    slug: "gokcehoyuk",
    name: "Gökçehöyük",
    aliases: ["Gökçehöyük Mahallesi", "Gökçehöyük", "Gökçehüyük"],
    intro:
      "Geçmişte daha kalabalık bir nüfusa sahip olan ve zamanla göç veren mahalle, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 972 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %57 azalmıştır.",
    population: 972,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 2247 }, { year: 2008, count: 2179 }, { year: 2009, count: 2250 }, { year: 2010, count: 2211 }, { year: 2011, count: 2175 }, { year: 2012, count: 1530 }, { year: 2013, count: 1395 }, { year: 2014, count: 1414 }, { year: 2015, count: 1067 }, { year: 2016, count: 988 }, { year: 2017, count: 986 }, { year: 2018, count: 963 }, { year: 2019, count: 807 }, { year: 2020, count: 779 }, { year: 2021, count: 748 }, { year: 2022, count: 878 }, { year: 2023, count: 940 }, { year: 2024, count: 918 }, { year: 2025, count: 972 }],
    muhtar: {
      name: "Furkan Özgür Gümüş",
      mobile: "0539 643 73 40",
    },
    lat: 39.6649872,
    lng: 32.7322406,
  },
  {
    slug: "gunalan",
    name: "Günalan",
    aliases: ["Günalan Mahallesi", "Günalan"],
    intro:
      "Günalan Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, az nüfuslu bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 145 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %59 artmıştır.",
    population: 145,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 91 }, { year: 2008, count: 176 }, { year: 2009, count: 174 }, { year: 2010, count: 144 }, { year: 2011, count: 162 }, { year: 2012, count: 145 }, { year: 2013, count: 173 }, { year: 2014, count: 179 }, { year: 2015, count: 181 }, { year: 2016, count: 178 }, { year: 2017, count: 159 }, { year: 2018, count: 195 }, { year: 2019, count: 177 }, { year: 2020, count: 163 }, { year: 2021, count: 152 }, { year: 2022, count: 149 }, { year: 2023, count: 146 }, { year: 2024, count: 148 }, { year: 2025, count: 145 }],
    muhtar: {
      name: "Şener Karatay",
      mobile: "0532 408 66 77",
    },
    lat: 39.621267,
    lng: 32.882117,
  },
  {
    slug: "hacihasan",
    name: "Hacıhasan",
    aliases: ["Hacıhasan Mahallesi", "Hacıhasan"],
    intro:
      "Türkiye'de yalnızca Mogan Gölü kıyısında, bu mahalle civarında yetişen endemik bir bitki olan Sevgi Çiçeği (Centaurea tchihatcheffii) ile tanınan mahalle, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 649 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %63 artarak belirgin bir büyüme göstermiştir.",
    population: 649,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 397 }, { year: 2008, count: 446 }, { year: 2009, count: 469 }, { year: 2010, count: 455 }, { year: 2011, count: 446 }, { year: 2012, count: 461 }, { year: 2013, count: 475 }, { year: 2014, count: 484 }, { year: 2015, count: 496 }, { year: 2016, count: 490 }, { year: 2017, count: 518 }, { year: 2018, count: 554 }, { year: 2019, count: 550 }, { year: 2020, count: 573 }, { year: 2021, count: 579 }, { year: 2022, count: 584 }, { year: 2023, count: 626 }, { year: 2024, count: 635 }, { year: 2025, count: 649 }],
    muhtar: {
      name: "Mehmet Mükerrem Çelik",
      phone: "(0312) 499 91 42",
      mobile: "0543 375 18 18",
    },
    lat: 39.7453195,
    lng: 32.7491913,
  },
  {
    slug: "hacilar",
    name: "Hacılar",
    aliases: ["Hacılar Mahallesi", "Hacılar"],
    intro:
      "Ankara'ya yakınlığı sayesinde son yıllarda hızla kentleşen mahalle, Ankara'nın Gölbaşı ilçesine bağlı, orta ölçekli bir yerleşim bölgesidir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 4.811 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %514 artarak belirgin bir büyüme göstermiştir.",
    population: 4811,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 784 }, { year: 2008, count: 1012 }, { year: 2009, count: 825 }, { year: 2010, count: 830 }, { year: 2011, count: 916 }, { year: 2012, count: 1043 }, { year: 2013, count: 1122 }, { year: 2014, count: 1213 }, { year: 2015, count: 1288 }, { year: 2016, count: 1572 }, { year: 2017, count: 1951 }, { year: 2018, count: 2379 }, { year: 2019, count: 2649 }, { year: 2020, count: 2943 }, { year: 2021, count: 3193 }, { year: 2022, count: 3579 }, { year: 2023, count: 4276 }, { year: 2024, count: 4392 }, { year: 2025, count: 4811 }],
    muhtar: {
      name: "Binnur Aykut",
      mobile: "0532 480 96 27",
    },
    lat: 39.7684596,
    lng: 32.7124903,
  },
  {
    slug: "hacimuratli",
    name: "Hacımuratlı",
    aliases: ["Hacımuratlı Mahallesi", "Hacımuratlı"],
    intro:
      "Hacımuratlı Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 353 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %109 artarak belirgin bir büyüme göstermiştir.",
    population: 353,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 169 }, { year: 2008, count: 296 }, { year: 2009, count: 289 }, { year: 2010, count: 258 }, { year: 2011, count: 248 }, { year: 2012, count: 211 }, { year: 2013, count: 234 }, { year: 2014, count: 245 }, { year: 2015, count: 257 }, { year: 2016, count: 217 }, { year: 2017, count: 212 }, { year: 2018, count: 308 }, { year: 2019, count: 285 }, { year: 2020, count: 289 }, { year: 2021, count: 332 }, { year: 2022, count: 322 }, { year: 2023, count: 329 }, { year: 2024, count: 345 }, { year: 2025, count: 353 }],
    muhtar: {
      name: "Uğur Açık",
      mobile: "0532 424 51 15",
    },
    lat: 39.679531,
    lng: 32.700028,
  },
  {
    slug: "halacli",
    name: "Halaçlı",
    aliases: ["Halaçlı Mahallesi", "Halaçlı", "Hallaçlı"],
    intro:
      "Halaçlı Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 333 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu görece istikrarlı seyretmiştir.",
    population: 333,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 381 }, { year: 2008, count: 391 }, { year: 2009, count: 367 }, { year: 2010, count: 330 }, { year: 2011, count: 320 }, { year: 2012, count: 304 }, { year: 2013, count: 339 }, { year: 2014, count: 320 }, { year: 2015, count: 283 }, { year: 2016, count: 274 }, { year: 2017, count: 290 }, { year: 2018, count: 351 }, { year: 2019, count: 318 }, { year: 2020, count: 298 }, { year: 2021, count: 265 }, { year: 2022, count: 258 }, { year: 2023, count: 440 }, { year: 2024, count: 349 }, { year: 2025, count: 333 }],
    muhtar: {
      name: "Mehmet Şahin",
      mobile: "0537 964 11 72",
    },
    lat: 39.707187,
    lng: 32.6054109,
  },
  {
    slug: "ikizce",
    name: "İkizce",
    aliases: ["İkizce Mahallesi", "İkizce"],
    intro:
      "İkizce Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 387 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %54 artmıştır.",
    population: 387,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 252 }, { year: 2008, count: 244 }, { year: 2009, count: 273 }, { year: 2010, count: 253 }, { year: 2011, count: 249 }, { year: 2012, count: 248 }, { year: 2013, count: 315 }, { year: 2014, count: 297 }, { year: 2015, count: 292 }, { year: 2016, count: 298 }, { year: 2017, count: 302 }, { year: 2018, count: 337 }, { year: 2019, count: 332 }, { year: 2020, count: 327 }, { year: 2021, count: 333 }, { year: 2022, count: 332 }, { year: 2023, count: 447 }, { year: 2024, count: 408 }, { year: 2025, count: 387 }],
    muhtar: {
      name: "Erkan Gökkaya",
      mobile: "0530 561 08 10",
    },
    lat: 39.5952709,
    lng: 32.6620319,
  },
  {
    slug: "incek",
    name: "İncek",
    aliases: ["İncek Mahallesi", "İncek"],
    intro:
      "Ankara'nın önemli bir yerleşim ve üniversite bölgesi olan İncek'e komşu olan mahalle, Ankara'nın Gölbaşı ilçesine bağlı, kalabalık bir mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 8.700 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %292 artarak belirgin bir büyüme göstermiştir.",
    population: 8700,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 2222 }, { year: 2008, count: 2175 }, { year: 2009, count: 2180 }, { year: 2010, count: 2123 }, { year: 2011, count: 2204 }, { year: 2012, count: 2256 }, { year: 2013, count: 2292 }, { year: 2014, count: 3249 }, { year: 2015, count: 3950 }, { year: 2016, count: 4363 }, { year: 2017, count: 4662 }, { year: 2018, count: 4605 }, { year: 2019, count: 4911 }, { year: 2020, count: 5183 }, { year: 2021, count: 5409 }, { year: 2022, count: 5578 }, { year: 2023, count: 6357 }, { year: 2024, count: 7585 }, { year: 2025, count: 8700 }],
    muhtar: {
      name: "Ahmet Alp",
      mobile: "0532 786 30 19",
    },
    lat: 39.806389,
    lng: 32.699722,
  },
  {
    slug: "karacaoren",
    name: "Karacaören",
    aliases: ["Karacaören Mahallesi", "Karacaören"],
    intro:
      "Karacaören Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, az nüfuslu bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 273 nüfusa sahip olan mahallenin, 2013'ten bu yana nüfusu %35 azalmıştır.",
    population: 273,
    populationYear: 2025,
    populationHistory: [{ year: 2013, count: 421 }, { year: 2014, count: 260 }, { year: 2015, count: 216 }, { year: 2016, count: 204 }, { year: 2017, count: 235 }, { year: 2018, count: 456 }, { year: 2019, count: 325 }, { year: 2020, count: 280 }, { year: 2021, count: 264 }, { year: 2022, count: 265 }, { year: 2023, count: 425 }, { year: 2024, count: 321 }, { year: 2025, count: 273 }],
    muhtar: {
      name: "Mehmet Bahattin Şefik",
      mobile: "0535 390 40 80",
    },
    lat: 39.364698,
    lng: 32.810503,
  },
  {
    slug: "karaali-merkez",
    name: "Karaali Merkez",
    aliases: ["Karaali Merkez Mahallesi", "Karaali Merkez", "Karaali"],
    intro:
      "Karaali Merkez Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 308 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %61 azalmıştır.",
    population: 308,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 796 }, { year: 2008, count: 577 }, { year: 2009, count: 498 }, { year: 2010, count: 391 }, { year: 2011, count: 350 }, { year: 2012, count: 322 }, { year: 2013, count: 426 }, { year: 2014, count: 323 }, { year: 2015, count: 306 }, { year: 2016, count: 286 }, { year: 2017, count: 273 }, { year: 2018, count: 410 }, { year: 2019, count: 314 }, { year: 2020, count: 275 }, { year: 2021, count: 270 }, { year: 2022, count: 251 }, { year: 2023, count: 516 }, { year: 2024, count: 328 }, { year: 2025, count: 308 }],
    muhtar: {
      name: "Haydar Yılmaz",
      mobile: "0532 464 47 77",
    },
    lat: 39.654491,
    lng: 32.944856,
  },
  {
    slug: "karaali-yazlik",
    name: "Karaali Yazlık",
    aliases: ["Karaali Yazlık Mahallesi", "Karaali Yazlık"],
    intro:
      "Karaali Yazlık Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, az nüfuslu bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 295 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %53 azalmıştır.",
    population: 295,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 634 }, { year: 2008, count: 523 }, { year: 2009, count: 448 }, { year: 2010, count: 377 }, { year: 2011, count: 335 }, { year: 2012, count: 333 }, { year: 2013, count: 401 }, { year: 2014, count: 340 }, { year: 2015, count: 317 }, { year: 2016, count: 271 }, { year: 2017, count: 298 }, { year: 2018, count: 323 }, { year: 2019, count: 280 }, { year: 2020, count: 273 }, { year: 2021, count: 264 }, { year: 2022, count: 263 }, { year: 2023, count: 416 }, { year: 2024, count: 339 }, { year: 2025, count: 295 }],
    muhtar: {
      name: "İrfan Erdem",
      mobile: "0532 230 57 60",
    },
    lat: 39.6094426,
    lng: 32.9663018,
  },
  {
    slug: "karagedik-aydin",
    name: "Karagedik Aydın",
    aliases: ["Karagedik Aydın Mahallesi", "Karagedik Aydın"],
    intro:
      "Karagedik Aydın Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, orta ölçekli bir yerleşim bölgesidir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 1.210 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %26 azalmıştır.",
    population: 1210,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 1640 }, { year: 2008, count: 1612 }, { year: 2009, count: 1578 }, { year: 2010, count: 1546 }, { year: 2011, count: 1509 }, { year: 2012, count: 1471 }, { year: 2013, count: 1407 }, { year: 2014, count: 1409 }, { year: 2015, count: 1349 }, { year: 2016, count: 1361 }, { year: 2017, count: 1311 }, { year: 2018, count: 1280 }, { year: 2019, count: 1268 }, { year: 2020, count: 1253 }, { year: 2021, count: 1266 }, { year: 2022, count: 1247 }, { year: 2023, count: 1268 }, { year: 2024, count: 1249 }, { year: 2025, count: 1210 }],
    muhtar: {
      name: "Fevzi Yüksek",
      mobile: "0542 485 68 69",
    },
    lat: 39.572442,
    lng: 32.797738,
  },
  {
    slug: "karagedik-ercan",
    name: "Karagedik Ercan",
    aliases: ["Karagedik Ercan Mahallesi", "Karagedik Ercan"],
    intro:
      "Karagedik Ercan Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, orta ölçekli bir yerleşim bölgesidir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 1.039 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %21 azalmıştır.",
    population: 1039,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 1311 }, { year: 2008, count: 1269 }, { year: 2009, count: 1259 }, { year: 2010, count: 1263 }, { year: 2011, count: 1243 }, { year: 2012, count: 1170 }, { year: 2013, count: 1172 }, { year: 2014, count: 1189 }, { year: 2015, count: 1185 }, { year: 2016, count: 1167 }, { year: 2017, count: 1149 }, { year: 2018, count: 1128 }, { year: 2019, count: 1107 }, { year: 2020, count: 1101 }, { year: 2021, count: 1082 }, { year: 2022, count: 1039 }, { year: 2023, count: 1098 }, { year: 2024, count: 1043 }, { year: 2025, count: 1039 }],
    muhtar: {
      name: "Yusuf Duran",
      mobile: "0536 760 29 02",
    },
    lat: 39.5848651,
    lng: 32.8253741,
  },
  {
    slug: "karaoglan",
    name: "Karaoğlan",
    aliases: ["Karaoğlan Mahallesi", "Karaoğlan"],
    intro:
      "Karaoğlan Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 770 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %23 artmıştır.",
    population: 770,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 626 }, { year: 2008, count: 846 }, { year: 2009, count: 895 }, { year: 2010, count: 810 }, { year: 2011, count: 818 }, { year: 2012, count: 755 }, { year: 2013, count: 815 }, { year: 2014, count: 772 }, { year: 2015, count: 748 }, { year: 2016, count: 746 }, { year: 2017, count: 695 }, { year: 2018, count: 685 }, { year: 2019, count: 657 }, { year: 2020, count: 661 }, { year: 2021, count: 706 }, { year: 2022, count: 718 }, { year: 2023, count: 842 }, { year: 2024, count: 771 }, { year: 2025, count: 770 }],
    muhtar: {
      name: "Mehmet Atay",
      mobile: "0535 769 27 55",
    },
    lat: 39.736697,
    lng: 32.833692,
  },
  {
    slug: "kirikli",
    name: "Kırıklı",
    aliases: ["Kırıklı Mahallesi", "Kırıklı"],
    intro:
      "Kırıklı Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, az nüfuslu bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 108 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu görece istikrarlı seyretmiştir.",
    population: 108,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 122 }, { year: 2008, count: 130 }, { year: 2009, count: 133 }, { year: 2010, count: 124 }, { year: 2011, count: 127 }, { year: 2012, count: 122 }, { year: 2013, count: 126 }, { year: 2014, count: 116 }, { year: 2015, count: 107 }, { year: 2016, count: 104 }, { year: 2017, count: 97 }, { year: 2018, count: 115 }, { year: 2019, count: 119 }, { year: 2020, count: 115 }, { year: 2021, count: 109 }, { year: 2022, count: 102 }, { year: 2023, count: 114 }, { year: 2024, count: 116 }, { year: 2025, count: 108 }],
    muhtar: {
      name: "Ali Rıza Özdemir",
      mobile: "0542 727 13 68",
    },
    lat: 39.531565,
    lng: 32.803324,
  },
  {
    slug: "kizilcasar",
    name: "Kızılcaşar",
    aliases: ["Kızılcaşar Mahallesi", "Kızılcaşar"],
    intro:
      "İncek'e komşu, hızla kentleşen bir yerleşim bölgesi olan mahalle, Ankara'nın Gölbaşı ilçesine bağlı, kalabalık bir mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 10.749 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %1280 artarak belirgin bir büyüme göstermiştir.",
    population: 10749,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 779 }, { year: 2008, count: 1405 }, { year: 2009, count: 1646 }, { year: 2010, count: 2082 }, { year: 2011, count: 2411 }, { year: 2012, count: 2633 }, { year: 2013, count: 2965 }, { year: 2014, count: 3218 }, { year: 2015, count: 3775 }, { year: 2016, count: 4113 }, { year: 2017, count: 4268 }, { year: 2018, count: 4292 }, { year: 2019, count: 5094 }, { year: 2020, count: 6626 }, { year: 2021, count: 8019 }, { year: 2022, count: 8581 }, { year: 2023, count: 9121 }, { year: 2024, count: 9827 }, { year: 2025, count: 10749 }],
    muhtar: {
      name: "Alper Yılmaz",
      phone: "(0312) 489 16 40",
      mobile: "0532 274 31 66",
    },
    lat: 39.8046433,
    lng: 32.7294309,
  },
  {
    slug: "koparan",
    name: "Koparan",
    aliases: ["Koparan Mahallesi", "Koparan"],
    intro:
      "Koparan Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 594 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %81 artarak belirgin bir büyüme göstermiştir.",
    population: 594,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 329 }, { year: 2008, count: 423 }, { year: 2009, count: 382 }, { year: 2010, count: 353 }, { year: 2011, count: 321 }, { year: 2012, count: 325 }, { year: 2013, count: 310 }, { year: 2014, count: 301 }, { year: 2015, count: 325 }, { year: 2016, count: 322 }, { year: 2017, count: 331 }, { year: 2018, count: 385 }, { year: 2019, count: 396 }, { year: 2020, count: 424 }, { year: 2021, count: 478 }, { year: 2022, count: 520 }, { year: 2023, count: 560 }, { year: 2024, count: 543 }, { year: 2025, count: 594 }],
    muhtar: {
      name: "Fikret Kale",
      mobile: "0534 208 04 34",
    },
    lat: 39.726458,
    lng: 32.671437,
  },
  {
    slug: "mahmatlibahce",
    name: "Mahmatlıbahçe",
    aliases: ["Mahmatlıbahçe Mahallesi", "Mahmatlıbahçe"],
    intro:
      "Mahmatlıbahçe Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, az nüfuslu bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 144 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %29 azalmıştır.",
    population: 144,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 204 }, { year: 2008, count: 187 }, { year: 2009, count: 143 }, { year: 2010, count: 128 }, { year: 2011, count: 124 }, { year: 2012, count: 128 }, { year: 2013, count: 113 }, { year: 2014, count: 112 }, { year: 2015, count: 107 }, { year: 2016, count: 98 }, { year: 2017, count: 97 }, { year: 2018, count: 120 }, { year: 2019, count: 122 }, { year: 2020, count: 126 }, { year: 2021, count: 129 }, { year: 2022, count: 127 }, { year: 2023, count: 142 }, { year: 2024, count: 139 }, { year: 2025, count: 144 }],
    muhtar: {
      name: "Ergin Koç",
      mobile: "0539 737 07 13",
    },
    lat: 39.52545,
    lng: 32.841263,
  },
  {
    slug: "mahmatli",
    name: "Mahmatlı",
    aliases: ["Mahmatlı Mahallesi", "Mahmatlı"],
    intro:
      "Mahmatlı Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 360 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %54 azalmıştır.",
    population: 360,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 778 }, { year: 2008, count: 1048 }, { year: 2009, count: 683 }, { year: 2010, count: 456 }, { year: 2011, count: 364 }, { year: 2012, count: 314 }, { year: 2013, count: 578 }, { year: 2014, count: 370 }, { year: 2015, count: 307 }, { year: 2016, count: 268 }, { year: 2017, count: 271 }, { year: 2018, count: 355 }, { year: 2019, count: 299 }, { year: 2020, count: 285 }, { year: 2021, count: 277 }, { year: 2022, count: 279 }, { year: 2023, count: 531 }, { year: 2024, count: 406 }, { year: 2025, count: 360 }],
    muhtar: {
      name: "Yılmaz Çetin",
      mobile: "0532 715 29 36",
    },
    lat: 39.555284,
    lng: 32.902456,
  },
  {
    slug: "ogulbey",
    name: "Oğulbey",
    aliases: ["Oğulbey Mahallesi", "Oğulbey"],
    intro:
      "Gölbaşı'nın 1923'te nahiye statüsü kazanmasında rol oynayan Bucak Müdürlüğü ve Jandarma Karakolu'nun buradan taşınmış olmasıyla ilçenin kuruluş tarihinde özel bir yere sahip olan mahalle, Ankara'nın Gölbaşı ilçesine bağlı, orta ölçekli bir yerleşim bölgesidir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 1.217 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %45 artmıştır.",
    population: 1217,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 840 }, { year: 2008, count: 908 }, { year: 2009, count: 903 }, { year: 2010, count: 859 }, { year: 2011, count: 891 }, { year: 2012, count: 846 }, { year: 2013, count: 1873 }, { year: 2014, count: 1632 }, { year: 2015, count: 1565 }, { year: 2016, count: 1388 }, { year: 2017, count: 1463 }, { year: 2018, count: 1547 }, { year: 2019, count: 1206 }, { year: 2020, count: 1141 }, { year: 2021, count: 1121 }, { year: 2022, count: 1104 }, { year: 2023, count: 1163 }, { year: 2024, count: 1182 }, { year: 2025, count: 1217 }],
    muhtar: {
      name: "Mustafa Cebeci",
      mobile: "0531 705 13 06",
    },
    lat: 39.687228,
    lng: 32.826394,
  },
  {
    slug: "oyaca-akarsu",
    name: "Oyaca Akarsu",
    aliases: ["Oyaca Akarsu Mahallesi", "Oyaca Akarsu"],
    intro:
      "Oyaca Akarsu Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, orta ölçekli bir yerleşim bölgesidir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 1.079 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu görece istikrarlı seyretmiştir.",
    population: 1079,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 1079 }, { year: 2008, count: 1081 }, { year: 2009, count: 1038 }, { year: 2010, count: 1050 }, { year: 2011, count: 1032 }, { year: 2012, count: 1023 }, { year: 2013, count: 979 }, { year: 2014, count: 965 }, { year: 2015, count: 947 }, { year: 2016, count: 935 }, { year: 2017, count: 955 }, { year: 2018, count: 926 }, { year: 2019, count: 941 }, { year: 2020, count: 942 }, { year: 2021, count: 931 }, { year: 2022, count: 937 }, { year: 2023, count: 1160 }, { year: 2024, count: 1086 }, { year: 2025, count: 1079 }],
    muhtar: {
      name: "Mustafa Erdoğan",
      mobile: "0536 510 86 22",
    },
    lat: 39.551365,
    lng: 32.593828,
  },
  {
    slug: "oyaca-yesilcam",
    name: "Oyaca Yeşilçam",
    aliases: ["Oyaca Yeşilçam Mahallesi", "Oyaca Yeşilçam"],
    intro:
      "Oyaca Yeşilçam Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 774 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu görece istikrarlı seyretmiştir.",
    population: 774,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 792 }, { year: 2008, count: 816 }, { year: 2009, count: 823 }, { year: 2010, count: 824 }, { year: 2011, count: 831 }, { year: 2012, count: 805 }, { year: 2013, count: 827 }, { year: 2014, count: 771 }, { year: 2015, count: 766 }, { year: 2016, count: 778 }, { year: 2017, count: 759 }, { year: 2018, count: 826 }, { year: 2019, count: 739 }, { year: 2020, count: 727 }, { year: 2021, count: 740 }, { year: 2022, count: 767 }, { year: 2023, count: 776 }, { year: 2024, count: 767 }, { year: 2025, count: 774 }],
    muhtar: {
      name: "Erkan Dilmen",
      mobile: "0553 109 97 01",
    },
    lat: 39.536651,
    lng: 32.609913,
  },
  {
    slug: "selametli-sehit-emrah",
    name: "Selametli Şehit Emrah",
    aliases: ["Selametli Şehit Emrah Mahallesi", "Selametli Şehit Emrah", "Selametli"],
    intro:
      "Selametli Şehit Emrah Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 853 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %68 azalmıştır.",
    population: 853,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 2697 }, { year: 2008, count: 1746 }, { year: 2009, count: 1429 }, { year: 2010, count: 1194 }, { year: 2011, count: 1117 }, { year: 2012, count: 1046 }, { year: 2013, count: 990 }, { year: 2014, count: 932 }, { year: 2015, count: 888 }, { year: 2016, count: 870 }, { year: 2017, count: 844 }, { year: 2018, count: 918 }, { year: 2019, count: 942 }, { year: 2020, count: 883 }, { year: 2021, count: 827 }, { year: 2022, count: 795 }, { year: 2023, count: 878 }, { year: 2024, count: 919 }, { year: 2025, count: 853 }],
    muhtar: {
      name: "İsmail Nalbant",
      mobile: "0537 940 73 94",
    },
    lat: 39.48285,
    lng: 32.806702,
  },
  {
    slug: "sogulcak",
    name: "Soğulcak",
    aliases: ["Soğulcak Mahallesi", "Soğulcak"],
    intro:
      "Soğulcak Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, az nüfuslu bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 188 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %27 azalmıştır.",
    population: 188,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 259 }, { year: 2008, count: 232 }, { year: 2009, count: 210 }, { year: 2010, count: 195 }, { year: 2011, count: 177 }, { year: 2012, count: 136 }, { year: 2013, count: 173 }, { year: 2014, count: 153 }, { year: 2015, count: 157 }, { year: 2016, count: 163 }, { year: 2017, count: 153 }, { year: 2018, count: 174 }, { year: 2019, count: 178 }, { year: 2020, count: 179 }, { year: 2021, count: 170 }, { year: 2022, count: 178 }, { year: 2023, count: 189 }, { year: 2024, count: 188 }, { year: 2025, count: 188 }],
    muhtar: {
      name: "Hasan Işıkdemir",
      mobile: "0536 858 14 20",
    },
    lat: 39.522762,
    lng: 32.870966,
  },
  {
    slug: "subasi",
    name: "Subaşı",
    aliases: ["Subaşı Mahallesi", "Subaşı"],
    intro:
      "Subaşı Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, az nüfuslu bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 255 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu görece istikrarlı seyretmiştir.",
    population: 255,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 288 }, { year: 2008, count: 290 }, { year: 2009, count: 281 }, { year: 2010, count: 270 }, { year: 2011, count: 267 }, { year: 2012, count: 263 }, { year: 2013, count: 272 }, { year: 2014, count: 273 }, { year: 2015, count: 273 }, { year: 2016, count: 258 }, { year: 2017, count: 248 }, { year: 2018, count: 265 }, { year: 2019, count: 258 }, { year: 2020, count: 264 }, { year: 2021, count: 263 }, { year: 2022, count: 254 }, { year: 2023, count: 251 }, { year: 2024, count: 240 }, { year: 2025, count: 255 }],
    muhtar: {
      name: "Yücel Kostak",
      mobile: "0532 205 74 53",
    },
    lat: 39.63778,
    lng: 32.53613,
  },
  {
    slug: "taspinar",
    name: "Taşpınar",
    aliases: ["Taşpınar Mahallesi", "Taşpınar"],
    intro:
      "Ankara-Konya karayoluna yakın konumuyla hızla gelişen mahalle, Ankara'nın Gölbaşı ilçesine bağlı, kalabalık bir mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 6.148 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %518 artarak belirgin bir büyüme göstermiştir.",
    population: 6148,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 995 }, { year: 2008, count: 946 }, { year: 2009, count: 992 }, { year: 2010, count: 999 }, { year: 2011, count: 1012 }, { year: 2012, count: 1037 }, { year: 2013, count: 1102 }, { year: 2014, count: 1142 }, { year: 2015, count: 1109 }, { year: 2016, count: 1257 }, { year: 2017, count: 1510 }, { year: 2018, count: 1946 }, { year: 2019, count: 2216 }, { year: 2020, count: 2548 }, { year: 2021, count: 2966 }, { year: 2022, count: 3313 }, { year: 2023, count: 4109 }, { year: 2024, count: 5037 }, { year: 2025, count: 6148 }],
    muhtar: {
      name: "Sebahattin Mert",
      mobile: "0530 558 19 64",
    },
    lat: 39.815205,
    lng: 32.7689479,
  },
  {
    slug: "tepeyurt",
    name: "Tepeyurt",
    aliases: ["Tepeyurt Mahallesi", "Tepeyurt"],
    intro:
      "Tepeyurt Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, az nüfuslu bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 155 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %72 azalmıştır.",
    population: 155,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 546 }, { year: 2008, count: 479 }, { year: 2009, count: 388 }, { year: 2010, count: 255 }, { year: 2011, count: 230 }, { year: 2012, count: 192 }, { year: 2013, count: 309 }, { year: 2014, count: 226 }, { year: 2015, count: 215 }, { year: 2016, count: 199 }, { year: 2017, count: 187 }, { year: 2018, count: 237 }, { year: 2019, count: 206 }, { year: 2020, count: 199 }, { year: 2021, count: 189 }, { year: 2022, count: 179 }, { year: 2023, count: 193 }, { year: 2024, count: 171 }, { year: 2025, count: 155 }],
    muhtar: {
      name: "Hurşit Şahin",
      mobile: "0531 426 87 17",
    },
    lat: 39.551471,
    lng: 32.819927,
  },
  {
    slug: "topakli",
    name: "Topaklı",
    aliases: ["Topaklı Mahallesi", "Topaklı"],
    intro:
      "Topaklı Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 524 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu görece istikrarlı seyretmiştir.",
    population: 524,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 583 }, { year: 2008, count: 616 }, { year: 2009, count: 598 }, { year: 2010, count: 545 }, { year: 2011, count: 536 }, { year: 2012, count: 558 }, { year: 2013, count: 598 }, { year: 2014, count: 569 }, { year: 2015, count: 539 }, { year: 2016, count: 501 }, { year: 2017, count: 488 }, { year: 2018, count: 564 }, { year: 2019, count: 517 }, { year: 2020, count: 486 }, { year: 2021, count: 486 }, { year: 2022, count: 488 }, { year: 2023, count: 636 }, { year: 2024, count: 531 }, { year: 2025, count: 524 }],
    muhtar: {
      name: "Yasin Özer",
      mobile: "0533 925 98 37",
    },
    lat: 39.6298075,
    lng: 32.6390489,
  },
  {
    slug: "tulumtas",
    name: "Tulumtaş",
    aliases: ["Tulumtaş Mahallesi", "Tulumtaş"],
    intro:
      "Gölbaşı Belediye Başkanı Yakup Odabaşı'nın doğduğu mahalle olan Tulumtaş, Ankara'nın Gölbaşı ilçesine bağlı, orta ölçekli bir yerleşim bölgesidir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 3.592 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %780 artarak belirgin bir büyüme göstermiştir.",
    population: 3592,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 408 }, { year: 2008, count: 534 }, { year: 2009, count: 687 }, { year: 2010, count: 720 }, { year: 2011, count: 770 }, { year: 2012, count: 859 }, { year: 2013, count: 997 }, { year: 2014, count: 1149 }, { year: 2015, count: 1408 }, { year: 2016, count: 1582 }, { year: 2017, count: 1690 }, { year: 2018, count: 1803 }, { year: 2019, count: 1955 }, { year: 2020, count: 2168 }, { year: 2021, count: 2408 }, { year: 2022, count: 2708 }, { year: 2023, count: 3257 }, { year: 2024, count: 3431 }, { year: 2025, count: 3592 }],
    muhtar: {
      name: "Kazım Koç",
      phone: "(0312) 499 60 68",
      mobile: "0532 789 51 49",
    },
    lat: 39.757964,
    lng: 32.653587,
  },
  {
    slug: "velihimmetli",
    name: "Velihimmetli",
    aliases: ["Velihimmetli Mahallesi", "Velihimmetli"],
    intro:
      "Velihimmetli Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 593 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu görece istikrarlı seyretmiştir.",
    population: 593,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 518 }, { year: 2008, count: 617 }, { year: 2009, count: 634 }, { year: 2010, count: 593 }, { year: 2011, count: 574 }, { year: 2012, count: 551 }, { year: 2013, count: 577 }, { year: 2014, count: 548 }, { year: 2015, count: 488 }, { year: 2016, count: 482 }, { year: 2017, count: 521 }, { year: 2018, count: 771 }, { year: 2019, count: 690 }, { year: 2020, count: 642 }, { year: 2021, count: 615 }, { year: 2022, count: 586 }, { year: 2023, count: 659 }, { year: 2024, count: 608 }, { year: 2025, count: 593 }],
    muhtar: {
      name: "Ali İhsan Okman",
      mobile: "0532 396 26 15",
    },
    lat: 39.690565,
    lng: 32.655174,
  },
  {
    slug: "yaglipinar",
    name: "Yağlıpınar",
    aliases: ["Yağlıpınar Mahallesi", "Yağlıpınar"],
    intro:
      "Yağlıpınar Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 396 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %37 artmıştır.",
    population: 396,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 290 }, { year: 2008, count: 324 }, { year: 2009, count: 330 }, { year: 2010, count: 320 }, { year: 2011, count: 319 }, { year: 2012, count: 293 }, { year: 2013, count: 366 }, { year: 2014, count: 361 }, { year: 2015, count: 361 }, { year: 2016, count: 312 }, { year: 2017, count: 318 }, { year: 2018, count: 337 }, { year: 2019, count: 351 }, { year: 2020, count: 323 }, { year: 2021, count: 349 }, { year: 2022, count: 344 }, { year: 2023, count: 470 }, { year: 2024, count: 414 }, { year: 2025, count: 396 }],
    muhtar: {
      name: "Halil İbrahim Mirza",
      phone: "(0312) 499 50 33",
      mobile: "0532 431 65 82",
    },
    lat: 39.652545,
    lng: 32.805518,
  },
  {
    slug: "yavrucak",
    name: "Yavrucuk",
    aliases: ["Yavrucuk Mahallesi", "Yavrucuk", "Yavrucak"],
    intro:
      "Yavrucuk Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 386 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %23 artmıştır.",
    population: 386,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 313 }, { year: 2008, count: 449 }, { year: 2009, count: 414 }, { year: 2010, count: 382 }, { year: 2011, count: 385 }, { year: 2012, count: 381 }, { year: 2013, count: 427 }, { year: 2014, count: 384 }, { year: 2015, count: 364 }, { year: 2016, count: 361 }, { year: 2017, count: 338 }, { year: 2018, count: 385 }, { year: 2019, count: 390 }, { year: 2020, count: 371 }, { year: 2021, count: 349 }, { year: 2022, count: 339 }, { year: 2023, count: 459 }, { year: 2024, count: 411 }, { year: 2025, count: 386 }],
    muhtar: {
      name: "Hasan Hüseyin Yaman",
      mobile: "0532 512 32 55",
    },
    lat: 39.6976749,
    lng: 32.743666,
  },
  {
    slug: "yaylabag",
    name: "Yaylabağ",
    aliases: ["Yaylabağ Mahallesi", "Yaylabağ"],
    intro:
      "Yaylabağ Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 518 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %33 artmıştır.",
    population: 518,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 390 }, { year: 2008, count: 422 }, { year: 2009, count: 418 }, { year: 2010, count: 414 }, { year: 2011, count: 404 }, { year: 2012, count: 408 }, { year: 2013, count: 441 }, { year: 2014, count: 473 }, { year: 2015, count: 468 }, { year: 2016, count: 437 }, { year: 2017, count: 444 }, { year: 2018, count: 452 }, { year: 2019, count: 450 }, { year: 2020, count: 445 }, { year: 2021, count: 454 }, { year: 2022, count: 441 }, { year: 2023, count: 539 }, { year: 2024, count: 515 }, { year: 2025, count: 518 }],
    muhtar: {
      name: "Adem Çetin",
      mobile: "0532 477 55 53",
    },
    lat: 39.79873,
    lng: 32.887268,
  },
  {
    slug: "yurtbeyi",
    name: "Yurtbeyi",
    aliases: ["Yurtbeyi Mahallesi", "Yurtbeyi"],
    intro:
      "Yurtbeyi Mahallesi, Ankara'nın Gölbaşı ilçesine bağlı, küçük bir kırsal mahalledir.\n\nTÜİK Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) 2025 verilerine göre 904 nüfusa sahip olan mahallenin, 2007'den bu yana nüfusu %25 artmıştır.",
    population: 904,
    populationYear: 2025,
    populationHistory: [{ year: 2007, count: 725 }, { year: 2008, count: 722 }, { year: 2009, count: 731 }, { year: 2010, count: 720 }, { year: 2011, count: 730 }, { year: 2012, count: 705 }, { year: 2013, count: 758 }, { year: 2014, count: 738 }, { year: 2015, count: 717 }, { year: 2016, count: 740 }, { year: 2017, count: 756 }, { year: 2018, count: 931 }, { year: 2019, count: 893 }, { year: 2020, count: 866 }, { year: 2021, count: 834 }, { year: 2022, count: 825 }, { year: 2023, count: 904 }, { year: 2024, count: 875 }, { year: 2025, count: 904 }],
    muhtar: {
      name: "Ercan Aşkın",
      mobile: "0530 323 96 11",
    },
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
