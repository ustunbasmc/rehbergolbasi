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

export function getBusinessSchemaType(categorySlug: string | undefined, businessName: string): string {
  if (!categorySlug) return "LocalBusiness";

  if (categorySlug === "diger-kamu-kurumlari") {
    if (businessName.includes("Hastane")) return "Hospital";
    if (businessName.includes("Kütüphane")) return "Library";
    return "GovernmentOffice";
  }

  return RESMI_KURUM_SCHEMA_BY_SLUG[categorySlug] ?? "LocalBusiness";
}
