"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import {
  X, Save, Eye, Star, Zap, Megaphone, Loader2, Check, AlertTriangle, Search, Plus,
} from "lucide-react";
import GundemPreviewModal from "@/components/admin/GundemPreviewModal";
import {
  slugifyTurkish,
  buildGundemSearchText,
  isSafeExternalUrl,
  estimateReadingTimeMinutes,
} from "@/lib/gundem";
import { renderGundemMarkdown } from "@/lib/gundem-content";
import type {
  GundemPost, GundemCategory, GundemSourceType, GundemPostStatus, Tag, Business,
} from "@/lib/types";
import { GUNDEM_SOURCE_TYPE_LABELS } from "@/lib/types";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type RelatedBusiness = Pick<Business, "id" | "name">;

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

async function uploadCoverImage(file: File): Promise<{ url: string; width?: number; height?: number } | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("prefix", "gundem-");
  const res = await fetch("/api/upload-photo", { method: "POST", body: formData });
  if (!res.ok) return null;
  const data = await res.json();
  return data.url ? { url: data.url, width: data.width, height: data.height } : null;
}

interface EditorProps {
  post?: GundemPost;
  initialTagIds?: string[];
  initialBusinessIds?: RelatedBusiness[];
  onClose: () => void;
  onSaved: () => void;
}

export default function GundemEditor({ post, initialTagIds, initialBusinessIds, onClose, onSaved }: EditorProps) {
  const isEdit = !!post;

  const [categories, setCategories] = useState<GundemCategory[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [summary, setSummary] = useState(post?.summary ?? "");
  const [contentMarkdown, setContentMarkdown] = useState(post?.content_markdown ?? "");

  const [coverUrl, setCoverUrl] = useState<string | null>(post?.cover_image_url ?? null);
  const [coverAlt, setCoverAlt] = useState(post?.cover_image_alt ?? "");
  const [coverCaption, setCoverCaption] = useState(post?.cover_image_caption ?? "");
  const [imageSource, setImageSource] = useState(post?.image_source ?? "");
  const [coverWarning, setCoverWarning] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [categoryId, setCategoryId] = useState<string>(post?.category_id ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTagIds ?? []);
  const [neighborhoods, setNeighborhoods] = useState<string[]>(post?.neighborhoods ?? []);
  const [neighborhoodInput, setNeighborhoodInput] = useState("");
  const [relatedBusinesses, setRelatedBusinesses] = useState<RelatedBusiness[]>(initialBusinessIds ?? []);
  const [businessQuery, setBusinessQuery] = useState("");
  const [businessResults, setBusinessResults] = useState<RelatedBusiness[]>([]);

  const [sourceType, setSourceType] = useState<GundemSourceType>(post?.source_type ?? "original");
  const [sourceName, setSourceName] = useState(post?.source_name ?? "");
  const [sourceUrl, setSourceUrl] = useState(post?.source_url ?? "");
  const [author, setAuthor] = useState(post?.author ?? "RehberGölbaşı Haber Merkezi");

  const [status, setStatus] = useState<GundemPostStatus>(post?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState(toDatetimeLocal(post?.published_at ?? null));

  const [isFeatured, setIsFeatured] = useState(post?.is_featured ?? false);
  const [isBreaking, setIsBreaking] = useState(post?.is_breaking ?? false);
  const [breakingUntil, setBreakingUntil] = useState(toDatetimeLocal(post?.breaking_until ?? null));

  const [isSponsored, setIsSponsored] = useState(post?.is_sponsored ?? false);
  const [sponsorName, setSponsorName] = useState(post?.sponsor_name ?? "");
  const [sponsorDescription, setSponsorDescription] = useState(post?.sponsor_description ?? "");
  const [sponsorUrl, setSponsorUrl] = useState(post?.sponsor_url ?? "");

  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? "");
  const [canonicalOverride, setCanonicalOverride] = useState(post?.canonical_override ?? "");

  const [markCorrection, setMarkCorrection] = useState(false);
  const [correctionNote, setCorrectionNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showPreview, setShowPreview] = useState(false);

  const postIdRef = useRef<string | null>(post?.id ?? null);
  const savedStatusRef = useRef<GundemPostStatus>(post?.status ?? "draft");
  const previousSnapshotRef = useRef<GundemPost | undefined>(post);
  const dirtyRef = useRef(false);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: tags }] = await Promise.all([
        supabase.from("gundem_categories").select("*").eq("is_active", true).order("display_order"),
        supabase.from("tags").select("*").order("display_order"),
      ]);
      setCategories(cats ?? []);
      setAllTags(tags ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!businessQuery.trim()) { setBusinessResults([]); return; }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("businesses")
        .select("id, name")
        .eq("status", "approved")
        .ilike("name", `%${businessQuery.trim()}%`)
        .limit(8);
      setBusinessResults((data ?? []).filter((b) => !relatedBusinesses.some((rb) => rb.id === b.id)));
    }, 250);
    return () => clearTimeout(timeout);
  }, [businessQuery, relatedBusinesses]);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugTouched) setSlug(slugifyTurkish(val));
  }

  function handleSlugChange(val: string) {
    setSlugTouched(true);
    setSlug(slugifyTurkish(val));
  }

  async function handleCoverUpload(files: FileList | null) {
    if (!files?.[0]) return;
    setUploading(true);
    setCoverWarning(null);
    const result = await uploadCoverImage(files[0]);
    if (result) {
      setCoverUrl(result.url);
      if (result.width && result.width < 1200) {
        setCoverWarning(
          `Yüklenen görsel ${result.width}px genişliğinde — sosyal paylaşımlarda net görünmesi için en az 1200px genişlik önerilir.`
        );
      }
    } else {
      setError("Görsel yüklenemedi, lütfen tekrar deneyin.");
    }
    setUploading(false);
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]));
  }

  function addNeighborhood() {
    const val = neighborhoodInput.trim();
    if (!val) return;
    if (!neighborhoods.some((n) => n.toLocaleLowerCase("tr") === val.toLocaleLowerCase("tr"))) {
      setNeighborhoods((prev) => [...prev, val]);
    }
    setNeighborhoodInput("");
  }

  function removeNeighborhood(val: string) {
    setNeighborhoods((prev) => prev.filter((n) => n !== val));
  }

  function addBusiness(b: RelatedBusiness) {
    setRelatedBusinesses((prev) => [...prev, b]);
    setBusinessQuery("");
    setBusinessResults([]);
  }

  function removeBusiness(id: string) {
    setRelatedBusinesses((prev) => prev.filter((b) => b.id !== id));
  }

  const selectedTagNames = useMemo(
    () => allTags.filter((t) => selectedTagIds.includes(t.id)).map((t) => t.name),
    [allTags, selectedTagIds]
  );

  const readingTime = useMemo(() => estimateReadingTimeMinutes(contentMarkdown), [contentMarkdown]);

  function buildValidationError(targetStatus: GundemPostStatus): string | null {
    if (!title.trim()) return "Başlık zorunlu.";
    if (!slug.trim()) return "Slug zorunlu.";
    if (!summary.trim()) return "Kısa özet zorunlu.";
    if (!contentMarkdown.trim()) return "Haber metni zorunlu.";
    if (targetStatus === "scheduled" || targetStatus === "published") {
      if (!categoryId) return "Yayınlamak için kategori seçmelisin.";
      if (!coverUrl || !coverAlt.trim()) return "Yayınlamak için kapak görseli ve alt metni zorunlu.";
      if (!publishedAt) return "Yayın tarihi/saati zorunlu.";
    }
    if (targetStatus === "scheduled" && publishedAt && new Date(publishedAt).getTime() <= Date.now()) {
      return "Zamanlanmış yayın tarihi gelecekte olmalı. Şimdi yayınlamak için \"Yayınla\" seçeneğini kullan.";
    }
    if (sourceType !== "original") {
      if (!sourceName.trim() || !sourceUrl.trim()) {
        return "Özgün olmayan içerikte kaynak adı ve bağlantısı zorunlu.";
      }
    }
    if (sourceUrl.trim() && !isSafeExternalUrl(sourceUrl.trim())) {
      return "Kaynak bağlantısı yalnızca güvenli http(s) protokolüyle olabilir.";
    }
    if (canonicalOverride.trim() && !isSafeExternalUrl(canonicalOverride.trim())) {
      return "Canonical override yalnızca güvenli http(s) protokolüyle olabilir.";
    }
    if (isSponsored && !sponsorName.trim()) {
      return "Sponsorlu içerikte sponsor adı zorunlu.";
    }
    if (sponsorUrl.trim() && !isSafeExternalUrl(sponsorUrl.trim())) {
      return "Sponsor bağlantısı yalnızca güvenli http(s) protokolüyle olabilir.";
    }
    if (markCorrection && !correctionNote.trim()) {
      return "Önemli düzeltme işaretlendiyse düzeltme notu zorunlu.";
    }
    return null;
  }

  const buildPayload = useCallback(
    (targetStatus: GundemPostStatus, userEmail: string | null) => {
      const contentHtml = renderGundemMarkdown(contentMarkdown);
      const searchText = buildGundemSearchText({
        title,
        summary,
        contentMarkdown,
        sourceName,
        neighborhoods,
        tagNames: selectedTagNames,
      });
      const payload: Record<string, unknown> = {
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim(),
        content_markdown: contentMarkdown,
        content_html: contentHtml,
        cover_image_url: coverUrl,
        cover_image_alt: coverAlt.trim() || null,
        cover_image_caption: coverCaption.trim() || null,
        image_source: imageSource.trim() || null,
        category_id: categoryId || null,
        neighborhoods,
        source_type: sourceType,
        source_name: sourceType === "original" ? sourceName.trim() || null : sourceName.trim(),
        source_url: sourceType === "original" ? sourceUrl.trim() || null : sourceUrl.trim(),
        author: author.trim() || "RehberGölbaşı Haber Merkezi",
        status: targetStatus,
        published_at: fromDatetimeLocal(publishedAt),
        is_featured: isFeatured,
        is_breaking: isBreaking,
        breaking_until: isBreaking ? fromDatetimeLocal(breakingUntil) : null,
        is_sponsored: isSponsored,
        sponsor_name: isSponsored ? sponsorName.trim() || null : null,
        sponsor_description: isSponsored ? sponsorDescription.trim() || null : null,
        sponsor_url: isSponsored ? sponsorUrl.trim() || null : null,
        seo_title: seoTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        canonical_override: canonicalOverride.trim() || null,
        search_text: searchText,
        updated_by: userEmail,
      };
      return payload;
    },
    [
      title, slug, summary, contentMarkdown, coverUrl, coverAlt, coverCaption, imageSource, categoryId,
      neighborhoods, sourceType, sourceName, sourceUrl, author, publishedAt, isFeatured, isBreaking,
      breakingUntil, isSponsored, sponsorName, sponsorDescription, sponsorUrl, seoTitle, metaDescription,
      canonicalOverride, selectedTagNames,
    ]
  );

  const syncRelations = useCallback(async (postId: string) => {
    await supabase.from("gundem_post_tags").delete().eq("post_id", postId);
    if (selectedTagIds.length > 0) {
      await supabase.from("gundem_post_tags").insert(selectedTagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })));
    }
    await supabase.from("gundem_post_businesses").delete().eq("post_id", postId);
    if (relatedBusinesses.length > 0) {
      await supabase
        .from("gundem_post_businesses")
        .insert(relatedBusinesses.map((b) => ({ post_id: postId, business_id: b.id })));
    }
  }, [selectedTagIds, relatedBusinesses]);

  const performAutosave = useCallback(async () => {
    if (!dirtyRef.current) return;
    if (!title.trim() && !contentMarkdown.trim()) return;
    setAutosaveState("saving");
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email ?? null;
      const payload = buildPayload(savedStatusRef.current, userEmail);

      let autosavePostId = postIdRef.current;
      if (!autosavePostId) {
        const { data, error: insertErr } = await supabase
          .from("gundem_posts")
          .insert({ ...payload, status: "draft", created_by: userEmail })
          .select("id")
          .single();
        if (insertErr || !data) throw insertErr ?? new Error("insert failed");
        autosavePostId = data.id;
        postIdRef.current = data.id;
        savedStatusRef.current = "draft";
      } else {
        const { error: updateErr } = await supabase.from("gundem_posts").update(payload).eq("id", autosavePostId);
        if (updateErr) throw updateErr;
      }
      if (!autosavePostId) throw new Error("post id missing after save");
      await syncRelations(autosavePostId);
      dirtyRef.current = false;
      setAutosaveState("saved");
    } catch {
      setAutosaveState("error");
    }
  }, [buildPayload, syncRelations, title, contentMarkdown]);

  // Otomatik taslak kaydetme: değişiklikten 2.5 saniye sonra, debounce ile.
  // Yalnızca İÇERİK alanlarını kaydeder — yayın durumunu asla değiştirmez
  // (durum yalnızca "Kaydet" butonuyla, kullanıcının açık isteğiyle değişir).
  useEffect(() => {
    dirtyRef.current = true;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      performAutosave();
    }, 2500);
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title, slug, summary, contentMarkdown, coverUrl, coverAlt, coverCaption, imageSource, categoryId,
    neighborhoods, selectedTagIds, relatedBusinesses, sourceType, sourceName, sourceUrl, author,
    isSponsored, sponsorName, sponsorDescription, sponsorUrl, seoTitle, metaDescription, canonicalOverride,
  ]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (dirtyRef.current) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  async function handleSave() {
    const validationError = buildValidationError(status);
    if (validationError) { setError(validationError); return; }

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    setSaving(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email ?? null;
      const payload = buildPayload(status, userEmail);

      if (markCorrection && postIdRef.current && previousSnapshotRef.current) {
        payload.correction_note = correctionNote.trim();
        payload.corrected_at = new Date().toISOString();
        payload.corrected_by = userEmail;
      }

      let postId = postIdRef.current;
      if (!postId) {
        const { data, error: insertErr } = await supabase
          .from("gundem_posts")
          .insert({ ...payload, created_by: userEmail })
          .select("id")
          .single();
        if (insertErr || !data) throw insertErr ?? new Error("Kayıt oluşturulamadı");
        postId = data.id;
        postIdRef.current = postId;
      } else {
        const { error: updateErr } = await supabase.from("gundem_posts").update(payload).eq("id", postId);
        if (updateErr) throw updateErr;
      }

      if (!postId) throw new Error("Kayıt oluşturulamadı");
      await syncRelations(postId);

      if (markCorrection && previousSnapshotRef.current) {
        await supabase.from("gundem_post_revisions").insert({
          post_id: postId,
          changed_by: userEmail,
          correction_note: correctionNote.trim(),
          previous_snapshot: previousSnapshotRef.current,
          new_snapshot: { ...previousSnapshotRef.current, ...payload },
        });
      }

      savedStatusRef.current = status;
      dirtyRef.current = false;
      setSaving(false);
      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      setError(`Kaydedilemedi: ${message}`);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-dark/50 px-4 py-8">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-navy">
            {isEdit ? "Gündem İçeriğini Düzenle" : "Yeni Gündem İçeriği"}
          </h2>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-ink/40">
              {autosaveState === "saving" && (<><Loader2 className="h-3.5 w-3.5 animate-spin" /> Kaydediliyor...</>)}
              {autosaveState === "saved" && (<><Check className="h-3.5 w-3.5 text-green-600" /> Otomatik kaydedildi</>)}
              {autosaveState === "error" && (<><AlertTriangle className="h-3.5 w-3.5 text-gold-dark" /> Otomatik kayıt başarısız, elle kaydet</>)}
            </span>
            <button onClick={onClose} className="text-ink/40 hover:text-ink">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Başlık *</label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              placeholder="Gölbaşı Belediyesi'nden yeni açıklama"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Slug *</label>
            <input
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm font-mono outline-none focus:border-bordo"
            />
            <p className="mt-1 text-xs text-ink/50">rehbergolbasi.com/gundem/{slug || "..."}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Kısa özet *</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              placeholder="Liste kartında ve meta açıklamada görünecek 160-240 karakterlik özet"
            />
            <p className="mt-0.5 text-xs text-ink/40">{summary.length} karakter (önerilen 160-240)</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Kapak görseli</label>
            {coverUrl && (
              <div className="mb-2 relative h-40 w-full overflow-hidden rounded-lg border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl} alt="kapak" className="h-full w-full object-cover" />
                <button onClick={() => setCoverUrl(null)} className="absolute right-2 top-2 rounded-full bg-bordo p-1 text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2.5 text-sm font-semibold text-ink/60 hover:border-bordo hover:text-bordo">
              {uploading ? "Yükleniyor..." : "Görsel Yükle"}
              <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(e) => handleCoverUpload(e.target.files)} className="hidden" />
            </label>
            {coverWarning && <p className="mt-1.5 text-xs text-gold-dark">{coverWarning}</p>}
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                value={coverAlt}
                onChange={(e) => setCoverAlt(e.target.value)}
                placeholder="Görsel alt metni (zorunlu, yayınlamak için)"
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              />
              <input
                value={imageSource}
                onChange={(e) => setImageSource(e.target.value)}
                placeholder="Görsel kaynağı (ör. RehberGölbaşı, Belediye)"
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              />
            </div>
            <input
              value={coverCaption}
              onChange={(e) => setCoverCaption(e.target.value)}
              placeholder="Görsel açıklaması (isteğe bağlı)"
              className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Kategori</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              >
                <option value="">Kategori seç...</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Yazar</label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Etiketler</label>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    selectedTagIds.includes(tag.id) ? "border-bordo bg-bordo/10 text-bordo" : "border-line text-ink/60 hover:border-bordo/40"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
              {allTags.length === 0 && <p className="text-xs text-ink/40">Henüz etiket tanımlı değil.</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">İlgili mahalleler</label>
            <div className="flex flex-wrap gap-1.5">
              {neighborhoods.map((n) => (
                <span key={n} className="flex items-center gap-1 rounded-full bg-offwhite px-3 py-1 text-xs font-semibold text-navy">
                  {n}
                  <button onClick={() => removeNeighborhood(n)} className="text-ink/40 hover:text-bordo"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="mt-1.5 flex gap-2">
              <input
                value={neighborhoodInput}
                onChange={(e) => setNeighborhoodInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNeighborhood(); } }}
                placeholder="Mahalle adı yazıp Enter'a bas"
                className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              />
              <button type="button" onClick={addNeighborhood} className="rounded-lg border border-line px-3 text-ink/60 hover:border-bordo hover:text-bordo">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">İlgili işletmeler</label>
            <div className="flex flex-wrap gap-1.5">
              {relatedBusinesses.map((b) => (
                <span key={b.id} className="flex items-center gap-1 rounded-full bg-offwhite px-3 py-1 text-xs font-semibold text-navy">
                  {b.name}
                  <button onClick={() => removeBusiness(b.id)} className="text-ink/40 hover:text-bordo"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
              <input
                value={businessQuery}
                onChange={(e) => setBusinessQuery(e.target.value)}
                placeholder="İşletme adıyla ara ve ekle"
                className="w-full rounded-lg border border-line py-2 pl-9 pr-3 text-sm outline-none focus:border-bordo"
              />
              {businessResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-line bg-white shadow-lg">
                  {businessResults.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => addBusiness(b)}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-offwhite"
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Haber metni *</label>
            <div data-color-mode="light">
              <MDEditor value={contentMarkdown} onChange={(val) => setContentMarkdown(val ?? "")} height={360} preview="live" />
            </div>
            <p className="mt-1 text-xs text-ink/50">
              ## ile H2, ### ile H3 başlık (H1 kullanılamaz — sayfanın tek H1&apos;i haber başlığıdır). **kalın**, *italik*, &gt; alıntı, [link](https://...), ![alt](görsel-url). Tahmini okuma süresi: {readingTime} dk.
            </p>
            <p className="mt-1 rounded-lg bg-offwhite px-3 py-2 text-xs text-ink/60">
              Başka bir kaynağa dayanan içerikleri özgün biçimde yazın. Kaynak metni ve görselleri izinsiz kopyalamayın.
            </p>
          </div>

          <div className="rounded-lg border border-line bg-offwhite p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/40">Kaynak ve Doğruluk</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-navy">Kaynak türü</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as GundemSourceType)}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo"
                >
                  {Object.entries(GUNDEM_SOURCE_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              {sourceType !== "original" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="Kaynak adı *"
                    className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo"
                  />
                  <input
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="Kaynak bağlantısı (https://...) *"
                    className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo"
                  />
                </div>
              )}
            </div>
          </div>

          {isEdit && (
            <div className="rounded-lg border border-line bg-offwhite p-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-navy">
                <input type="checkbox" checked={markCorrection} onChange={(e) => setMarkCorrection(e.target.checked)} />
                Bu kaydetme önemli bir düzeltme içeriyor (yazım hatası değil, haberin anlamını değiştiren bir bilgi)
              </label>
              {markCorrection && (
                <textarea
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  rows={2}
                  placeholder='Örn: "Haberde daha önce yanlış belirtilen sokak bilgisi güncellenmiştir."'
                  className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo"
                />
              )}
            </div>
          )}

          <div className="rounded-lg border border-line bg-offwhite p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/40">SEO Ayarları</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-navy">SEO Başlığı</label>
                <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Boş bırakılırsa haber başlığı kullanılır" className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-navy">Meta Açıklama</label>
                <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} placeholder="Boş bırakılırsa kısa özet kullanılır" className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-navy">Canonical Override (yalnızca gerekirse)</label>
                <input value={canonicalOverride} onChange={(e) => setCanonicalOverride(e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Yayın durumu</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GundemPostStatus)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              >
                <option value="draft">Taslak</option>
                <option value="scheduled">Zamanlanmış</option>
                <option value="published">Yayında</option>
                <option value="archived">Arşivlendi</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">
                Yayın tarihi/saati {(status === "scheduled" || status === "published") && "*"}
              </label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setIsFeatured(!isFeatured)} className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold transition ${isFeatured ? "border-gold bg-gold/10 text-gold-dark" : "border-line text-ink/50 hover:bg-white"}`}>
              <Star className={`h-4 w-4 ${isFeatured ? "fill-gold-dark" : ""}`} /> {isFeatured ? "Öne Çıkan" : "Öne Çıkar"}
            </button>
            <button type="button" onClick={() => setIsBreaking(!isBreaking)} className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold transition ${isBreaking ? "border-bordo bg-bordo/10 text-bordo" : "border-line text-ink/50 hover:bg-white"}`}>
              <Zap className={`h-4 w-4 ${isBreaking ? "fill-bordo" : ""}`} /> {isBreaking ? "Son Dakika" : "Son Dakika Yap"}
            </button>
            <button type="button" onClick={() => setIsSponsored(!isSponsored)} className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold transition ${isSponsored ? "border-navy bg-navy/5 text-navy" : "border-line text-ink/50 hover:bg-white"}`}>
              <Megaphone className="h-4 w-4" /> {isSponsored ? "Sponsorlu" : "Sponsorlu Yap"}
            </button>
          </div>

          {isBreaking && (
            <div className="w-full max-w-xs">
              <label className="mb-1 block text-sm font-semibold text-navy">Son dakika bitiş zamanı</label>
              <input type="datetime-local" value={breakingUntil} onChange={(e) => setBreakingUntil(e.target.value)} className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo" />
              <p className="mt-1 text-xs text-ink/50">Boş bırakılırsa rozet manuel kaldırılana kadar görünür.</p>
            </div>
          )}

          {isSponsored && (
            <div className="rounded-lg border border-navy/20 bg-navy/5 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-navy/60">Sponsorlu İçerik Bilgileri</p>
              <div className="flex flex-col gap-3">
                <input value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} placeholder="Sponsor adı *" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo" />
                <textarea value={sponsorDescription} onChange={(e) => setSponsorDescription(e.target.value)} rows={2} placeholder="Sponsorluk açıklaması (isteğe bağlı)" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo" />
                <input value={sponsorUrl} onChange={(e) => setSponsorUrl(e.target.value)} placeholder="Sponsor bağlantısı (https://...)" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo" />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-bordo">{error}</p>}

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink/60 hover:bg-offwhite">
              Vazgeç
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-navy hover:bg-offwhite"
            >
              <Eye className="h-4 w-4" /> Önizle
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-bordo px-5 py-2 text-sm font-bold text-white hover:bg-bordo-dark disabled:opacity-60">
              <Save className="h-4 w-4" /> {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      </div>

      {showPreview && (
        <GundemPreviewModal
          data={{
            title,
            summary,
            contentMarkdown,
            coverUrl,
            coverAlt,
            categoryName: categories.find((c) => c.id === categoryId)?.name ?? null,
            author: author.trim() || "RehberGölbaşı Haber Merkezi",
            publishedAtLocal: publishedAt,
            neighborhoods,
            isSponsored,
            sponsorName,
            isBreaking,
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
