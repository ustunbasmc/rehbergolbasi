import type { OpeningHours } from "@/lib/types";

const DAY_KEYS: (keyof OpeningHours)[] = ["paz", "pzt", "sal", "car", "per", "cum", "cmt"];

export function getOpenStatus(hours: OpeningHours | null): {
  isOpen: boolean;
  todayLabel: string;
  todayHours: string;
} | null {
  if (!hours) return null;

  const now = new Date();
  const dayKey = DAY_KEYS[now.getDay()];
  const today = hours[dayKey];

  if (!today || today.closed) {
    return { isOpen: false, todayLabel: dayKey, todayHours: "Kapalı" };
  }

  const [openH, openM] = today.open.split(":").map(Number);
  const [closeH, closeM] = today.close.split(":").map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes;

  return {
    isOpen,
    todayLabel: dayKey,
    todayHours: `${today.open} - ${today.close}`,
  };
}