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
export type VerificationStatus = "unverified" | "info_checked" | "owner_verified";

export const VERIFICATION_LABELS: Record<
  VerificationStatus,
  { label: string; shortLabel: string; description: string }
> = {
  unverified: {
    label: "Doğrulanmadı",
    shortLabel: "Doğrulanmadı",
    description: "Bu işletmenin bilgileri henüz RehberGölbaşı tarafından kontrol edilmedi.",
  },
  info_checked: {
    label: "Bilgileri Kontrol Edildi",
    shortLabel: "Kontrol Edildi",
    description: "İletişim ve adres bilgileri RehberGölbaşı tarafından kontrol edildi.",
  },
  owner_verified: {
    label: "İşletme Sahibi Tarafından Doğrulandı",
    shortLabel: "Sahibi Onayladı",
    description: "Bu profil işletme sahibi veya yetkilisi tarafından doğrulandı.",
  },
};

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
  website: string | null;
  tier: MembershipTier;
  is_founding_member: boolean;
  is_featured: boolean;
  free_until: string | null;
  paid_until: string | null;
  status: BusinessStatus;
  view_count: number;
  opening_hours: OpeningHours | null;
  created_at: string;
  category?: Category;
  is_active: boolean;
  short_description: string | null;
  verification_status: VerificationStatus;
  verification_updated_at: string | null;
  verification_updated_by: string | null;
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

export type ApplicantType = "owner" | "employee" | "recommendation";

export const APPLICANT_TYPE_LABELS: Record<ApplicantType, string> = {
  owner: "İşletmemi eklemek istiyorum",
  employee: "Çalıştığım işletmeyi ekliyorum",
  recommendation: "Bir işletme öneriyorum",
};

export type SubmissionStatus =
  | "new"
  | "information_requested"
  | "preparing"
  | "pending_approval"
  | "published"
  | "rejected"
  | "duplicate";

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: "Yeni",
  information_requested: "Bilgi istendi",
  preparing: "Hazırlanıyor",
  pending_approval: "Onay bekliyor",
  published: "Yayınlandı",
  rejected: "Reddedildi",
  duplicate: "Mükerrer",
};

export interface BusinessSubmission {
  id: string;
  reference_code: string;
  applicant_type: ApplicantType;
  business_name: string;
  applicant_name: string;
  contact_phone: string;
  contact_phone_normalized: string | null;
  contact_is_public: boolean;
  business_phone: string | null;
  address: string | null;
  maps_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  note: string | null;
  kvkk_accepted: boolean;
  status: SubmissionStatus;
  admin_note: string | null;
  possible_duplicate: boolean;
  business_id: string | null;
  converted_at: string | null;
  reviewed_by: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  device: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessSubmissionPhoto {
  id: string;
  submission_id: string;
  storage_path: string;
  display_order: number;
  created_at: string;
}

export interface BusinessSubmissionStatusHistoryEntry {
  id: string;
  submission_id: string;
  old_status: SubmissionStatus | null;
  new_status: SubmissionStatus;
  changed_by: string | null;
  note: string | null;
  changed_at: string;
}