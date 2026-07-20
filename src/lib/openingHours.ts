import type { OpeningHours } from "@/lib/types";

const DAY_KEYS: (keyof OpeningHours)[] = ["paz", "pzt", "sal", "car", "per", "cum", "cmt"];

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/**
 * Sunucunun kendi saat dilimi ne olursa olsun (Vercel UTC kullanır),
 * her zaman Türkiye saatine göre gün/saat döndürür.
 */
function getIstanbulNow(date: Date): { dayIndex: number; hours: number; minutes: number } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const map: Record<string, string> = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });

  let hours = parseInt(map.hour, 10);
  if (hours === 24) hours = 0;

  return {
    dayIndex: WEEKDAY_TO_INDEX[map.weekday] ?? 0,
    hours,
    minutes: parseInt(map.minute, 10),
  };
}

export function getOpenStatus(hours: OpeningHours | null): {
  isOpen: boolean;
  todayLabel: string;
  todayHours: string;
} | null {
  if (!hours) return null;

  const { dayIndex, hours: nowH, minutes: nowM } = getIstanbulNow(new Date());
  const dayKey = DAY_KEYS[dayIndex];
  const today = hours[dayKey];

  if (!today || today.closed) {
    return { isOpen: false, todayLabel: dayKey, todayHours: "Kapalı" };
  }

  const [openH, openM] = today.open.split(":").map(Number);
  const [closeH, closeM] = today.close.split(":").map(Number);
  const nowMinutes = nowH * 60 + nowM;
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes;

  return {
    isOpen,
    todayLabel: dayKey,
    todayHours: `${today.open} - ${today.close}`,
  };
}