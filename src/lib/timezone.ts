const ISTANBUL_TZ = "Europe/Istanbul";

/**
 * Sunucunun kendi saat dilimi ne olursa olsun (Vercel varsayılan olarak UTC
 * kullanır) her zaman Türkiye takvim gününe göre "YYYY-MM-DD" döndürür.
 * `toISOString().slice(0,10)` UTC kullandığı için Türkiye'nin gece
 * 00:00–02:59 saatlerinde HÂLÂ bir önceki günü döndürür — bu, nöbetçi eczane
 * "bugün" eşleşmesinin gece saatlerinde başarısız olmasına yol açan asıl
 * nedendi. "en-CA" locale'i Intl.DateTimeFormat'tan doğrudan YYYY-MM-DD
 * biçimini almak için kullanılıyor.
 */
export function getIstanbulDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ISTANBUL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Kullanıcıya gösterilecek Türkçe tarih etiketi ("15 Eylül Salı" gibi),
 * her zaman Türkiye saat dilimine göre hesaplanır. `toLocaleDateString`'e
 * `timeZone` verilmeden çağrılması, sunucunun UTC saatine göre bir gün
 * geride bir tarih göstermesine yol açan hava durumu kartı hatasının
 * asıl nedeniydi.
 */
export function formatIstanbulDateLabel(
  date: Date = new Date(),
  options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }
): string {
  return new Intl.DateTimeFormat("tr-TR", { ...options, timeZone: ISTANBUL_TZ }).format(date);
}

/** Türkiye saatine göre "HH:mm" biçiminde şu anki saat. */
export function getIstanbulTimeLabel(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: ISTANBUL_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * "YYYY-MM-DDTHH" biçiminde Türkiye saatine göre şu anki saat öneki —
 * Open-Meteo'nun `&timezone=Europe/Istanbul` ile döndürdüğü `hourly.time`
 * dizisiyle karşılaştırmak için. Bunun yerine UTC ISO string kullanmak,
 * Türkiye ile UTC arasındaki 3 saatlik farktan dolayı yanlış saatin
 * (dolayısıyla yanlış görüş mesafesi gibi değerlerin) seçilmesine yol açardı.
 */
export function getIstanbulHourPrefix(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ISTANBUL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const map: Record<string, string> = {};
  parts.forEach((p) => { map[p.type] = p.value; });
  const hour = map.hour === "24" ? "00" : map.hour;
  return `${map.year}-${map.month}-${map.day}T${hour}`;
}
