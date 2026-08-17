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
  Thermometer,
  Eye,
  MapPin,
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
      `https://api.open-meteo.com/v1/forecast?latitude=${GOLBASI_LAT}&longitude=${GOLBASI_LON}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
        `&hourly=visibility` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&timezone=Europe%2FIstanbul&forecast_days=5`,
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

  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // hourly.time içinde şu anki saate en yakın index'i bul, görüş mesafesini oradan al.
  const nowHour = new Date().toISOString().slice(0, 13);
  const visibilityIdx = Math.max(
    0,
    (data.hourly?.time as string[])?.findIndex((t: string) => t.startsWith(nowHour)) ?? 0
  );
  const visibilityKm = data.hourly?.visibility?.[visibilityIdx]
    ? Math.round(data.hourly.visibility[visibilityIdx] / 1000)
    : null;

  const metrics = [
    { icon: Droplets, label: "Nem", value: `%${data.current.relative_humidity_2m}` },
    { icon: Wind, label: "Rüzgar", value: `${Math.round(data.current.wind_speed_10m)} km/sa` },
    { icon: Thermometer, label: "Hissedilen", value: `${Math.round(data.current.apparent_temperature)}°C` },
    ...(visibilityKm !== null ? [{ icon: Eye, label: "Görüş", value: `${visibilityKm} km` }] : []),
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      {/* Üst: tarih + konum + büyük sıcaklık */}
      <div className="bg-gradient-to-br from-navy to-navy-dark p-5 text-white">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold">Hava Durumu</p>
            <p className="text-xs text-white/60">{today}</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold">
            <MapPin className="h-3 w-3" /> Gölbaşı, Ankara
          </span>
        </div>

        <div className="flex items-center gap-3">
          <CurrentIcon className="h-12 w-12 text-gold" />
          <div>
            <p className="font-display text-4xl font-extrabold leading-none">
              {Math.round(data.current.temperature_2m)}°C
            </p>
            <p className="mt-1 text-sm text-white/70">{current.label}</p>
          </div>
        </div>
      </div>

      {/* Metrikler */}
      <div className="grid grid-cols-2 gap-3 border-b border-line px-5 py-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bordo/10">
                <Icon className="h-3.5 w-3.5 text-bordo" />
              </span>
              <div>
                <p className="text-[11px] text-ink/45">{m.label}</p>
                <p className="text-xs font-bold text-navy">{m.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5 günlük tahmin */}
      <div className="flex justify-between gap-1 px-5 py-4">
        {data.daily.time.map((dateStr: string, i: number) => {
          const day = weatherInfo(data.daily.weather_code[i]);
          const DayIcon = day.Icon;
          const dow = GUN_KISA[new Date(dateStr).getDay()];
          const isToday = i === 0;
          return (
            <div
              key={dateStr}
              className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl py-2 ${
                isToday ? "bg-bordo/5" : ""
              }`}
            >
              <span
                className={`text-[11px] font-bold ${isToday ? "text-bordo" : "text-ink/50"}`}
              >
                {isToday ? "Bugün" : dow}
              </span>
              <DayIcon className="h-4 w-4 text-navy/60" />
              <span className="text-xs font-bold text-navy">
                {Math.round(data.daily.temperature_2m_max[i])}°
              </span>
              <span className="text-[11px] text-ink/40">
                {Math.round(data.daily.temperature_2m_min[i])}°
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}