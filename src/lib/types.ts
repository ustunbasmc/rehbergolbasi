export interface DayHours {
  closed: boolean;
  open: string;
  close: string;
}

export type OpeningHours = {
  pzt: DayHours;
  sal: DayHours;
  car: DayHours;
  per: DayHours;
  cum: DayHours;
  cmt: DayHours;
  paz: DayHours;
};

export const DAY_LABELS: Record<keyof OpeningHours, string> = {
  pzt: "Pazartesi",
  sal: "Salı",
  car: "Çarşamba",
  per: "Perşembe",
  cum: "Cuma",
  cmt: "Cumartesi",
  paz: "Pazar",
};

export const DEFAULT_OPENING_HOURS: OpeningHours = {
  pzt: { closed: false, open: "09:00", close: "18:00" },
  sal: { closed: false, open: "09:00", close: "18:00" },
  car: { closed: false, open: "09:00", close: "18:00" },
  per: { closed: false, open: "09:00", close: "18:00" },
  cum: { closed: false, open: "09:00", close: "18:00" },
  cmt: { closed: false, open: "09:00", close: "18:00" },
  paz: { closed: true, open: "09:00", close: "18:00" },
};
export type MembershipTier = "basic" | "premium";
export type BusinessStatus = "pending" | "approved" | "rejected" | "suspended";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  display_order: number;
  seo_intro: string | null;
  parent_id: string | null;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  logo_url: string | null;
  cover_image_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  tier: MembershipTier;
  is_founding_member: boolean;
  free_until: string | null;
  paid_until: string | null;
  status: BusinessStatus;
  view_count: number;
  opening_hours: OpeningHours | null;
  created_at: string;
  category?: Category;
}

export interface BusinessPhoto {
  id: string;
  business_id: string;
  url: string;
  display_order: number;
}

export interface Feature {
  id: string;
  name: string;
  slug: string;
  display_order: number;
}

export interface MenuItem {
  id: string;
  business_id: string;
  url: string;
  file_type: string;
  title: string | null;
  display_order: number;
}

export interface BusinessFaq {
  id: string;
  business_id: string;
  question: string;
  answer: string;
  display_order: number;
}

export interface ContactRequest {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  message: string | null;
  status: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  seo_intro: string | null;
  display_order: number;
}