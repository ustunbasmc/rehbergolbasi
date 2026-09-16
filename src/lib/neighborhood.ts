import { MAHALLELER } from "@/data/mahalleler";

const ALIAS_TO_NAME = new Map<string, string>();
MAHALLELER.forEach((m) => {
  m.aliases.forEach((alias) => ALIAS_TO_NAME.set(alias.trim(), m.name));
});

/**
 * `businesses.neighborhood` ve `gundem_posts.neighborhoods` serbest metin
 * alanları — aynı mahalle "Bahçelievler" / "Bahçelievler Mahallesi" gibi
 * farklı yazımlarla kayıtlı olabiliyor. Bilinen bir mahalleyse kurallı ismini
 * döner, değilse (ör. "Gölbaşı" gibi genel bir değer) ham veriyi trimleyip
 * olduğu gibi döner.
 */
export function normalizeNeighborhood(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return ALIAS_TO_NAME.get(trimmed) ?? trimmed;
}
