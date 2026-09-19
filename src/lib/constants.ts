export const COOKIE_CONSENT_STORAGE_KEY = "rehbergolbasi_cookie_consent";

/**
 * RehberGölbaşı'nın işletme/başvuru iletişimi için kullandığı WhatsApp hattı.
 * Daha önce birden fazla dosyada hard-code edilmişti; tek buradan okunur.
 * `NEXT_PUBLIC_WHATSAPP_NUMBER` env değişkeni tanımlıysa ona öncelik verilir
 * (Vercel'de ortam değişkeni olarak eklenebilir); tanımlı değilse mevcut
 * numara ile geriye dönük uyumlu çalışmaya devam eder.
 */
export const WHATSAPP_NUMBER: string | null =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || "905396394206";

/** "RehberGölbaşı Gündem" WhatsApp Kanalı — sitedeki "Kanalımıza katıl" bağlantıları ve kanal paylaşım metni buradan okur. */
export const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029Vb8cezCCHDyc8SrywW1J";
