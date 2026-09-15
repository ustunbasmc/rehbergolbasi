import { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning } from "lucide-react";
import { formatIstanbulDateLabel } from "@/lib/timezone";

const GOLBASI_LAT = 39.79;
const GOLBASI_LON = 32.8;

function weatherInfo(code: number) {
  if (code === 0) return { label: "Açık", Icon: Sun };
  if (code === 1 || code === 2) return { label: "Parçalı bulutlu", Icon: CloudSun };
  if (code === 3) return { label: "Bulutlu", Icon: Cloud };
  if (code === 45 || code === 48) return { label: "Sisli", Icon: CloudFog };
  if ([51, 53, 55].includes(code)) return { label: "Çisenti", Icon: CloudDrizzle };
  if ([61, 63, 65, 80, 81, 82].includes(code)) return { label: "Yağmurlu", Icon: CloudRain };
  if ([71, 73, 75].includes(code)) return { label: "Karlı", Icon: CloudSnow };
  if ([95, 96, 99].includes(code)) return { label: "Gök gürültülü", Icon: CloudLightning };
  return { label: "Değişken", Icon: Cloud };
}

async function getWeather() {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${GOLBASI_LAT}&longitude=${GOLBASI_LON}` +
        `&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min` +
        `&timezone=Europe%2FIstanbul&forecast_days=1`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function WeatherWidget() {
  const data = await getWeather();
  if (!data) return null;

  const current = weatherInfo(data.current.weather_code);
  const CurrentIcon = current.Icon;

  // `toLocaleDateString` timeZone verilmeden çağrılırsa sunucunun kendi saat
  // dilimini (Vercel'de UTC) kullanır — Türkiye saatiyle UTC arasındaki 3
  // saatlik fark, gece yarısına yakın saatlerde bir gün geride/ileride
  // yanlış tarih gösterilmesine yol açıyordu (bkz. teslim raporu).
  const today = formatIstanbulDateLabel(new Date(), { day: "numeric", month: "long" });
  const maxTemp = Math.round(data.daily.temperature_2m_max[0]);
  const minTemp = Math.round(data.daily.temperature_2m_min[0]);

  return (
    <div className="card-shadow flex h-full flex-col gap-3 rounded-2xl bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy/10 text-sm">
            <CurrentIcon className="h-3.5 w-3.5 text-navy" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wide text-navy">Hava Durumu</span>
        </div>
        <span className="text-[11px] font-semibold text-ink/40">{today}</span>
      </div>

      <div className="flex items-center gap-3">
        <CurrentIcon className="h-9 w-9 shrink-0 text-gold-dark" />
        <div className="min-w-0">
          <p className="font-display text-2xl font-extrabold leading-none text-navy">
            {Math.round(data.current.temperature_2m)}°C
          </p>
          <p className="mt-1 truncate text-xs text-ink/55">
            {current.label} · {maxTemp}° / {minTemp}°
          </p>
        </div>
      </div>

      <p className="mt-auto border-t border-line pt-2.5 text-[11px] text-ink/40">Gölbaşı, Ankara</p>
    </div>
  );
}
