import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Droplets,
  Wind,
} from "lucide-react";

const GOLBASI_LAT = 39.79;
const GOLBASI_LON = 32.8;
const GUN_KISA = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

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
      `https://api.open-meteo.com/v1/forecast?latitude=${GOLBASI_LAT}&longitude=${GOLBASI_LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FIstanbul&forecast_days=5`,
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

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-navy">Hava Durumu</p>
          <p className="text-xs text-ink/50">Gölbaşı, Ankara</p>
        </div>
        <CurrentIcon className="h-8 w-8 text-bordo" />
      </div>

      <div className="mb-4 flex items-end gap-2">
        <span className="font-display text-4xl font-extrabold text-navy">
          {Math.round(data.current.temperature_2m)}°C
        </span>
        <span className="mb-1 text-sm text-ink/50">{current.label}</span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-xs text-ink/60">
        <span className="flex items-center gap-1.5">
          <Droplets className="h-3.5 w-3.5 text-navy/40" /> Nem %{data.current.relative_humidity_2m}
        </span>
        <span className="flex items-center gap-1.5">
          <Wind className="h-3.5 w-3.5 text-navy/40" /> {Math.round(data.current.wind_speed_10m)} km/sa
        </span>
      </div>

      <div className="flex justify-between gap-1 border-t border-line pt-3">
        {data.daily.time.slice(0, 5).map((dateStr: string, i: number) => {
          const day = weatherInfo(data.daily.weather_code[i]);
          const DayIcon = day.Icon;
          const dow = GUN_KISA[new Date(dateStr).getDay()];
          return (
            <div key={dateStr} className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-semibold text-ink/50">{i === 0 ? "Bugün" : dow}</span>
              <DayIcon className="h-4 w-4 text-bordo/70" />
              <span className="text-[11px] font-bold text-navy">
                {Math.round(data.daily.temperature_2m_max[i])}°
              </span>
              <span className="text-[11px] text-ink/40">{Math.round(data.daily.temperature_2m_min[i])}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}