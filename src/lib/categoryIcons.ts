import {
  Utensils,
  Scissors,
  Home,
  Car,
  Wrench,
  HeartPulse,
  GraduationCap,
  PartyPopper,
  ShoppingBasket,
  Store,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  scissors: Scissors,
  home: Home,
  car: Car,
  wrench: Wrench,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  "party-popper": PartyPopper,
  "shopping-basket": ShoppingBasket,
  store: Store,
};

export function getCategoryIcon(icon: string | null): LucideIcon {
  if (!icon) return Store;
  return CATEGORY_ICONS[icon] ?? Store;
}