const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 0/O, 1/I gibi karıştırılabilecek karakterler çıkarıldı

/**
 * Tarayıcıda, güvenli rastgele (crypto) kaynaklı, tahmin edilemez bir
 * başvuru referans kodu üretir. Sunucuya id ile birlikte gönderilir; bu
 * sayede public/anon INSERT sonrası SELECT RLS'ine ihtiyaç duymadan
 * istemci referans kodunu zaten bilir.
 */
export function generateReferenceCode(): string {
  const length = 8;
  const bytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let code = "";
  for (let i = 0; i < length; i++) {
    code += REFERENCE_ALPHABET[bytes[i] % REFERENCE_ALPHABET.length];
  }
  return code;
}

/**
 * Tarayıcı desteklemiyorsa (çok eski tarayıcı) bile bir UUID üretir.
 */
export function generateSubmissionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // RFC4122 v4 benzeri düşük-entropi yedek — yalnızca crypto.randomUUID
  // desteklenmeyen çok eski tarayıcılar için.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Kullanıcı yazarken Türkiye telefon numarasını okunabilir biçimde
 * formatlar (05XX XXX XX XX). Sabit hat (0XXX XXX XX XX) için de çalışır.
 * Yalnızca görüntüleme amaçlıdır — veritabanına normalize edilmiş biçimde
 * kaydetme işlemi sunucu tarafında (DB trigger) yapılır.
 */
export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  const parts = [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 9), digits.slice(9, 11)].filter(
    Boolean
  );
  return parts.join(" ");
}

export function isValidTurkishPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  // 10 hane (5XX XXX XX XX, başındaki 0 olmadan) ya da 11 hane (0 ile başlayan)
  if (digits.length === 10) return /^[2-9]/.test(digits);
  if (digits.length === 11) return digits.startsWith("0");
  return false;
}

const SAFE_URL_PATTERN = /^https?:\/\/[^\s<>"']+$/i;

/**
 * Yalnızca http/https bağlantılarını kabul eder; javascript:, data: gibi
 * tehlikeli şemaları reddeder. Instagram kullanıcı adı gibi düz metin
 * girilirse güvenli bir instagram.com bağlantısına çevirir.
 */
export function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  if (!SAFE_URL_PATTERN.test(withProtocol)) return null;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function normalizeInstagram(raw: string): string | null {
  const trimmed = raw.trim().replace(/^@/, "");
  if (!trimmed) return null;
  // Zaten tam bir instagram.com linkiyse onu güvenli şekilde doğrula.
  if (/instagram\.com/i.test(trimmed)) {
    return normalizeUrl(trimmed);
  }
  // Yalnızca kullanıcı adı girilmişse (harf/rakam/nokta/alt çizgi) güvenli bağlantı üret.
  if (/^[a-zA-Z0-9._]{1,30}$/.test(trimmed)) {
    return `https://instagram.com/${trimmed}`;
  }
  return null;
}

export function detectDeviceGroup(): "mobile" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  return /mobile|android|iphone|ipad/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

/**
 * URL'deki utm_* parametrelerini ve referrer'ı okur. Kişisel veri
 * içermez — yalnızca kampanya/kaynak takibi için.
 */
export function readAttributionParams(): {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
} {
  if (typeof window === "undefined") {
    return { utm_source: null, utm_medium: null, utm_campaign: null, referrer: null };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    referrer: document.referrer || null,
  };
}
