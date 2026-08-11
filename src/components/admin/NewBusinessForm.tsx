"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/types";
import FeaturesSelector from "@/components/FeaturesSelector";
import TagsSelector from "@/components/TagsSelector";
import {
  Plus, Trash2, CheckCircle2, Upload, X, Building2,
  MapPin, Share2, Sparkles, HelpCircle, ShieldCheck, Rocket, 
  Gauge,
} from "lucide-react";

function slugify(text: string) {
  const trMap: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return text.split("").map((ch) => trMap[ch] ?? ch).join("")
    .toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim()
    .replace(/\s+/g, "-").replace(/-+/g, "-");
}

async function uploadFile(file: File): Promise<string | null> {
  // Görsel sunucu tarafında sıkıştırılıp WebP'ye çevrilir (/api/upload-photo).
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload-photo", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) return null;
  const result = await res.json();
  return result.url ?? null;
}

interface FaqDraft {
  question: string;
  answer: string;
}

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-bordo transition-colors";
const labelClass = "mb-1.5 block text-sm font-semibold text-navy";

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center gap-3 border-b border-line bg-offwhite px-5 py-3.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bordo/10 text-bordo">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-bold text-navy">{title}</p>
          {subtitle && <p className="text-xs text-ink/40">{subtitle}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-4 p-5">{children}</div>
    </div>
  );
}

export default function NewBusinessForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const topLevelCategories = categories.filter((c) => !c.parent_id);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const subcategories = categories.filter((c) => c.parent_id === categoryId);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    phone: "",
    whatsapp: "",
    address: "",
    neighborhood: "",
    instagram_url: "",
    facebook_url: "",
    tiktok_url: "",
    owner_name: "",
    owner_phone: "",
    owner_email: "",
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<FaqDraft[]>([]);
  const [tier, setTier] = useState<"basic" | "premium">("basic");
  const [freeMonths, setFreeMonths] = useState(1);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true })
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleNameChange(value: string) {
    update("name", value);
    if (!slugTouched) update("slug", slugify(value));
  }

  function handleCategoryChange(id: string) {
    setCategoryId(id);
    setSubcategoryId("");
  }

  function handleCoverChange(file: File | null) {
    setCoverFile(file);
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  }

  function addFaq() {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  }

  function updateFaq(index: number, field: keyof FaqDraft, value: string) {
    setFaqs((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  }

  function removeFaq(index: number) {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setForm({
      name: "", slug: "", description: "", phone: "", whatsapp: "",
      address: "", neighborhood: "", instagram_url: "", facebook_url: "", tiktok_url: "",
      owner_name: "", owner_phone: "", owner_email: "",
    });
    setCategoryId("");
    setSubcategoryId("");
    setCoverFile(null);
    setCoverPreview(null);
    setGalleryFiles([]);
    setSelectedFeatures([]);
    setSelectedTags([]);
    setFaqs([]);
    setTier("basic");
    setFreeMonths(1);
    setSlugTouched(false);
  }
const completionChecks = [
  { label: "İşletme adı", done: !!form.name.trim() },
  { label: "Kategori", done: !!categoryId },
  { label: "Açıklama", done: form.description.trim().length > 50 },
  { label: "Telefon veya WhatsApp", done: !!form.phone.trim() || !!form.whatsapp.trim() },
  { label: "Adres/Mahalle", done: !!form.address.trim() || !!form.neighborhood.trim() },
  { label: "Kapak fotoğrafı", done: !!coverFile },
  { label: "En az 1 özellik", done: selectedFeatures.length > 0 },
  { label: "En az 1 etiket", done: selectedTags.length > 0 },
  { label: "En az 1 SSS", done: faqs.some((f) => f.question.trim() && f.answer.trim()) },
];
const completionScore = Math.round(
  (completionChecks.filter((c) => c.done).length / completionChecks.length) * 100
);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim()) { setError("İşletme adı zorunlu."); return; }
    if (!form.slug.trim()) { setError("Slug zorunlu."); return; }
    if (!categoryId) { setError("Kategori seçmelisin."); return; }

    setLoading(true);
    setUploading(true);

    let coverUrl: string | null = null;
    if (coverFile) {
      coverUrl = await uploadFile(coverFile);
    }

    const galleryUrls: string[] = [];
    for (const file of galleryFiles) {
      const url = await uploadFile(file);
      if (url) galleryUrls.push(url);
    }

    setUploading(false);

    const finalCategoryId = subcategoryId || categoryId;
    const freeUntil = new Date();
    freeUntil.setMonth(freeUntil.getMonth() + freeMonths);

    const { data: inserted, error: insertError } = await supabase
      .from("businesses")
      .insert({
        name: form.name.trim(),
        slug: form.slug.trim(),
        category_id: finalCategoryId,
        description: form.description.trim() || null,
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        address: form.address.trim() || null,
        neighborhood: form.neighborhood.trim() || null,
        instagram_url: form.instagram_url.trim() || null,
        facebook_url: form.facebook_url.trim() || null,
        tiktok_url: form.tiktok_url.trim() || null,
        cover_image_url: coverUrl,
        tier,
        status: "approved",
        is_active: true,
        free_until: freeUntil.toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (insertError || !inserted) {
      setError("Kaydedilemedi: " + insertError?.message);
      setLoading(false);
      return;
    }

    if (galleryUrls.length > 0) {
      await supabase.from("business_photos").insert(
        galleryUrls.map((url, i) => ({ business_id: inserted.id, url, display_order: i }))
      );
    }

    if (selectedFeatures.length > 0) {
      await supabase.from("business_features").insert(
        selectedFeatures.map((feature_id) => ({ business_id: inserted.id, feature_id }))
      );
    }

    if (selectedTags.length > 0) {
      await supabase.from("business_tags").insert(
        selectedTags.map((tag_id) => ({ business_id: inserted.id, tag_id }))
      );
    }

    const validFaqs = faqs.filter((f) => f.question.trim() && f.answer.trim());
    if (validFaqs.length > 0) {
      await supabase.from("business_faqs").insert(
        validFaqs.map((f, i) => ({
          business_id: inserted.id,
          question: f.question.trim(),
          answer: f.answer.trim(),
          display_order: i,
        }))
      );
    }

    if (form.owner_name.trim() || form.owner_phone.trim() || form.owner_email.trim()) {
      await supabase.from("business_owner_info").insert({
        business_id: inserted.id,
        owner_name: form.owner_name.trim() || null,
        owner_phone: form.owner_phone.trim() || null,
        owner_email: form.owner_email.trim() || null,
      });
    }

    setLoading(false);
    setSuccess(`"${inserted.name}" başarıyla oluşturuldu ve yayına alındı! → rehbergolbasi.com/isletme/${inserted.slug}`);
    resetForm();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5 pb-10">
      <div>
        <h2 className="font-display text-xl font-bold text-navy">Yeni İşletme Ekle</h2>
        <p className="text-sm text-ink/50">
          Bu form üzerinden eklenen işletme direkt onaylı ve yayında olarak kaydedilir.
        </p>
      </div>
<div className="rounded-2xl border border-line bg-white p-4">
  <div className="mb-2 flex items-center justify-between">
    <div className="flex items-center gap-1.5">
      <Gauge className="h-4 w-4 text-bordo" />
      <span className="text-sm font-bold text-navy">Profil Tamamlanma Oranı</span>
    </div>
    <span
      className={`text-sm font-bold ${
        completionScore >= 80 ? "text-green-600" : completionScore >= 50 ? "text-gold-dark" : "text-bordo"
      }`}
    >
      %{completionScore}
    </span>
  </div>
  <div className="mb-3 h-2 overflow-hidden rounded-full bg-offwhite">
    <div
      className={`h-full rounded-full transition-all duration-300 ${
        completionScore >= 80 ? "bg-green-500" : completionScore >= 50 ? "bg-gold" : "bg-bordo"
      }`}
      style={{ width: `${completionScore}%` }}
    />
  </div>
  <div className="flex flex-wrap gap-1.5">
    {completionChecks.filter((c) => !c.done).map((c) => (
      <span
        key={c.label}
        className="rounded-full bg-offwhite px-2.5 py-1 text-[11px] font-semibold text-ink/50"
      >
        Eksik: {c.label}
      </span>
    ))}
  </div>
</div>
      {success && (
        <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-bordo/20 bg-bordo/5 p-4 text-sm text-bordo">
          {error}
        </div>
      )}

      {/* Temel Bilgiler */}
      <SectionCard icon={Building2} title="Temel Bilgiler">
        <div>
          <label className={labelClass}>İşletme adı *</label>
          <input
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={inputClass}
            placeholder="Örn. Elit Peyzaj"
          />
        </div>

        <div>
          <label className={labelClass}>Slug *</label>
          <input
            value={form.slug}
            onChange={(e) => { update("slug", e.target.value); setSlugTouched(true); }}
            className={`${inputClass} font-mono`}
            placeholder="elit-peyzaj"
          />
          <p className="mt-1 text-xs text-ink/40">rehbergolbasi.com/isletme/{form.slug || "..."}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Ana kategori *</label>
            <select
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={inputClass}
            >
              <option value="">Seçiniz</option>
              {topLevelCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {subcategories.length > 0 && (
            <div>
              <label className={labelClass}>Alt kategori</label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className={inputClass}
              >
                <option value="">Genel</option>
                {subcategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Açıklama</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={6}
            className={inputClass}
            placeholder="SEO odaklı, uzun açıklama..."
          />
        </div>
      </SectionCard>

      {/* İletişim & Konum */}
      <SectionCard icon={MapPin} title="İletişim & Konum">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Telefon</label>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass}
              placeholder="05XXXXXXXXX"
            />
          </div>
          <div>
            <label className={labelClass}>WhatsApp</label>
            <input
              value={form.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
              className={inputClass}
              placeholder="905XXXXXXXXX"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Mahalle</label>
            <input
              value={form.neighborhood}
              onChange={(e) => update("neighborhood", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Adres</label>
            <input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </SectionCard>

      {/* Sosyal Medya */}
      <SectionCard icon={Share2} title="Sosyal Medya" subtitle="İsteğe bağlı">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Instagram</label>
            <input
              value={form.instagram_url}
              onChange={(e) => update("instagram_url", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Facebook</label>
            <input
              value={form.facebook_url}
              onChange={(e) => update("facebook_url", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>TikTok</label>
            <input
              value={form.tiktok_url}
              onChange={(e) => update("tiktok_url", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </SectionCard>

      {/* Fotoğraflar */}
      <SectionCard icon={Upload} title="Fotoğraflar" subtitle="İsteğe bağlı, önerilir">
        <div>
          <label className={labelClass}>Kapak fotoğrafı</label>
          {coverPreview ? (
            <div className="group relative mb-2 h-40 w-full overflow-hidden rounded-xl border border-line bg-offwhite">
              <Image src={coverPreview} alt="Kapak önizleme" fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => handleCoverChange(null)}
                className="absolute right-2 top-2 rounded-full bg-bordo p-1.5 text-white opacity-0 transition group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="mb-2 flex h-24 items-center justify-center rounded-xl border border-dashed border-line bg-offwhite text-xs text-ink/40">
              Henüz kapak görseli seçilmedi
            </div>
          )}
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line px-3 py-2.5 text-sm font-semibold text-ink/60 hover:border-bordo hover:text-bordo">
            <Upload className="h-4 w-4" /> Kapak Görseli Seç
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleCoverChange(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className={labelClass}>Galeri fotoğrafları</label>
          {galleryFiles.length > 0 && (
            <div className="mb-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {galleryFiles.map((file, i) => (
                <div key={i} className="group relative h-16 overflow-hidden rounded-lg border border-line bg-offwhite">
                  <Image src={URL.createObjectURL(file)} alt="" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => setGalleryFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute right-0.5 top-0.5 rounded-full bg-bordo p-0.5 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line px-3 py-2.5 text-sm font-semibold text-ink/60 hover:border-bordo hover:text-bordo">
            <Upload className="h-4 w-4" /> Galeri Fotoğrafı Ekle
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setGalleryFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
              className="hidden"
            />
          </label>
        </div>
      </SectionCard>

      {/* Özellikler & Etiketler */}
      <SectionCard icon={Sparkles} title="Özellikler & Etiketler">
        <div>
          <label className={labelClass}>Özellikler</label>
          <FeaturesSelector value={selectedFeatures} onChange={setSelectedFeatures} />
        </div>
        <div>
          <label className={labelClass}>Etiketler</label>
          <TagsSelector value={selectedTags} onChange={setSelectedTags} />
        </div>
      </SectionCard>

      {/* SSS */}
      <SectionCard icon={HelpCircle} title="Sıkça Sorulan Sorular" subtitle="İsteğe bağlı">
        <button
          type="button"
          onClick={addFaq}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-3 text-sm font-semibold text-bordo hover:bg-offwhite"
        >
          <Plus className="h-4 w-4" /> Soru ekle
        </button>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-lg border border-line bg-offwhite p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-ink/50">Soru {i + 1}</span>
                <button type="button" onClick={() => removeFaq(i)} className="text-ink/40 hover:text-bordo">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                value={faq.question}
                onChange={(e) => updateFaq(i, "question", e.target.value)}
                placeholder="Soru"
                className={`${inputClass} mb-2`}
              />
              <textarea
                value={faq.answer}
                onChange={(e) => updateFaq(i, "answer", e.target.value)}
                placeholder="Cevap"
                rows={2}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Sahiplik Bilgisi */}
      <SectionCard icon={ShieldCheck} title="Sahiplik Bilgisi" subtitle="Gizli tutulur, sadece admin görür">
        <div>
          <label className={labelClass}>İşletme sahibinin adı</label>
          <input
            value={form.owner_name}
            onChange={(e) => update("owner_name", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Sahibinin telefonu</label>
            <input
              value={form.owner_phone}
              onChange={(e) => update("owner_phone", e.target.value)}
              className={inputClass}
              placeholder="05XXXXXXXXX"
            />
          </div>
          <div>
            <label className={labelClass}>Sahibinin e-postası</label>
            <input
              type="email"
              value={form.owner_email}
              onChange={(e) => update("owner_email", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </SectionCard>

      {/* Yayın Ayarları */}
      <SectionCard icon={Rocket} title="Yayın Ayarları">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Paket</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as "basic" | "premium")}
              className={inputClass}
            >
              <option value="basic">Basic</option>
              <option value="premium">Premium (Öne Çıkan)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Ücretsiz süre (ay)</label>
            <input
              type="number"
              min={0}
              value={freeMonths}
              onChange={(e) => setFreeMonths(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
      </SectionCard>

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-bordo px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-bordo-dark hover:shadow-md disabled:opacity-60"
      >
        {uploading ? "Fotoğraflar yükleniyor..." : loading ? "Oluşturuluyor..." : "İşletmeyi Oluştur ve Yayınla"}
      </button>
    </form>
  );
}