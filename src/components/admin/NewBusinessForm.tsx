"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/types";
import FeaturesSelector from "@/components/FeaturesSelector";
import TagsSelector from "@/components/TagsSelector";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

function slugify(text: string) {
  const trMap: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return text.split("").map((ch) => trMap[ch] ?? ch).join("")
    .toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim()
    .replace(/\s+/g, "-").replace(/-+/g, "-");
}

interface FaqDraft {
  question: string;
  answer: string;
}

const inputClass =
  "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-bordo";
const labelClass = "mb-1.5 block text-sm font-semibold text-navy";

export default function NewBusinessForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
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
  });

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
    if (!slugTouched) {
      update("slug", slugify(value));
    }
  }

  function handleCategoryChange(id: string) {
    setCategoryId(id);
    setSubcategoryId("");
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
    });
    setCategoryId("");
    setSubcategoryId("");
    setSelectedFeatures([]);
    setSelectedTags([]);
    setFaqs([]);
    setTier("basic");
    setFreeMonths(1);
    setSlugTouched(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim()) { setError("İşletme adı zorunlu."); return; }
    if (!form.slug.trim()) { setError("Slug zorunlu."); return; }
    if (!categoryId) { setError("Kategori seçmelisin."); return; }

    setLoading(true);

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

    setLoading(false);
    setSuccess(`"${inserted.name}" başarıyla oluşturuldu ve yayına alındı! → rehbergolbasi.com/isletme/${inserted.slug}`);
    resetForm();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <div>
        <h2 className="font-display text-lg font-bold text-navy">Yeni İşletme Ekle</h2>
        <p className="text-xs text-ink/50">
          Bu form üzerinden eklenen işletme direkt onaylı ve yayında olarak kaydedilir.
        </p>
      </div>

      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {success}
        </div>
      )}
      {error && <p className="text-sm text-bordo">{error}</p>}

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

      <div>
        <label className={labelClass}>Özellikler</label>
        <FeaturesSelector value={selectedFeatures} onChange={setSelectedFeatures} />
      </div>

      <div>
        <label className={labelClass}>Etiketler</label>
        <TagsSelector value={selectedTags} onChange={setSelectedTags} />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className={labelClass}>Sıkça Sorulan Sorular</label>
          <button
            type="button"
            onClick={addFaq}
            className="flex items-center gap-1 text-xs font-semibold text-bordo hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Soru ekle
          </button>
        </div>
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
                className={`${inputClass} mb-2 bg-white`}
              />
              <textarea
                value={faq.answer}
                onChange={(e) => updateFaq(i, "answer", e.target.value)}
                placeholder="Cevap"
                rows={2}
                className={`${inputClass} bg-white`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-line bg-offwhite p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/40">Yayın Ayarları</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Paket</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as "basic" | "premium")}
              className={`${inputClass} bg-white`}
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
              className={`${inputClass} bg-white`}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-bordo px-5 py-3 text-sm font-bold text-white hover:bg-bordo-dark disabled:opacity-60"
      >
        {loading ? "Oluşturuluyor..." : "İşletmeyi Oluştur ve Yayınla"}
      </button>
    </form>
  );
}