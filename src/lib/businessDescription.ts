export const SHORT_DESCRIPTION_IDEAL_LENGTH = 160;
export const SHORT_DESCRIPTION_MAX_LENGTH = 180;

/**
 * Kelimeyi ortadan bölmeden, verilen sınırın altında bir metin döndürür.
 */
function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  const safeSlice = lastSpace > 40 ? slice.slice(0, lastSpace) : slice;
  return safeSlice.trim().replace(/[.,;:!?-]+$/, "") + "…";
}

/**
 * Uzun açıklamanın ilk anlamlı paragrafından güvenli bir özet üretir.
 * Veritabanındaki `description` alanının üzerine yazmaz, yalnızca
 * görüntüleme sırasında hesaplanır (fallback).
 */
function fallbackFromDescription(description: string): string {
  const firstParagraph =
    description
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p.length > 0) ?? description.trim();

  const singleLine = firstParagraph.replace(/\s+/g, " ").trim();
  return truncateAtWord(singleLine, SHORT_DESCRIPTION_IDEAL_LENGTH);
}

/**
 * Kartlarda ve liste görünümlerinde gösterilecek kısa açıklamayı döndürür.
 * Öncelik: gerçek `short_description` alanı > uzun açıklamadan üretilen
 * güvenli fallback özet > null (açıklama yoksa hiçbir şey gösterilmez).
 */
export function getCardDescription(business: {
  short_description?: string | null;
  description?: string | null;
}): string | null {
  const short = business.short_description?.trim();
  if (short) return short;

  const long = business.description?.trim();
  if (long) return fallbackFromDescription(long);

  return null;
}
