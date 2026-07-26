"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { X, Save, Eye, EyeOff, Star } from "lucide-react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface Guide {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  read_time: number;
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
  featured: boolean;
  created_at: string;
}

function slugify(text: string) {
  const trMap: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return text.split("").map((ch) => trMap[ch] ?? ch).join("")
    .toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim()
    .replace(/\s+/g, "-").replace(/-+/g, "-");
}

async function uploadCover(file: File): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `guides/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("business-photos").upload(path, file);
  if (error) return null;
  const { data } = supabase.storage.from("business-photos").getPublicUrl(path);
  return data.publicUrl;
}

export default function GuideEditor({
  guide,
  onClose,
  onSaved,
}: {
  guide?: Guide;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!guide;
  const [title, setTitle] = useState(guide?.title ?? "");
  const [slug, setSlug] = useState(guide?.slug ?? "");
  const [excerpt, setExcerpt] = useState(guide?.excerpt ?? "");
  const [content, setContent] = useState(guide?.content ?? "");
  const [coverUrl, setCoverUrl] = useState<string | null>(guide?.cover_image_url ?? null);
  const [readTime, setReadTime] = useState(guide?.read_time ?? 5);
  const [seoTitle, setSeoTitle] = useState(guide?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(guide?.seo_description ?? "");
  const [published, setPublished] = useState(guide?.published ?? false);
  const [featured, setFeatured] = useState(guide?.featured ?? false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!isEdit) setSlug(slugify(val));
  }

  async function handleCoverUpload(files: FileList | null) {
    if (!files?.[0]) return;
    setUploading(true);
    const url = await uploadCover(files[0]);
    if (url) setCoverUrl(url);
    setUploading(false);
  }

  async function handleSave() {
    if (!title.trim()) { setError("Başlık zorunlu."); return; }
    if (!slug.trim()) { setError("Slug zorunlu."); return; }
    if (!content.trim()) { setError("İçerik zorunlu."); return; }

    setSaving(true);
    setError(null);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content: content.trim(),
      cover_image_url: coverUrl,
      read_time: readTime,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDesc.trim() || null,
      published,
      featured,
      updated_at: new Date().toISOString(),
    };

    if (isEdit) {
      const { error: err } = await supabase
        .from("guides")
        .update(payload)
        .eq("id", guide.id);
      if (err) { setError("Kaydedilemedi: " + err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from("guides").insert(payload);
      if (err) { setError("Kaydedilemedi: " + err.message); setSaving(false); return; }
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-dark/50 px-4 py-8">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-navy">
            {isEdit ? "Rehberi Düzenle" : "Yeni Rehber"}
          </h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Başlık */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Başlık *</label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              placeholder="Gölbaşı'nda Çocukla Gidilecek Yerler"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Slug *</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo font-mono"
              placeholder="golbasinda-cocukla-gidilecek-yerler"
            />
            <p className="mt-1 text-xs text-ink/50">
              rehbergolbasi.com/rehberler/{slug || "..."}
            </p>
          </div>

          {/* Özet */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Kısa özet</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              placeholder="Liste sayfasında görünecek kısa açıklama (1-2 cümle)"
            />
          </div>

          {/* Kapak görseli */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Kapak görseli</label>
            {coverUrl && (
              <div className="mb-2 relative h-40 w-full overflow-hidden rounded-lg border border-line">
                <img src={coverUrl} alt="kapak" className="h-full w-full object-cover" />
                <button
                  onClick={() => setCoverUrl(null)}
                  className="absolute right-2 top-2 rounded-full bg-bordo p-1 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2.5 text-sm font-semibold text-ink/60 hover:border-bordo hover:text-bordo">
              {uploading ? "Yükleniyor..." : "Görsel Yükle"}
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => handleCoverUpload(e.target.files)}
                className="hidden"
              />
            </label>
          </div>

          {/* İçerik editörü */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">İçerik *</label>
            <div data-color-mode="light">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val ?? "")}
                height={400}
                preview="live"
              />
            </div>
            <p className="mt-1 text-xs text-ink/50">
              ## ile H2 başlık, ### ile H3, **kalın**, *italik*, [link](url) kullanabilirsin.
            </p>
          </div>

          {/* Okuma süresi */}
          <div className="w-32">
            <label className="mb-1 block text-sm font-semibold text-navy">Okuma süresi (dk)</label>
            <input
              type="number"
              value={readTime}
              onChange={(e) => setReadTime(Number(e.target.value))}
              min={1}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
            />
          </div>

          {/* SEO */}
          <div className="rounded-lg border border-line bg-offwhite p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/40">SEO Ayarları</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-navy">SEO Başlığı</label>
                <input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo"
                  placeholder="Boş bırakılırsa yazı başlığı kullanılır"
                />
                <p className="mt-0.5 text-xs text-ink/40">{seoTitle.length}/60 karakter</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-navy">SEO Açıklaması</label>
                <textarea
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo"
                  placeholder="Boş bırakılırsa kısa özet kullanılır"
                />
                <p className="mt-0.5 text-xs text-ink/40">{seoDesc.length}/160 karakter</p>
              </div>
            </div>
          </div>

          {/* Yayın & Öne çıkar */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPublished(!published)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold transition ${
                published
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-line text-ink/50 hover:bg-offwhite"
              }`}
            >
              {published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {published ? "Yayında" : "Taslak"}
            </button>
            <button
              type="button"
              onClick={() => setFeatured(!featured)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold transition ${
                featured
                  ? "border-gold bg-gold/10 text-gold-dark"
                  : "border-line text-ink/50 hover:bg-offwhite"
              }`}
            >
              <Star className={`h-4 w-4 ${featured ? "fill-gold-dark" : ""}`} />
              {featured ? "Öne Çıkan" : "Öne Çıkar"}
            </button>
          </div>

          {error && <p className="text-sm text-bordo">{error}</p>}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink/60 hover:bg-offwhite"
            >
              Vazgeç
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-bordo px-5 py-2 text-sm font-bold text-white hover:bg-bordo-dark disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}