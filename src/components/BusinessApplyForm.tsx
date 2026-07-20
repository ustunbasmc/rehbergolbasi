"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import type { Category, OpeningHours } from "@/lib/types";
import { DEFAULT_OPENING_HOURS } from "@/lib/types";
import OpeningHoursEditor from "@/components/OpeningHoursEditor";
import FeaturesSelector from "@/components/FeaturesSelector";
import { Plus, Trash2, Check, ShieldCheck } from "lucide-react";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[240px] items-center justify-center rounded-lg border border-line bg-offwhite text-sm text-ink/40">
      Harita yükleniyor...
    </div>
  ),
});

function slugify(text: string) {
  const trMap: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u"
  };
  return text
    .split("")
    .map((ch) => trMap[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uploadFile(file: File): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
  const { error: uploadError } = await supabase.storage.from("business-photos").upload(filePath, file);
  if (uploadError) return null;
  const { data } = supabase.storage.from("business-photos").getPublicUrl(filePath);
  return data.publicUrl;
}

interface FaqDraft {
  question: string;
  answer: string;
}

const STEPS = [
  { n: 1, label: "Temel Bilgiler" },
  { n: 2, label: "Detaylar" },
  { n: 3, label: "Sahiplik & Onay" },
];

export default function BusinessApplyForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [menuFiles, setMenuFiles] = useState<File[]>([]);
  const [faqs, setFaqs] = useState<FaqDraft[]>([]);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [openingHours, setOpeningHours] = useState<OpeningHours>(DEFAULT_OPENING_HOURS);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [honeypot, setHoneypot] = useState("");

  const topLevelCategories = categories.filter((c) => !c.parent_id);

  const [categoryId, setCategoryId] = useState(topLevelCategories[0]?.id ?? "");
  const [subcategoryId, setSubcategoryId] = useState("");

  const subcategories = categories.filter((c) => c.parent_id === categoryId);

  const [form, setForm] = useState({
    name: "",
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

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
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

  async function generateUniqueSlug(base: string): Promise<string> {
    const { data } = await supabase.from("businesses").select("slug").ilike("slug", `${base}%`);
    const existing = new Set((data ?? []).map((d) => d.slug));
    if (!existing.has(base)) return base;
    let i = 2;
    while (existing.has(`${base}-${i}`)) i++;
    return `${base}-${i}`;
  }

  function goNext() {
    if (step === 1 && !form.name.trim()) {
      setError("İşletme adını girmeden devam edemezsin.");
      return;
    }
    setError(null);
    setStep((s) => Math.min(3, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (step !== 3) {
      goNext();
      return;
    }

    if (honeypot.trim() !== "") {
      return;
    }

    setLoading(true);
    setError(null);
    setUploading(true);

    let coverUrl: string | null = null;
    if (coverFile) {
      coverUrl = await uploadFile(coverFile);
      if (!coverUrl) {
        setUploading(false);
        setLoading(false);
        setError("Kapak fotoğrafı yüklenemedi, lütfen tekrar dene.");
        return;
      }
    }

    const galleryUrls: string[] = [];
    for (const file of galleryFiles) {
      const url = await uploadFile(file);
      if (url) galleryUrls.push(url);
    }

    const menuUploads: { url: string; file_type: string }[] = [];
    for (const file of menuFiles) {
      const url = await uploadFile(file);
      if (url) {
        menuUploads.push({ url, file_type: file.type === "application/pdf" ? "pdf" : "image" });
      }
    }

    setUploading(false);

    const finalCategoryId = subcategoryId || categoryId;

    const baseSlug = slugify(form.name);
    const slug = await generateUniqueSlug(baseSlug);

    const { data: inserted, error: insertError } = await supabase
      .from("businesses")
      .insert({
        name: form.name,
        slug,
        category_id: finalCategoryId,
        description: form.description || null,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        address: form.address || null,
        neighborhood: form.neighborhood || null,
        instagram_url: form.instagram_url || null,
        facebook_url: form.facebook_url || null,
        tiktok_url: form.tiktok_url || null,
        cover_image_url: coverUrl,
        lat,
        lng,
        opening_hours: openingHours,
        tier: "basic",
        status: "pending"
      })
      .select()
      .single();

    if (insertError || !inserted) {
      setLoading(false);
      setError("Bir şeyler ters gitti, lütfen tekrar dene: " + insertError?.message);
      return;
    }

    if (galleryUrls.length > 0) {
      const rows = galleryUrls.map((url, i) => ({ business_id: inserted.id, url, display_order: i }));
      await supabase.from("business_photos").insert(rows);
    }

    if (selectedFeatures.length > 0) {
      const featureRows = selectedFeatures.map((feature_id) => ({ business_id: inserted.id, feature_id }));
      await supabase.from("business_features").insert(featureRows);
    }

    if (menuUploads.length > 0) {
      const rows = menuUploads.map((m, i) => ({
        business_id: inserted.id,
        url: m.url,
        file_type: m.file_type,
        display_order: i,
      }));
      await supabase.from("business_menu_items").insert(rows);
    }

    const validFaqs = faqs.filter((f) => f.question.trim() && f.answer.trim());
    if (validFaqs.length > 0) {
      const rows = validFaqs.map((f, i) => ({
        business_id: inserted.id,
        question: f.question.trim(),
        answer: f.answer.trim(),
        display_order: i,
      }));
      await supabase.from("business_faqs").insert(rows);
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
    router.push("/isletme-ekle/tesekkurler");
  }

  return (
    <div>
      <div className="mb-8 flex items-center">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  step > s.n ? "bg-bordo text-white" : step === s.n ? "bg-bordo text-white ring-4 ring-bordo/15" : "bg-navy/5 text-ink/40"
                }`}
              >
                {step > s.n ? <Check className="h-4 w-4" /> : s.n}
              </div>
              <span className={`hidden text-[11px] font-semibold sm:block ${step >= s.n ? "text-navy" : "text-ink/40"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-2 h-0.5 flex-1 rounded ${step > s.n ? "bg-bordo" : "bg-navy/10"}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          aria-hidden="true"
        />

        {step === 1 && (
          <>
            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">İşletme adı *</label>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                placeholder="Örn. Cansu Kuaför"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Kategori *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              >
                {topLevelCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {subcategories.length > 0 && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-navy">Alt kategori</label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                >
                  <option value="">
                    Genel ({topLevelCategories.find((c) => c.id === categoryId)?.name})
                  </option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-ink/50">
                  İşletmen daha spesifik bir alt kategoriye giriyorsa seç, girmiyorsa &quot;Genel&quot; olarak bırakabilirsin.
                </p>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Açıklama</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                placeholder="İşletmeni kısaca tanıt"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-navy">Telefon</label>
                <input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                  placeholder="0555 123 45 67"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-navy">WhatsApp</label>
                <input
                  value={form.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                  placeholder="905551234567"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Mahalle</label>
              <input
                value={form.neighborhood}
                onChange={(e) => update("neighborhood", e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                placeholder="Örn. Merkez"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Adres</label>
              <input
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Konum</label>
              <p className="mb-2 text-xs text-ink/50">Haritada işletmenin bulunduğu noktaya tıkla.</p>
              <LocationPicker
                lat={lat}
                lng={lng}
                onChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Çalışma saatleri</label>
              <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Özellikler</label>
              <FeaturesSelector value={selectedFeatures} onChange={setSelectedFeatures} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Instagram linki</label>
              <input
                value={form.instagram_url}
                onChange={(e) => update("instagram_url", e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Facebook linki</label>
              <input
                value={form.facebook_url}
                onChange={(e) => update("facebook_url", e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">TikTok linki</label>
              <input
                value={form.tiktok_url}
                onChange={(e) => update("tiktok_url", e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                placeholder="https://tiktok.com/@..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Kapak fotoğrafı</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-offwhite file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-navy"
              />
              <p className="mt-1 text-xs text-ink/50">İsteğe bağlı, en fazla birkaç MB.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Galeri fotoğrafları</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setGalleryFiles(Array.from(e.target.files ?? []))}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-offwhite file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-navy"
              />
              <p className="mt-1 text-xs text-ink/50">İsteğe bağlı, birden fazla fotoğraf seçebilirsin.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Menü / Fiyat Listesi</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={(e) => setMenuFiles(Array.from(e.target.files ?? []))}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-offwhite file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-navy"
              />
              <p className="mt-1 text-xs text-ink/50">İsteğe bağlı, fotoğraf veya PDF olarak yükleyebilirsin.</p>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-semibold text-navy">Sıkça Sorulan Sorular</label>
                <button type="button" onClick={addFaq} className="flex items-center gap-1 text-xs font-semibold text-bordo hover:underline">
                  <Plus className="h-3.5 w-3.5" /> Soru ekle
                </button>
              </div>
              {faqs.length === 0 && (
                <p className="text-xs text-ink/40">İsteğe bağlı, müşterilerin sık sorduğu soruları ekleyebilirsin.</p>
              )}
              <div className="flex flex-col gap-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="rounded-lg border border-line p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink/50">Soru {i + 1}</span>
                      <button type="button" onClick={() => removeFaq(i)} className="text-ink/40 hover:text-bordo">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      value={faq.question}
                      onChange={(e) => updateFaq(i, "question", e.target.value)}
                      placeholder="Soru (örn. Rezervasyon gerekli mi?)"
                      className="mb-2 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                    />
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFaq(i, "answer", e.target.value)}
                      placeholder="Cevap"
                      rows={2}
                      className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="rounded-lg border border-line bg-offwhite p-4">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-navy" />
                <p className="text-sm font-semibold text-navy">Bu bilgiler gizli tutulur</p>
              </div>
              <p className="text-xs leading-relaxed text-ink/60">
                Aşağıdaki bilgiler sitede yayınlanmaz, ziyaretçiler göremez. Sadece işletmeni onaylarken ve gerektiğinde seninle iletişime geçmek için kullanılır.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">İşletme sahibinin adı</label>
              <input
                value={form.owner_name}
                onChange={(e) => update("owner_name", e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-navy">Sahibinin telefonu</label>
                <input
                  value={form.owner_phone}
                  onChange={(e) => update("owner_phone", e.target.value)}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                  placeholder="0555 123 45 67"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-navy">Sahibinin e-postası</label>
                <input
                  type="email"
                  value={form.owner_email}
                  onChange={(e) => update("owner_email", e.target.value)}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
                />
              </div>
            </div>

            <div className="rounded-lg border border-line p-4">
              <p className="mb-2 text-sm font-semibold text-navy">Özet</p>
              <div className="flex flex-col gap-1 text-xs text-ink/60">
                <p><span className="font-semibold text-ink/80">İşletme:</span> {form.name || "—"}</p>
                <p>
                  <span className="font-semibold text-ink/80">Kategori:</span>{" "}
                  {subcategoryId
                    ? categories.find((c) => c.id === subcategoryId)?.name
                    : topLevelCategories.find((c) => c.id === categoryId)?.name ?? "—"}
                </p>
                <p><span className="font-semibold text-ink/80">Telefon:</span> {form.phone || "—"}</p>
                <p><span className="font-semibold text-ink/80">Fotoğraf:</span> {coverFile ? "1 kapak" : "yok"} {galleryFiles.length > 0 && `+ ${galleryFiles.length} galeri`}</p>
                <p><span className="font-semibold text-ink/80">SSS:</span> {faqs.filter((f) => f.question.trim()).length} soru</p>
              </div>
            </div>
          </>
        )}

        {error && <p className="text-sm text-bordo">{error}</p>}

        <div className="mt-2 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button type="button" onClick={goBack} className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink/60 hover:bg-offwhite">
              Geri
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <button type="button" onClick={goNext} className="ml-auto rounded-lg bg-bordo px-5 py-2.5 text-sm font-bold text-white hover:bg-bordo-dark">
              Devam Et →
            </button>
          ) : (
            <button type="submit" disabled={loading} className="ml-auto rounded-lg bg-bordo px-5 py-2.5 text-sm font-bold text-white hover:bg-bordo-dark disabled:opacity-60">
              {uploading ? "Dosyalar yükleniyor..." : loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}