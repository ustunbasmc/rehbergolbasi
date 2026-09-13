"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type {
  BusinessSubmission,
  BusinessSubmissionStatusHistoryEntry,
  SubmissionStatus,
} from "@/lib/types";
import { APPLICANT_TYPE_LABELS, SUBMISSION_STATUS_LABELS } from "@/lib/types";
import {
  X,
  Phone,
  MessageCircle,
  MapPin,
  Link2,
  AtSign,
  Globe,
  AlertTriangle,
  ArrowRightLeft,
  Clock,
} from "lucide-react";
import NewBusinessForm, { type NewBusinessPrefill } from "@/components/admin/NewBusinessForm";
import { formatTelHref, formatWhatsappUrl } from "@/lib/analytics";

interface PossibleMatch {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
}

const SUBMISSION_PHOTOS_BUCKET = "business-submission-photos";

export default function SubmissionDetailModal({
  submission,
  onClose,
  onUpdated,
}: {
  submission: BusinessSubmission;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [status, setStatus] = useState<SubmissionStatus>(submission.status);
  const [adminNote, setAdminNote] = useState(submission.admin_note ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [photoUrls, setPhotoUrls] = useState<{ path: string; signedUrl: string }[]>([]);
  const [history, setHistory] = useState<BusinessSubmissionStatusHistoryEntry[]>([]);
  const [matches, setMatches] = useState<PossibleMatch[]>([]);

  const [convertStep, setConvertStep] = useState<"idle" | "confirm" | "converting">("idle");
  const [promoting, setPromoting] = useState(false);
  const [promotedUrls, setPromotedUrls] = useState<string[]>([]);
  const [convertError, setConvertError] = useState<string | null>(null);

  const alreadyConverted = !!submission.business_id;

  const loadExtras = useCallback(async () => {
    const { data: photoRows } = await supabase
      .from("business_submission_photos")
      .select("storage_path")
      .eq("submission_id", submission.id)
      .order("display_order", { ascending: true });

    const urls: { path: string; signedUrl: string }[] = [];
    for (const row of photoRows ?? []) {
      const { data } = await supabase.storage
        .from(SUBMISSION_PHOTOS_BUCKET)
        .createSignedUrl(row.storage_path, 300);
      if (data?.signedUrl) urls.push({ path: row.storage_path, signedUrl: data.signedUrl });
    }
    setPhotoUrls(urls);

    const { data: historyRows } = await supabase
      .from("business_submission_status_history")
      .select("*")
      .eq("submission_id", submission.id)
      .order("changed_at", { ascending: false });
    setHistory(historyRows ?? []);

    const phoneDigits = (submission.contact_phone_normalized ?? "").slice(-10);
    const { data: matchRows } = await supabase
      .from("businesses")
      .select("id, name, slug, phone, whatsapp")
      .or(
        `name.ilike.%${submission.business_name.trim()}%${
          phoneDigits ? `,phone.ilike.%${phoneDigits},whatsapp.ilike.%${phoneDigits}` : ""
        }`
      )
      .limit(5);
    setMatches((matchRows ?? []).map((m) => ({ id: m.id, name: m.name, slug: m.slug, phone: m.phone })));
  }, [submission.id, submission.business_name, submission.contact_phone_normalized]);

  useEffect(() => {
    loadExtras();
  }, [loadExtras]);

  async function handleSaveStatus() {
    setSaving(true);
    setSaveError(null);
    const { data: authData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("business_submissions")
      .update({
        status,
        admin_note: adminNote.trim() || null,
        reviewed_by: authData.user?.email ?? null,
      })
      .eq("id", submission.id);
    setSaving(false);
    if (error) {
      setSaveError("Kaydedilemedi: " + error.message);
      return;
    }
    onUpdated();
  }

  async function handlePromoteAndConvert() {
    setPromoting(true);
    setConvertError(null);
    const urls: string[] = [];
    for (const photo of photoUrls) {
      try {
        const { data: fileBlob, error: downloadError } = await supabase.storage
          .from(SUBMISSION_PHOTOS_BUCKET)
          .download(photo.path);
        if (downloadError || !fileBlob) continue;
        const newPath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
        const { error: uploadError } = await supabase.storage
          .from("business-photos")
          .upload(newPath, fileBlob, { contentType: "image/webp" });
        if (uploadError) continue;
        const { data: pub } = supabase.storage.from("business-photos").getPublicUrl(newPath);
        urls.push(pub.publicUrl);
      } catch {
        // tek bir fotoğrafın aktarımı başarısız olsa da diğerleriyle devam et
      }
    }
    setPromotedUrls(urls);
    setPromoting(false);
    setConvertStep("converting");
  }

  async function handleBusinessCreated(business: { id: string; slug: string; name: string }) {
    const { data: authData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("business_submissions")
      .update({
        status: "published",
        business_id: business.id,
        converted_at: new Date().toISOString(),
        reviewed_by: authData.user?.email ?? null,
      })
      .eq("id", submission.id)
      .is("business_id", null); // aynı başvurudan ikinci kez dönüşümü engelle

    if (error) {
      setConvertError(
        `İşletme "${business.name}" oluşturuldu ancak başvuru kaydı güncellenemedi. Lütfen bu başvuruyu (${submission.reference_code}) elle "Yayınlandı" olarak işaretleyin.`
      );
      return;
    }
    onUpdated();
    onClose();
  }

  const contactWaHref = formatWhatsappUrl(submission.contact_phone.replace(/\s+/g, ""));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/50 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-navy">{submission.business_name}</h2>
            <p className="font-mono text-xs text-ink/50">{submission.reference_code}</p>
          </div>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        {convertStep === "converting" ? (
          <div>
            <p className="mb-4 rounded-lg bg-gold/10 px-4 py-3 text-xs text-navy/80">
              Başvuru bilgileriyle önceden doldurulmuş formu tamamlayın. Kategori, açıklama, SEO ve
              diğer profil ayrıntılarını burada ekleyin.
            </p>
            {convertError && (
              <p className="mb-4 rounded-lg bg-bordo/5 px-4 py-3 text-sm text-bordo">{convertError}</p>
            )}
            <NewBusinessForm
              prefill={
                {
                  name: submission.business_name,
                  phone: submission.business_phone ?? undefined,
                  whatsapp: submission.contact_is_public ? submission.contact_phone : undefined,
                  address: submission.address ?? undefined,
                  instagram_url: submission.instagram_url ?? undefined,
                  website_url: submission.website_url ?? undefined,
                } satisfies NewBusinessPrefill
              }
              initialGalleryUrls={promotedUrls}
              onCreated={handleBusinessCreated}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {submission.possible_duplicate && (
              <div className="flex items-start gap-2 rounded-lg bg-gold/10 px-4 py-3 text-xs text-navy/80">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-dark" />
                Bu numarayla eşleşen başka bir başvuru veya işletme kaydı olabilir. Dönüştürmeden
                önce olası eşleşmeleri kontrol edin.
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Info label="Başvuru türü" value={APPLICANT_TYPE_LABELS[submission.applicant_type]} />
              <Info label="Başvuran" value={submission.applicant_name} />
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/40">İletişim</p>
                <div className="flex flex-wrap gap-2">
                  <a href={formatTelHref(submission.contact_phone)} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-navy hover:border-bordo">
                    <Phone className="h-3.5 w-3.5" /> {submission.contact_phone}
                  </a>
                  <a href={contactWaHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-navy hover:border-bordo">
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                </div>
                <p className="mt-1 text-xs text-ink/40">
                  {submission.contact_is_public ? "Bu numara işletmenin herkese açık numarası olarak işaretlendi." : "Bu numara yalnızca başvuran kişiye ait, herkese açık değil."}
                </p>
              </div>
              {submission.business_phone && !submission.contact_is_public && (
                <Info label="İşletme telefonu" value={submission.business_phone} />
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {submission.address && (
                <span className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-ink/70">
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> {submission.address}
                </span>
              )}
              {submission.maps_url && (
                <a href={submission.maps_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy hover:border-bordo">
                  <Link2 className="h-3.5 w-3.5" /> Google Maps
                </a>
              )}
              {submission.instagram_url && (
                <a href={submission.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy hover:border-bordo">
                  <AtSign className="h-3.5 w-3.5" /> Instagram
                </a>
              )}
              {submission.website_url && (
                <a href={submission.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy hover:border-bordo">
                  <Globe className="h-3.5 w-3.5" /> Web sitesi
                </a>
              )}
            </div>

            {submission.note && (
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/40">Not</p>
                <p className="rounded-lg bg-offwhite p-3 text-sm text-ink/70">{submission.note}</p>
              </div>
            )}

            {photoUrls.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/40">
                  Fotoğraflar ({photoUrls.length})
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {photoUrls.map((p) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={p.path}
                      src={p.signedUrl}
                      alt=""
                      className="aspect-square w-full rounded-lg border border-line object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            {matches.length > 0 && (
              <div className="rounded-lg border border-gold/30 bg-gold/5 p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gold-dark">
                  Olası mevcut eşleşmeler
                </p>
                <div className="flex flex-col gap-1.5">
                  {matches.map((m) => (
                    <a
                      key={m.id}
                      href={`/isletme/${m.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-navy hover:text-bordo hover:underline"
                    >
                      {m.name} {m.phone ? `— ${m.phone}` : ""}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-line p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/40">Durum</p>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubmissionStatus)}
                className="mb-2 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              >
                {(Object.keys(SUBMISSION_STATUS_LABELS) as SubmissionStatus[]).map((s) => (
                  <option key={s} value={s}>{SUBMISSION_STATUS_LABELS[s]}</option>
                ))}
              </select>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={2}
                placeholder="Admin notu (yalnızca ekip görür)"
                className="mb-2 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              />
              {saveError && <p className="mb-2 text-xs text-bordo">{saveError}</p>}
              <button
                onClick={handleSaveStatus}
                disabled={saving}
                className="rounded-lg bg-navy px-4 py-2 text-sm font-bold text-white hover:bg-navy-dark disabled:opacity-60"
              >
                {saving ? "Kaydediliyor..." : "Durumu Kaydet"}
              </button>
            </div>

            {history.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink/40">
                  <Clock className="h-3.5 w-3.5" /> Geçmiş
                </p>
                <div className="flex flex-col gap-1 text-xs text-ink/50">
                  {history.map((h) => (
                    <p key={h.id}>
                      {new Date(h.changed_at).toLocaleString("tr-TR")} —{" "}
                      {SUBMISSION_STATUS_LABELS[h.old_status ?? "new"]} →{" "}
                      {SUBMISSION_STATUS_LABELS[h.new_status]}
                      {h.changed_by ? ` (${h.changed_by})` : ""}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {alreadyConverted ? (
              <p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                Bu başvuru zaten bir işletmeye dönüştürüldü.
              </p>
            ) : convertStep === "confirm" ? (
              <div className="rounded-lg border border-bordo/20 bg-bordo/5 p-4">
                <p className="mb-3 text-sm text-navy">
                  {matches.length > 0
                    ? "Yukarıdaki olası eşleşmeleri kontrol ettiniz mi? Yine de yeni bir işletme profili oluşturmak istiyor musunuz?"
                    : "Bu başvuruyu yeni bir işletme profiline dönüştürmek istediğinize emin misiniz?"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConvertStep("idle")}
                    className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink/60 hover:bg-white"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handlePromoteAndConvert}
                    disabled={promoting}
                    className="flex items-center gap-1.5 rounded-lg bg-bordo px-4 py-2 text-sm font-bold text-white hover:bg-bordo-dark disabled:opacity-60"
                  >
                    {promoting ? "Fotoğraflar aktarılıyor..." : "Devam Et"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConvertStep("confirm")}
                className="flex items-center justify-center gap-2 rounded-xl bg-bordo px-5 py-3 text-sm font-bold text-white hover:bg-bordo-dark"
              >
                <ArrowRightLeft className="h-4 w-4" /> İşletme Profiline Dönüştür
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-0.5 text-xs font-bold uppercase tracking-wide text-ink/40">{label}</p>
      <p className="text-sm font-semibold text-navy">{value}</p>
    </div>
  );
}
