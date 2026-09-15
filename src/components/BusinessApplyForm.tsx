"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { ApplicantType } from "@/lib/types";
import { APPLICANT_TYPE_LABELS } from "@/lib/types";
import {
  formatPhoneInput,
  isValidTurkishPhone,
  normalizeUrl,
  normalizeInstagram,
  generateReferenceCode,
  generateSubmissionId,
  detectDeviceGroup,
  readAttributionParams,
} from "@/lib/submissionUtils";
import { trackFormEvent, formatWhatsappUrl } from "@/lib/analytics";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import {
  Building2,
  User,
  Phone,
  MapPin,
  Link2,
  AtSign,
  Globe,
  Upload,
  X,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Plus,
  Home,
} from "lucide-react";

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

interface FormState {
  applicantType: ApplicantType | "";
  businessName: string;
  applicantName: string;
  contactPhone: string;
  contactIsPublic: boolean;
  businessPhone: string;
  address: string;
  mapsUrl: string;
  instagram: string;
  website: string;
  note: string;
  kvkkAccepted: boolean;
}

const INITIAL_FORM: FormState = {
  applicantType: "",
  businessName: "",
  applicantName: "",
  contactPhone: "",
  contactIsPublic: true,
  businessPhone: "",
  address: "",
  mapsUrl: "",
  instagram: "",
  website: "",
  note: "",
  kvkkAccepted: false,
};

type FieldErrors = Partial<Record<keyof FormState | "location", string>>;

function ErrorText({
  field,
  touched,
  errors,
}: {
  field: keyof FormState | "location";
  touched: Partial<Record<keyof FormState | "location", boolean>>;
  errors: FieldErrors;
}) {
  if (!touched[field] || !errors[field]) return null;
  return (
    <p role="alert" className="mt-1 text-xs font-medium text-bordo">
      {errors[field]}
    </p>
  );
}

function hasMeaningfulInput(form: FormState): boolean {
  return !!(
    form.businessName.trim() ||
    form.applicantName.trim() ||
    form.contactPhone.trim() ||
    form.address.trim() ||
    form.mapsUrl.trim() ||
    form.instagram.trim()
  );
}

export default function BusinessApplyForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState | "location", boolean>>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [result, setResult] = useState<{ referenceCode: string; photoWarning: string | null } | null>(
    null
  );

  const fieldRefs = useRef<Partial<Record<keyof FormState | "location", HTMLElement | null>>>({});
  const submissionIdRef = useRef<string>(generateSubmissionId());
  const referenceCodeRef = useRef<string>(generateReferenceCode());
  const formOpenedAtRef = useRef<number>(0);
  const startedTrackedRef = useRef(false);
  const submittedRef = useRef(false);
  const lastFocusedFieldRef = useRef<string>("");

  useEffect(() => {
    formOpenedAtRef.current = Date.now();
    trackFormEvent("business_form_view");
  }, []);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (submittedRef.current) return;
      if (!hasMeaningfulInput(form)) return;
      trackFormEvent("business_form_abandon", { abandonField: lastFocusedFieldRef.current || undefined });
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form]);

  function trackStartOnce() {
    if (!startedTrackedRef.current) {
      startedTrackedRef.current = true;
      trackFormEvent("business_form_start", { applicantType: form.applicantType || undefined });
    }
  }

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    trackStartOnce();
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // İletişim numarası "public" işaretliyse işletme telefonuna otomatik aktar.
      if (field === "contactPhone" && prev.contactIsPublic) {
        next.businessPhone = value as string;
      }
      if (field === "contactIsPublic") {
        next.businessPhone = value ? prev.contactPhone : prev.businessPhone;
      }
      return next;
    });
  }

  function markTouched(field: keyof FormState | "location") {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function validate(current: FormState): FieldErrors {
    const next: FieldErrors = {};
    if (!current.applicantType) next.applicantType = "Lütfen bir seçenek belirtin.";
    if (!current.businessName.trim()) next.businessName = "İşletme adını girmeden devam edemezsiniz.";
    if (!current.applicantName.trim()) next.applicantName = "Adınızı girmeden devam edemezsiniz.";
    if (!current.contactPhone.trim()) {
      next.contactPhone = "Size ulaşabileceğimiz bir telefon numarası girin.";
    } else if (!isValidTurkishPhone(current.contactPhone)) {
      next.contactPhone = "Geçerli bir telefon numarası girin.";
    }
    if (!current.contactIsPublic && current.businessPhone.trim() && !isValidTurkishPhone(current.businessPhone)) {
      next.businessPhone = "Geçerli bir telefon numarası girin.";
    }
    const hasLocation =
      current.address.trim() || current.mapsUrl.trim() || current.instagram.trim();
    if (!hasLocation) {
      next.location =
        "İşletmeyi bulabilmemiz için adres, Google Maps bağlantısı veya Instagram hesabından en az birini ekleyin.";
    } else {
      if (current.mapsUrl.trim() && !normalizeUrl(current.mapsUrl)) {
        next.mapsUrl = "Geçerli bir bağlantı girin (https:// ile başlamalı).";
      }
      if (current.instagram.trim() && !normalizeInstagram(current.instagram)) {
        next.instagram = "Geçerli bir Instagram kullanıcı adı veya bağlantısı girin.";
      }
    }
    if (current.website.trim() && !normalizeUrl(current.website)) {
      next.website = "Geçerli bir web sitesi bağlantısı girin (https:// ile başlamalı).";
    }
    if (!current.kvkkAccepted) {
      next.kvkkAccepted = "Devam etmek için bu kutuyu işaretlemelisiniz.";
    }
    return next;
  }

  const FIELD_ORDER: (keyof FormState | "location")[] = [
    "applicantType",
    "businessName",
    "applicantName",
    "contactPhone",
    "businessPhone",
    "location",
    "mapsUrl",
    "instagram",
    "website",
    "kvkkAccepted",
  ];

  function focusFirstError(fieldErrors: FieldErrors) {
    const firstKey = FIELD_ORDER.find((key) => fieldErrors[key]);
    if (firstKey) {
      const el = fieldRefs.current[firstKey];
      const prefersReducedMotion =
        typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      el?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
      el?.focus?.();
    }
  }

  function handlePhotoSelect(files: FileList | null) {
    if (!files || files.length === 0) return;
    setPhotoError(null);
    const incoming = Array.from(files);
    const combined = [...photos];

    for (const file of incoming) {
      if (combined.length >= MAX_PHOTOS) {
        setPhotoError(`En fazla ${MAX_PHOTOS} fotoğraf ekleyebilirsiniz.`);
        break;
      }
      if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
        setPhotoError("Yalnızca JPG, PNG veya WebP dosyaları kabul edilir.");
        continue;
      }
      if (file.size > MAX_PHOTO_SIZE) {
        setPhotoError("Her dosya en fazla 5 MB olabilir.");
        continue;
      }
      combined.push(file);
    }
    setPhotos(combined);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadPhotos(submissionId: string): Promise<{ uploaded: number; failed: number }> {
    let uploaded = 0;
    let failed = 0;
    for (const file of photos) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("submissionId", submissionId);
        const res = await fetch("/api/submissions/upload-photo", { method: "POST", body: formData });
        if (res.ok) {
          uploaded++;
          trackFormEvent("business_photo_upload", { hasPhoto: true });
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }
    return { uploaded, failed };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (honeypot.trim() !== "") return; // bot tuzağı — sessizce yut

    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    setTouched((prev) => ({
      ...prev,
      applicantType: true,
      businessName: true,
      applicantName: true,
      contactPhone: true,
      location: true,
      kvkkAccepted: true,
    }));

    if (Object.keys(fieldErrors).length > 0) {
      focusFirstError(fieldErrors);
      trackFormEvent("business_form_error", { errorCategory: "validation" });
      return;
    }

    setSubmitting(true);
    setGeneralError(null);
    trackFormEvent("business_form_submit", {
      applicantType: form.applicantType || undefined,
      formDurationMs: Date.now() - formOpenedAtRef.current,
    });

    const attribution = readAttributionParams();
    const submissionId = submissionIdRef.current;

    const payload = {
      id: submissionId,
      reference_code: referenceCodeRef.current,
      applicant_type: form.applicantType,
      business_name: form.businessName.trim(),
      applicant_name: form.applicantName.trim(),
      contact_phone: form.contactPhone.trim(),
      contact_is_public: form.contactIsPublic,
      business_phone: (form.contactIsPublic ? form.contactPhone : form.businessPhone).trim() || null,
      address: form.address.trim() || null,
      maps_url: normalizeUrl(form.mapsUrl) ?? null,
      instagram_url: normalizeInstagram(form.instagram) ?? null,
      website_url: normalizeUrl(form.website) ?? null,
      note: form.note.trim() || null,
      kvkk_accepted: form.kvkkAccepted,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      referrer: attribution.referrer,
      device: detectDeviceGroup(),
    };

    const { error: insertError } = await supabase.from("business_submissions").insert(payload);

    // Aynı submissionId ile daha önce bu istek başarıyla ulaşmış ama yanıt
    // ağ hatasıyla kaybolmuşsa (kullanıcı tekrar denedi): unique-violation
    // burada BAŞARI olarak ele alınır — mükerrer başvuru oluşturulmaz.
    const isIdempotentReplay = insertError?.code === "23505";

    if (insertError && !isIdempotentReplay) {
      setSubmitting(false);
      if (insertError.message?.includes("RATE_LIMITED")) {
        setGeneralError("Kısa süre içinde birden fazla başvuru gönderildi. Lütfen birkaç dakika sonra tekrar deneyin.");
        trackFormEvent("business_form_error", { errorCategory: "rate_limited" });
      } else {
        setGeneralError("Başvurunuz gönderilemedi, lütfen tekrar deneyin. Bilgileriniz kayboldu, tekrar yazmanız gerekmez.");
        trackFormEvent("business_form_error", { errorCategory: "network_or_server" });
      }
      return;
    }

    submittedRef.current = true;

    let photoWarning: string | null = null;
    if (photos.length > 0) {
      setUploadingPhotos(true);
      const { uploaded, failed } = await uploadPhotos(submissionId);
      setUploadingPhotos(false);
      if (failed > 0) {
        photoWarning =
          uploaded > 0
            ? `${uploaded} fotoğraf yüklendi, ${failed} fotoğraf yüklenemedi. Başvurunuz kaydedildi, dilerseniz fotoğrafları WhatsApp'tan iletebilirsiniz.`
            : "Fotoğraflar yüklenemedi, ancak başvurunuz kaydedildi. Dilerseniz WhatsApp'tan iletebilirsiniz.";
      }
    }

    setSubmitting(false);
    setResult({ referenceCode: referenceCodeRef.current, photoWarning });
    trackFormEvent("business_form_success", {
      applicantType: form.applicantType || undefined,
      hasPhoto: photos.length > 0,
      formDurationMs: Date.now() - formOpenedAtRef.current,
    });
  }

  if (result) {
    const whatsappHref = WHATSAPP_NUMBER
      ? formatWhatsappUrl(
          WHATSAPP_NUMBER,
          `Merhaba, ${result.referenceCode} numaralı işletme başvurum için fotoğraf göndermek istiyorum.`
        )
      : null;

    return (
      <div className="flex flex-col items-center py-6 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </span>
        <h2 className="font-display text-2xl font-bold text-navy">Başvurunuz alındı</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/60">
          Ekibimiz işletme bilgilerini kontrol ederek profilinizi hazırlayacak. Eksik bilgi
          bulunursa verdiğiniz iletişim numarası üzerinden sizinle iletişime geçeceğiz.
        </p>

        <div className="card-shadow mt-5 flex flex-col items-center gap-1 rounded-xl bg-offwhite px-6 py-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">
            Başvuru referansınız
          </span>
          <span className="font-mono text-xl font-bold text-navy">{result.referenceCode}</span>
          <span className="text-xs text-ink/50">Durum: Yeni · En kısa sürede incelenecektir</span>
        </div>

        {result.photoWarning && (
          <p className="mt-4 max-w-sm rounded-lg bg-gold/10 px-4 py-3 text-xs leading-relaxed text-navy/80">
            {result.photoWarning}
          </p>
        )}

        <div className="mt-6 flex w-full max-w-sm flex-col gap-2.5">
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackFormEvent("business_whatsapp_continue")}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp&apos;tan Fotoğraf Gönder
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              submissionIdRef.current = generateSubmissionId();
              referenceCodeRef.current = generateReferenceCode();
              submittedRef.current = false;
              startedTrackedRef.current = false;
              setForm(INITIAL_FORM);
              setPhotos([]);
              setTouched({});
              setErrors({});
              setResult(null);
            }}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 text-sm font-bold text-navy hover:bg-offwhite"
          >
            <Plus className="h-4 w-4" /> Başka İşletme Öner
          </button>
          <Link
            href="/"
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-ink/60 hover:text-navy"
          >
            <Home className="h-4 w-4" /> Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full min-h-11 rounded-xl border border-line px-4 py-3 text-base outline-none transition-colors focus:border-bordo";
  const errorInputClass = "border-bordo focus:border-bordo";
  const labelClass = "mb-1.5 block text-sm font-semibold text-navy";

  function errClass(field: keyof FormState | "location") {
    return touched[field] && errors[field] ? errorInputClass : "";
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 motion-reduce:transition-none">
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <p className="rounded-xl bg-bordo/5 px-4 py-3 text-sm font-semibold text-bordo">
        Sen işletmeni gönder, profilini biz hazırlayalım.
      </p>

      {/* Başvuru türü */}
      <fieldset
        ref={(el) => {
          fieldRefs.current.applicantType = el;
        }}
      >
        <legend className={labelClass}>Bu işletmeyi hangi amaçla gönderiyorsunuz? *</legend>
        <div className="flex flex-col gap-2">
          {(Object.keys(APPLICANT_TYPE_LABELS) as ApplicantType[]).map((type) => (
            <label
              key={type}
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                form.applicantType === type
                  ? "border-bordo bg-bordo/5 text-bordo"
                  : "border-line text-navy hover:border-bordo/40"
              }`}
            >
              <input
                type="radio"
                name="applicantType"
                value={type}
                checked={form.applicantType === type}
                onChange={() => update("applicantType", type)}
                onBlur={() => markTouched("applicantType")}
                className="h-4 w-4 accent-bordo"
              />
              {APPLICANT_TYPE_LABELS[type]}
            </label>
          ))}
        </div>
        <ErrorText field="applicantType" touched={touched} errors={errors} />
      </fieldset>

      <div>
        <label className={labelClass} htmlFor="businessName">
          İşletme adı *
        </label>
        <div className="relative">
          <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
          <input
            id="businessName"
            ref={(el) => {
              fieldRefs.current.businessName = el;
            }}
            value={form.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            onFocus={() => (lastFocusedFieldRef.current = "businessName")}
            onBlur={() => markTouched("businessName")}
            className={`${inputClass} pl-10 ${errClass("businessName")}`}
            placeholder="Örn. Cansu Kuaför"
            aria-invalid={touched.businessName && !!errors.businessName}
          />
        </div>
        <ErrorText field="businessName" touched={touched} errors={errors} />
      </div>

      <div>
        <label className={labelClass} htmlFor="applicantName">
          Başvuran kişinin adı *
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
          <input
            id="applicantName"
            ref={(el) => {
              fieldRefs.current.applicantName = el;
            }}
            value={form.applicantName}
            onChange={(e) => update("applicantName", e.target.value)}
            onFocus={() => (lastFocusedFieldRef.current = "applicantName")}
            onBlur={() => markTouched("applicantName")}
            className={`${inputClass} pl-10 ${errClass("applicantName")}`}
            placeholder="Adınız Soyadınız"
            aria-invalid={touched.applicantName && !!errors.applicantName}
          />
        </div>
        <ErrorText field="applicantName" touched={touched} errors={errors} />
      </div>

      <div>
        <label className={labelClass} htmlFor="contactPhone">
          Size ulaşabileceğimiz telefon / WhatsApp *
        </label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
          <input
            id="contactPhone"
            ref={(el) => {
              fieldRefs.current.contactPhone = el;
            }}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.contactPhone}
            onChange={(e) => update("contactPhone", formatPhoneInput(e.target.value))}
            onFocus={() => (lastFocusedFieldRef.current = "contactPhone")}
            onBlur={() => markTouched("contactPhone")}
            className={`${inputClass} pl-10 ${errClass("contactPhone")}`}
            placeholder="0555 123 45 67"
            aria-invalid={touched.contactPhone && !!errors.contactPhone}
          />
        </div>
        <ErrorText field="contactPhone" touched={touched} errors={errors} />

        <label className="mt-2.5 flex cursor-pointer items-center gap-2.5 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={form.contactIsPublic}
            onChange={(e) => update("contactIsPublic", e.target.checked)}
            className="h-4 w-4 shrink-0 accent-bordo"
          />
          Bu numara aynı zamanda işletmenin müşterilere açık numarasıdır
        </label>
      </div>

      {!form.contactIsPublic && (
        <div>
          <label className={labelClass} htmlFor="businessPhone">
            İşletmenin herkese açık telefon numarası{" "}
            <span className="font-normal text-ink/40">(isteğe bağlı)</span>
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
            <input
              id="businessPhone"
              ref={(el) => {
                fieldRefs.current.businessPhone = el;
              }}
              type="tel"
              inputMode="tel"
              value={form.businessPhone}
              onChange={(e) => update("businessPhone", formatPhoneInput(e.target.value))}
              onBlur={() => markTouched("businessPhone")}
              className={`${inputClass} pl-10 ${errClass("businessPhone")}`}
              placeholder="0312 123 45 67"
            />
          </div>
          <ErrorText field="businessPhone" touched={touched} errors={errors} />
        </div>
      )}

      {/* Konum kaynağı: adres / maps / instagram — en az biri zorunlu */}
      <div
        ref={(el) => {
          fieldRefs.current.location = el;
        }}
        className="flex flex-col gap-3 rounded-xl border border-line p-4"
      >
        <p className="text-sm font-semibold text-navy">
          Adres, Google Maps bağlantısı veya Instagram — en az biri *
        </p>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink/60" htmlFor="address">
            <MapPin className="h-3.5 w-3.5" /> Açık adres
          </label>
          <input
            id="address"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            onFocus={() => (lastFocusedFieldRef.current = "address")}
            onBlur={() => markTouched("location")}
            className={inputClass}
            placeholder="Mahalle, cadde/sokak, no"
          />
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink/60" htmlFor="mapsUrl">
            <Link2 className="h-3.5 w-3.5" /> Google Maps bağlantısı
          </label>
          <input
            id="mapsUrl"
            ref={(el) => {
              fieldRefs.current.mapsUrl = el;
            }}
            value={form.mapsUrl}
            onChange={(e) => update("mapsUrl", e.target.value)}
            onFocus={() => (lastFocusedFieldRef.current = "mapsUrl")}
            onBlur={() => {
              markTouched("location");
              markTouched("mapsUrl");
            }}
            inputMode="url"
            className={`${inputClass} ${errClass("mapsUrl")}`}
            placeholder="https://maps.app.goo.gl/..."
          />
          <ErrorText field="mapsUrl" touched={touched} errors={errors} />
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink/60" htmlFor="instagram">
            <AtSign className="h-3.5 w-3.5" /> Instagram hesabı
          </label>
          <input
            id="instagram"
            ref={(el) => {
              fieldRefs.current.instagram = el;
            }}
            value={form.instagram}
            onChange={(e) => update("instagram", e.target.value)}
            onFocus={() => (lastFocusedFieldRef.current = "instagram")}
            onBlur={() => {
              markTouched("location");
              markTouched("instagram");
            }}
            className={`${inputClass} ${errClass("instagram")}`}
            placeholder="@kullaniciadi"
          />
          <ErrorText field="instagram" touched={touched} errors={errors} />
        </div>

        <ErrorText field="location" touched={touched} errors={errors} />
      </div>

      <div>
        <label className={labelClass} htmlFor="website">
          Web sitesi <span className="font-normal text-ink/40">(isteğe bağlı)</span>
        </label>
        <div className="relative">
          <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
          <input
            id="website"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            onBlur={() => markTouched("website")}
            inputMode="url"
            className={`${inputClass} pl-10 ${errClass("website")}`}
            placeholder="https://www.example.com"
          />
        </div>
        <ErrorText field="website" touched={touched} errors={errors} />
      </div>

      {/* Fotoğraflar */}
      <div>
        <label className={labelClass}>
          Logo / işletme fotoğrafları <span className="font-normal text-ink/40">(isteğe bağlı)</span>
        </label>
        {photos.length > 0 && (
          <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {photos.map((file, i) => {
              const url = URL.createObjectURL(file);
              return (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-offwhite">
                  <Image src={url} alt="" fill unoptimized className="object-cover" onLoad={() => URL.revokeObjectURL(url)} />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label="Fotoğrafı kaldır"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy-dark/70 text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {photos.length < MAX_PHOTOS && (
          <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line px-3 py-3 text-sm font-semibold text-ink/60 hover:border-bordo hover:text-bordo">
            <Upload className="h-4 w-4" /> Fotoğraf Ekle
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => {
                handlePhotoSelect(e.target.files);
                e.target.value = "";
              }}
              className="hidden"
            />
          </label>
        )}
        <p className="mt-1 text-xs text-ink/40">JPG, PNG veya WebP · dosya başına en fazla 5 MB · en fazla {MAX_PHOTOS} fotoğraf</p>
        {photoError && <p className="mt-1 text-xs font-medium text-bordo">{photoError}</p>}
        {uploadingPhotos && <p className="mt-1 text-xs font-semibold text-navy">Fotoğraflar yükleniyor…</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="note">
          Eklemek istediğiniz bir not var mı? <span className="font-normal text-ink/40">(isteğe bağlı)</span>
        </label>
        <textarea
          id="note"
          value={form.note}
          onChange={(e) => update("note", e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-bordo"
        />
      </div>

      <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 text-xs leading-relaxed text-navy/80">
        Ücretsiz Temel kaydın ardından dilerseniz gelişmiş profil, galeri, WhatsApp, analitik ve
        öne çıkarma özellikleri sunan RehberGölbaşı Plus&apos;a geçebilirsiniz. Plus ilk 30 gün
        ücretsiz, sonrasında aylık 360 TL&apos;dir. Ödeme yapılmazsa profil silinmez; ücretsiz
        Temel pakette kalır.
      </div>

      <label
        ref={(el) => {
          fieldRefs.current.kvkkAccepted = el as unknown as HTMLElement;
        }}
        className="flex cursor-pointer items-start gap-2.5 text-sm text-ink/70"
      >
        <input
          type="checkbox"
          checked={form.kvkkAccepted}
          onChange={(e) => update("kvkkAccepted", e.target.checked)}
          onBlur={() => markTouched("kvkkAccepted")}
          className="mt-0.5 h-4 w-4 shrink-0 accent-bordo"
          aria-invalid={touched.kvkkAccepted && !!errors.kvkkAccepted}
        />
        <span>
          <a href="/kvkk" target="_blank" className="font-semibold text-bordo hover:underline">
            KVKK Aydınlatma Metni
          </a>
          &apos;ni okudum, verdiğim bilgilerin doğru olduğunu kabul ediyorum. *
        </span>
      </label>
      <ErrorText field="kvkkAccepted" touched={touched} errors={errors} />

      {generalError && (
        <p role="alert" className="rounded-lg bg-bordo/5 px-4 py-3 text-sm font-medium text-bordo">
          {generalError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-bordo px-6 py-3.5 text-base font-bold text-white transition hover:bg-bordo-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ShieldCheck className="h-4 w-4" />
        {uploadingPhotos ? "Fotoğraflar yükleniyor…" : submitting ? "Gönderiliyor…" : "Başvuruyu Gönder"}
      </button>
    </form>
  );
}
