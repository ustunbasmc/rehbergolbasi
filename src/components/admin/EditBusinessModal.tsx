"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import type { Business, Category, OpeningHours } from "@/lib/types";
import { DEFAULT_OPENING_HOURS } from "@/lib/types";
import { X, Star, Trash2, ShieldCheck } from "lucide-react";
import GalleryManager from "@/components/admin/GalleryManager";
import OpeningHoursEditor from "@/components/OpeningHoursEditor";
import FeaturesSelector from "@/components/FeaturesSelector";
import TagsSelector from "@/components/TagsSelector";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[240px] items-center justify-center rounded-lg border border-line bg-offwhite text-sm text-ink/40">
      Harita yükleniyor...
    </div>
  ),
});

export default function EditBusinessModal({
  business,
  categories,
  onClose,
  onSaved,
  onDeleted,
}: {
  business: Business;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [form, setForm] = useState({
    name: business.name,
    category_id: business.category_id,
    description: business.description ?? "",
    phone: business.phone ?? "",
    whatsapp: business.whatsapp ?? "",
    address: business.address ?? "",
    neighborhood: business.neighborhood ?? "",
    instagram_url: business.instagram_url ?? "",
    facebook_url: business.facebook_url ?? "",
    tiktok_url: business.tiktok_url ?? "",
  });
  const [tier, setTier] = useState<"basic" | "premium">(business.tier);
  const [lat, setLat] = useState<number | null>(business.lat);
  const [lng, setLng] = useState<number | null>(business.lng);
  const [openingHours, setOpeningHours] = useState<OpeningHours>(
    business.opening_hours ?? DEFAULT_OPENING_HOURS
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [featuresLoaded, setFeaturesLoaded] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagsLoaded, setTagsLoaded] = useState(false);

  const [ownerInfoId, setOwnerInfoId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerLoaded, setOwnerLoaded] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("business_features")
      .select("feature_id")
      .eq("business_id", business.id)
      .then(({ data }) => {
        setSelectedFeatures((data ?? []).map((r) => r.feature_id));
        setFeaturesLoaded(true);
      });

    supabase
      .from("business_tags")
      .select("tag_id")
      .eq("business_id", business.id)
      .then(({ data }) => {
        setSelectedTags((data ?? []).map((r) => r.tag_id));
        setTagsLoaded(true);
      });

    supabase
      .from("business_owner_info")
      .select("*")
      .eq("business_id", business.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setOwnerInfoId(data.id);
          setOwnerName(data.owner_name ?? "");
          setOwnerPhone(data.owner_phone ?? "");
          setOwnerEmail(data.owner_email ?? "");
        }
        setOwnerLoaded(true);
      });
  }, [business.id]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        name: form.name,
        category_id: form.category_id,
        description: form.description || null,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        address: form.address || null,
        neighborhood: form.neighborhood || null,
        instagram_url: form.instagram_url || null,
        facebook_url: form.facebook_url || null,
        tiktok_url: form.tiktok_url || null,
        lat,
        lng,
        opening_hours: openingHours,
        tier,
      })
      .eq("id", business.id);

    if (updateError) {
      setSaving(false);
      setError("Kaydedilemedi: " + updateError.message);
      return;
    }

    await supabase.from("business_features").delete().eq("business_id", business.id);
    if (selectedFeatures.length > 0) {
      await supabase.from("business_features").insert(
        selectedFeatures.map((feature_id) => ({ business_id: business.id, feature_id }))
      );
    }

    await supabase.from("business_tags").delete().eq("business_id", business.id);
    if (selectedTags.length > 0) {
      await supabase.from("business_tags").insert(
        selectedTags.map((tag_id) => ({ business_id: business.id, tag_id }))
      );
    }

    if (ownerName.trim() || ownerPhone.trim() || ownerEmail.trim()) {
      if (ownerInfoId) {
        await supabase
          .from("business_owner_info")
          .update({
            owner_name: ownerName.trim() || null,
            owner_phone: ownerPhone.trim() || null,
            owner_email: ownerEmail.trim() || null,
          })
          .eq("id", ownerInfoId);
      } else {
        await supabase.from("business_owner_info").insert({
          business_id: business.id,
          owner_name: ownerName.trim() || null,
          owner_phone: ownerPhone.trim() || null,
          owner_email: ownerEmail.trim() || null,
        });
      }
    }

    setSaving(false);
    onSaved();
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `"${business.name}" işletmesini kalıcı olarak silmek istediğine emin misin?`
    );
    if (!confirmed) return;

    setDeleting(true);
    const { error: deleteError } = await supabase
      .from("businesses")
      .delete()
      .eq("id", business.id);
    setDeleting(false);

    if (deleteError) {
      setError("Silinemedi: " + deleteError.message);
      return;
    }

    onDeleted();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/50 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-navy">İşletmeyi Düzenle</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">İşletme adı</label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Kategori</label>
            <select
              value={form.category_id}
              onChange={(e) => update("category_id", e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Açıklama</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Telefon</label>
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">WhatsApp</label>
              <input
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Mahalle</label>
            <input
              value={form.neighborhood}
              onChange={(e) => update("neighborhood", e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
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

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Çalışma saatleri</label>
            <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Özellikler</label>
            {featuresLoaded ? (
              <FeaturesSelector value={selectedFeatures} onChange={setSelectedFeatures} />
            ) : (
              <p className="text-xs text-ink/40">Yükleniyor...</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">
              Etiketler <span className="font-normal text-ink/40">(sadece admin atar)</span>
            </label>
            {tagsLoaded ? (
              <TagsSelector value={selectedTags} onChange={setSelectedTags} />
            ) : (
              <p className="text-xs text-ink/40">Yükleniyor...</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Instagram linki</label>
            <input
              value={form.instagram_url}
              onChange={(e) => update("instagram_url", e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Facebook linki</label>
            <input
              value={form.facebook_url}
              onChange={(e) => update("facebook_url", e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">TikTok linki</label>
            <input
              value={form.tiktok_url}
              onChange={(e) => update("tiktok_url", e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
            />
          </div>

          <GalleryManager businessId={business.id} />

          <div className="rounded-lg border border-line bg-offwhite p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-navy" />
              <p className="text-xs font-bold uppercase tracking-wide text-navy">
                Sahiplik Bilgisi (gizli, sadece sen görürsün)
              </p>
            </div>
            {!ownerLoaded ? (
              <p className="text-xs text-ink/40">Yükleniyor...</p>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Sahibinin adı"
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo"
                />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="Telefonu"
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo"
                  />
                  <input
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="E-postası"
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bordo"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setTier(tier === "premium" ? "basic" : "premium")}
            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold transition ${
              tier === "premium"
                ? "border-gold bg-gold/10 text-gold-dark"
                : "border-line text-ink/50 hover:bg-offwhite"
            }`}
          >
            <Star className={`h-4 w-4 ${tier === "premium" ? "fill-gold-dark" : ""}`} />
            {tier === "premium" ? "Öne Çıkan (aktif)" : "Öne Çıkar"}
          </button>

          {error && <p className="text-sm text-bordo">{error}</p>}

          <div className="mt-2 flex items-center justify-between gap-3">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-bordo hover:bg-bordo/5 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" /> {deleting ? "Siliniyor..." : "Sil"}
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink/60 hover:bg-offwhite"
              >
                Vazgeç
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-bordo px-4 py-2 text-sm font-bold text-white hover:bg-bordo-dark disabled:opacity-60"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}