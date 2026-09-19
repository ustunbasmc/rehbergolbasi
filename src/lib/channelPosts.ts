import { getCardDescription } from "@/lib/businessDescription";

/**
 * Yeni eklenen işletmeyi WhatsApp Kanalı'nda duyurmak için hazır paylaşım
 * metni (WhatsApp biçimlendirmesi: *kalın*). Kanala otomatik gönderim mümkün
 * olmadığı için admin bu metni kopyalayıp kanala elle yapıştırır; link
 * önizlemesi işletmenin kapak görselini getirir.
 */
export function buildBusinessChannelPost(
  business: {
    name: string;
    slug: string;
    neighborhood: string | null;
    short_description?: string | null;
    description?: string | null;
  },
  categoryName: string | null,
  baseUrl: string
): string {
  const place = [categoryName, business.neighborhood].filter(Boolean).join(" · ");
  const description = getCardDescription(business);
  return [
    `🆕 *Yeni işletme: ${business.name}*`,
    place ? `📍 ${place}` : null,
    description,
    `🔗 Profili gör:\n${baseUrl}/isletme/${business.slug}`,
  ]
    .filter((part): part is string => !!part)
    .join("\n\n");
}
