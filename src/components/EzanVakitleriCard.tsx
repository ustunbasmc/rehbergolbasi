import { formatIstanbulDateLabel, getIstanbulDateString, getIstanbulTimeLabel } from "@/lib/timezone";

const GOLBASI_LAT = 39.79;
const GOLBASI_LON = 32.8;
// method=13: Diyanet İşleri Başkanlığı (Türkiye) hesaplama yöntemi — aladhan.com
// bu yöntemle Diyanet'in resmi vakitlerine en yakın sonucu üretir.
const DIYANET_METHOD = 13;

const VAKIT_ETIKETLERI: { key: keyof AladhanTimings; label: string }[] = [
  { key: "Imsak", label: "İmsak" },
  { key: "Sunrise", label: "Güneş" },
  { key: "Dhuhr", label: "Öğle" },
  { key: "Asr", label: "İkindi" },
  { key: "Maghrib", label: "Akşam" },
  { key: "Isha", label: "Yatsı" },
];

interface AladhanTimings {
  Imsak: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

function toDDMMYYYY(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}-${m}-${y}`;
}

// Aladhan bazen "05:24 (+03)" gibi bölge son eki döndürür; yalnızca "HH:mm" alınır.
function cleanTime(raw: string): string {
  return raw.split(" ")[0];
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

async function getPrayerTimes(): Promise<AladhanTimings | null> {
  try {
    const dateParam = toDDMMYYYY(getIstanbulDateString());
    const res = await fetch(
      `https://api.aladhan.com/v1/timings/${dateParam}?latitude=${GOLBASI_LAT}&longitude=${GOLBASI_LON}&method=${DIYANET_METHOD}`,
      { next: { revalidate: 21600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const timings = data?.data?.timings;
    if (!timings) return null;
    return {
      Imsak: cleanTime(timings.Imsak),
      Sunrise: cleanTime(timings.Sunrise),
      Dhuhr: cleanTime(timings.Dhuhr),
      Asr: cleanTime(timings.Asr),
      Maghrib: cleanTime(timings.Maghrib),
      Isha: cleanTime(timings.Isha),
    };
  } catch {
    return null;
  }
}

export default async function EzanVakitleriCard() {
  const timings = await getPrayerTimes();
  if (!timings) return null;

  const today = formatIstanbulDateLabel(new Date(), { day: "numeric", month: "long" });
  const nowMinutes = toMinutes(getIstanbulTimeLabel(new Date()));

  const vakitler = VAKIT_ETIKETLERI.map((v) => ({ label: v.label, time: timings[v.key] }));
  const nextIdx = vakitler.findIndex((v) => toMinutes(v.time) > nowMinutes);
  // Gün içindeki tüm vakitler geçtiyse sıradaki, yarının İmsak'ıdır.
  const next = nextIdx === -1 ? { ...vakitler[0], tomorrow: true } : { ...vakitler[nextIdx], tomorrow: false };

  return (
    <div className="card-shadow flex h-full flex-col gap-3 rounded-2xl bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 text-sm">🕌</span>
          <span className="text-xs font-bold uppercase tracking-wide text-gold-dark">Ezan Vakitleri</span>
        </div>
        <span className="text-[11px] font-semibold text-ink/40">{today}</span>
      </div>

      <div>
        <p className="text-xs text-ink/50">{next.tomorrow ? "Yarın ilk vakit" : "Sıradaki vakit"}</p>
        <p className="flex items-baseline gap-2">
          <span className="font-display text-lg font-extrabold text-navy">{next.label}</span>
          <span className="font-display text-2xl font-extrabold leading-none text-bordo">{next.time}</span>
        </p>
      </div>

      <div className="mt-auto flex flex-wrap gap-x-2.5 gap-y-1 border-t border-line pt-2.5 text-[11px] text-ink/45">
        {vakitler.map((v) => (
          <span key={v.label}>
            {v.label} <b className="font-semibold text-ink/70">{v.time}</b>
          </span>
        ))}
      </div>
    </div>
  );
}
