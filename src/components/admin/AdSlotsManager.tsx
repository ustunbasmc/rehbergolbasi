"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Trash2, Upload, Eye, EyeOff, Megaphone, MousePointerClick, Wallet } from "lucide-react";
import { AD_PLACEMENTS, formatAdPrice, type AdPlacementKey } from "@/lib/adPlacements";

type Placement = AdPlacementKey;

const PLACEMENT_LABELS: Record<Placement, string> = Object.fromEntries(
  AD_PLACEMENTS.map((p) => [p.key, `${p.label} (${p.pageLabel})`])
) as Record<Placement, string>;

const PLACEMENT_PRICES: Record<Placement, number> = Object.fromEntries(
  AD_PLACEMENTS.map((p) => [p.key, p.priceMonthly])
) as Record<Placement, number>;

const PLACEMENT_IMAGE_SIZES: Record<Placement, string> = Object.fromEntries(
  AD_PLACEMENTS.map((p) => [p.key, p.imageSize])
) as Record<Placement, string>;

interface AdSlot {
  id: string;
  title: string;
  advertiser_name: string | null;
  image_url: string | null;
  link_url: string;
  placement: Placement;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  display_order: number;
  impression_count: number;
  click_count: number;
  price_monthly: number | null;
}

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-bordo transition-colors";
const labelClass = "mb-1.5 block text-sm font-semibold text-navy";

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

function statusOf(ad: AdSlot): { label: string; color: string } {
  if (!ad.is_active) return { label: "Pasif", color: "bg-ink/10 text-ink/50" };
  const now = Date.now();
  const starts = new Date(ad.starts_at).getTime();
  const ends = new Date(ad.ends_at).getTime();
  if (now < starts) return { label: "Zamanlanmış", color: "bg-gold/15 text-gold-dark" };
  if (now > ends) return { label: "Süresi Doldu", color: "bg-bordo/10 text-bordo" };
  return { label: "Aktif", color: "bg-green-500/10 text-green-600" };
}

export default function AdSlotsManager() {
  const [items, setItems] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [advertiserName, setAdvertiserName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [placement, setPlacement] = useState<Placement>("gundem_detail");
  const [priceMonthly, setPriceMonthly] = useState<string>(String(PLACEMENT_PRICES.gundem_detail));
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(new Date().toISOString()));
  const [endsAt, setEndsAt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ad_slots")
      .select("*")
      .order("starts_at", { ascending: false });
    setItems((data as AdSlot[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleImageChange(file: File | null) {
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function resetForm() {
    setTitle("");
    setAdvertiserName("");
    setLinkUrl("");
    setPriceMonthly(String(PLACEMENT_PRICES[placement]));
    setStartsAt(toDatetimeLocal(new Date().toISOString()));
    setEndsAt("");
    setImageFile(null);
    setImagePreview(null);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !linkUrl.trim()) {
      setError("Başlık ve bağlantı zorunlu.");
      return;
    }
    const startsIso = fromDatetimeLocal(startsAt);
    const endsIso = fromDatetimeLocal(endsAt);
    if (!startsIso || !endsIso) {
      setError("Başlangıç ve bitiş tarihi zorunlu.");
      return;
    }
    if (new Date(endsIso) <= new Date(startsIso)) {
      setError("Bitiş tarihi başlangıçtan sonra olmalı.");
      return;
    }

    setError(null);
    setUploading(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("prefix", "reklam-");
      const res = await fetch("/api/upload-photo", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) {
        setError("Görsel yüklenemedi: " + (result.error ?? "bilinmeyen hata"));
        setUploading(false);
        return;
      }
      imageUrl = result.url;
    }

    const samePlacement = items.filter((i) => i.placement === placement);
    const nextOrder =
      samePlacement.length > 0 ? Math.max(...samePlacement.map((i) => i.display_order)) + 1 : 0;

    const { error: insertError } = await supabase.from("ad_slots").insert({
      title: title.trim(),
      advertiser_name: advertiserName.trim() || null,
      image_url: imageUrl,
      link_url: linkUrl.trim(),
      placement,
      price_monthly: priceMonthly.trim() ? Number(priceMonthly) : null,
      starts_at: startsIso,
      ends_at: endsIso,
      is_active: true,
      display_order: nextOrder,
    });

    setUploading(false);

    if (insertError) {
      setError("Kaydedilemedi: " + insertError.message);
      return;
    }

    resetForm();
    load();
  }

  async function toggleActive(item: AdSlot) {
    await supabase.from("ad_slots").update({ is_active: !item.is_active }).eq("id", item.id);
    load();
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Bu reklamı silmek istediğine emin misin?");
    if (!confirmed) return;
    await supabase.from("ad_slots").delete().eq("id", id);
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-navy">Reklamlar</h2>
        <p className="text-sm text-ink/50">
          Gündem, işletme detayı, taksi ve diğer sayfalardaki reklam alanlarını süreli olarak yönet.
        </p>
      </div>

      <div className="card-shadow rounded-2xl bg-white p-5">
        <div className="mb-3 flex items-center gap-1.5">
          <Wallet className="h-4 w-4 text-bordo" />
          <h3 className="font-display text-base font-bold text-navy">Fiyat Referansı (Aylık)</h3>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {AD_PLACEMENTS.map((p) => (
            <div key={p.key} className="flex flex-col gap-0.5 rounded-lg bg-offwhite px-3 py-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink/70">{p.label}</span>
                <span className="font-bold text-navy">{formatAdPrice(p.priceMonthly)}</span>
              </div>
              <span className="text-[11px] text-ink/40">{p.imageSize}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleAdd} className="card-shadow flex flex-col gap-4 rounded-2xl bg-white p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Başlık *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Örn. Espri Kuaför - Ekim Kampanyası"
            />
          </div>
          <div>
            <label className={labelClass}>Reklamveren (yalnızca admin görür)</label>
            <input
              value={advertiserName}
              onChange={(e) => setAdvertiserName(e.target.value)}
              className={inputClass}
              placeholder="Örn. Espri Kuaför"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Bağlantı *</label>
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className={inputClass}
            placeholder="/isletme/espri-kuafor ya da https://..."
          />
        </div>

        <div>
          <label className={labelClass}>Yerleşim *</label>
          <select
            value={placement}
            onChange={(e) => {
              const next = e.target.value as Placement;
              setPlacement(next);
              setPriceMonthly(String(PLACEMENT_PRICES[next]));
            }}
            className={inputClass}
          >
            {Object.entries(PLACEMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Aylık Ücret (TL) — referans, düzenlenebilir</label>
          <input
            type="number"
            min={0}
            value={priceMonthly}
            onChange={(e) => setPriceMonthly(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Başlangıç *</label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Bitiş *</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            Görsel <span className="font-normal text-ink/40">— önerilen boyut: {PLACEMENT_IMAGE_SIZES[placement]}</span>
          </label>
          {imagePreview && (
            <div className="relative mb-2 h-32 w-full overflow-hidden rounded-xl bg-offwhite">
              <Image src={imagePreview} alt="Önizleme" fill unoptimized className="object-cover" />
            </div>
          )}
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line px-3 py-2.5 text-sm font-semibold text-ink/60 hover:border-bordo hover:text-bordo">
            <Upload className="h-4 w-4" /> Görsel Seç
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </div>

        {error && <p className="text-sm text-bordo">{error}</p>}

        <button
          type="submit"
          disabled={uploading}
          className="rounded-xl bg-gradient-to-r from-bordo to-bordo-dark px-5 py-3 text-sm font-bold text-white transition hover:shadow-lg disabled:opacity-60"
        >
          {uploading ? "Yükleniyor..." : "Reklam Ekle"}
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-ink/40">Yükleniyor...</p>
        ) : items.length === 0 ? (
          <div className="card-shadow rounded-2xl bg-white p-10 text-center text-ink/60">
            Henüz reklam eklenmemiş.
          </div>
        ) : (
          items.map((item) => {
            const status = statusOf(item);
            return (
              <div key={item.id} className="card-shadow flex items-center gap-3 rounded-xl bg-white p-3">
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-offwhite">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.title} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Megaphone className="h-5 w-5 text-ink/20" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="truncate text-[11px] text-ink/40">
                      {PLACEMENT_LABELS[item.placement]} · {PLACEMENT_IMAGE_SIZES[item.placement]}
                    </span>
                  </div>
                  <p className="truncate text-sm font-bold text-navy">{item.title}</p>
                  <div className="flex items-center gap-3 text-[11px] text-ink/50">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {item.impression_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointerClick className="h-3 w-3" /> {item.click_count}
                    </span>
                    {item.price_monthly != null && (
                      <span className="flex items-center gap-1 font-semibold text-navy">
                        <Wallet className="h-3 w-3" /> {formatAdPrice(item.price_monthly)}/ay
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => toggleActive(item)}
                    className="rounded-lg p-1.5 text-ink/40 hover:bg-offwhite"
                    title={item.is_active ? "Yayından kaldır" : "Yayınla"}
                  >
                    {item.is_active ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg p-1.5 text-bordo hover:bg-bordo/5"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
