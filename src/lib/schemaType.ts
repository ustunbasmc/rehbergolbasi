const RESMI_KURUM_SCHEMA_BY_SLUG: Record<string, string> = {
  belediye: "CityHall",
  kaymakamlik: "GovernmentOffice",
  "nufus-mudurlugu": "GovernmentOffice",
  "vergi-dairesi": "GovernmentOffice",
  ptt: "PostOffice",
  "emniyet-jandarma": "PoliceStation",
};

export const RESMI_KURUM_SLUGS = new Set([
  ...Object.keys(RESMI_KURUM_SCHEMA_BY_SLUG),
  "diger-kamu-kurumlari",
]);

/**
 * Resmi kurumlar dışındaki tüm kategoriler için alt kategori veya üst
 * kategori slug'ından schema.org tipine eşleme. Her iki seviyeyi de
 * kapsıyor çünkü bazı işletmeler alt kategori seçilmeden doğrudan üst
 * kategoriye atanmış olabiliyor (bkz. businesses.category_id).
 */
const GENERAL_SCHEMA_BY_SLUG: Record<string, string> = {
  // Restoran & Kafe
  "restoran-kafe": "Restaurant",
  kafeler: "CafeOrCoffeeShop",
  "fast-food": "FastFoodRestaurant",
  kebapcilar: "Restaurant",
  "pide-lahmacun": "Restaurant",
  "ev-yemekleri-ocakbasi": "Restaurant",
  "kahvalti-salonlari": "Restaurant",
  pastaneler: "Bakery",
  tatli: "Bakery",
  donerci: "FastFoodRestaurant",

  // Kuaför & Güzellik
  "kuafor-guzellik": "BeautySalon",
  "erkek-kuaforu-berber": "HairSalon",
  "kadin-kuaforu": "HairSalon",
  "guzellik-salonu": "BeautySalon",
  "nail-art": "NailSalon",
  "cilt-bakimi-spa": "DaySpa",

  // Emlak
  emlak: "RealEstateAgent",
  "konut-emlak": "RealEstateAgent",
  "arsa-tarla": "RealEstateAgent",
  "is-yeri-emlak": "RealEstateAgent",
  "emlak-danismanligi": "RealEstateAgent",

  // Oto Servis & Yedek Parça
  "oto-servis": "AutoRepair",
  "oto-cekici-yol-yardim": "AutoRepair",
  lastikci: "TireShop",
  "oto-elektrik": "AutoRepair",
  "kaporta-boya": "AutoBodyShop",
  "yedek-parca": "AutoPartsStore",

  // Ev Hizmetleri
  "ev-hizmetleri": "HomeAndConstructionBusiness",
  tesisatci: "Plumber",
  elektrikci: "Electrician",
  boyaci: "HousePainter",
  "temizlik-hizmetleri": "HomeAndConstructionBusiness",
  "nakliyat-evden-eve": "MovingCompany",
  "peyzaj-bahce-bakimi": "HomeAndConstructionBusiness",

  // Ev Eşyası & Mobilya
  "ev-esyasi-mobilya": "HomeGoodsStore",
  "hali-magazasi": "HomeGoodsStore",
  "perde-ceyiz": "HomeGoodsStore",

  // Sağlık
  saglik: "MedicalClinic",
  "dis-hekimi": "Dentist",
  eczane: "Pharmacy",
  veteriner: "VeterinaryCare",
  fizyoterapi: "MedicalClinic",
  "ozel-klinik": "MedicalClinic",
  "cocuk-gelisimi-ve-aile-danismanligi": "MedicalClinic",

  // Eğitim
  egitim: "EducationalOrganization",
  "anaokulu-kres": "Preschool",
  "ozel-ders-etut-merkezi": "EducationalOrganization",
  "surucu-kursu": "EducationalOrganization",
  "dil-kursu": "EducationalOrganization",
  "muzik-sanat-kursu": "EducationalOrganization",
  "ozel-okul-kolej": "School",
  "kiz-ogrenci-yurtlari": "LodgingBusiness",
  "erkek-ogrenci-yurtlari": "LodgingBusiness",

  // Düğün & Etkinlik
  "dugun-etkinlik": "EventVenue",
  "dugun-salonu": "EventVenue",
  fotografci: "ProfessionalService",
  "organizasyon-dekorasyon": "ProfessionalService",
  cicekci: "Florist",

  // Market & Manav
  "market-manav": "GroceryStore",
  manav: "GroceryStore",
  kasap: "Store",
  sarkuteri: "GroceryStore",
  firin: "Bakery",

  // Diğer Hizmetler
  kirtasiye: "Store",
  terzi: "ProfessionalService",
  anahtarci: "Locksmith",
  "kuru-temizleme": "DryCleaningOrLaundry",
  "taksi-duragi": "TaxiStand",

  // Spor & Fitness
  "spor-fitness": "SportsActivityLocation",
  "spor-salonu-fitness-merkezi": "ExerciseGym",
  "pilates-yoga-studyosu": "ExerciseGym",
  "dovus-sporlari": "SportsActivityLocation",
  "cocuk-spor-okullari": "SportsActivityLocation",

  // Konaklama
  konaklama: "LodgingBusiness",
  otel: "Hotel",

  // Giyim & Moda
  "giyim-moda": "ClothingStore",
  "kadin-giyim-butik": "ClothingStore",
};

export function getBusinessSchemaType(categorySlug: string | undefined, businessName: string): string {
  if (!categorySlug) return "LocalBusiness";

  if (categorySlug === "diger-kamu-kurumlari") {
    if (businessName.includes("Hastane")) return "Hospital";
    if (businessName.includes("Kütüphane")) return "Library";
    return "GovernmentOffice";
  }

  if (RESMI_KURUM_SCHEMA_BY_SLUG[categorySlug]) {
    return RESMI_KURUM_SCHEMA_BY_SLUG[categorySlug];
  }

  return GENERAL_SCHEMA_BY_SLUG[categorySlug] ?? "LocalBusiness";
}
