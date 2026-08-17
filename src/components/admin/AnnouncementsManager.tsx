"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Trash2, Upload, ArrowUp, ArrowDown, Eye, EyeOff, Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
}

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-bordo transition-colors";
const labelClass = "mb-1.5 block text-sm font-semibold text-navy";

export default function AnnouncementsManager() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("display_order", { ascending: true });
    setItems(data ?? []);
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
    setDescription("");
    setLinkUrl("");
    setImageFile(null);
    setImagePreview(null);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Başlık zorunlu.");
      return;
    }
    setError(null);
    setUploading(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("prefix", "duyuru-");
      const res = await fetch("/api/upload-photo", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) {
        setError("Görsel yüklenemedi: " + (result.error ?? "bilinmeyen hata"));
        setUploading(false);
        return;
      }
      imageUrl = result.url;
    }

    const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order)) + 1 : 0;

    const { error: insertError } = await supabase.from("announcements").insert({
      title: title.trim(),
      description: description.trim() || null,
      image_url: imageUrl,
      link_url: linkUrl.trim() || null,
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

  async function toggleActive(item: Announcement) {
    await supabase.from("announcements").update({ is_active: !item.is_active }).eq("id", item.id);
    load();
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Bu duyuruyu silmek istediğine emin misin?");
    if (!confirmed) return;
    await supabase.from("announcements").delete().eq("id", id);
    load();
  }

  async function move(item: Announcement, direction: "up" | "down") {
    const sorted = [...items].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((i) => i.id === item.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];

    await Promise.all([
      supabase.from("announcements").update({ display_order: other.display_order }).eq("id", item.id),
      supabase.from("announcements").update({ display_order: item.display_order }).eq("id", other.id),
    ]);
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-navy">Duyurular</h2>
        <p className="text-sm text-ink/50">Anasayfadaki duyuru slider&apos;ında gösterilecek içerikleri yönet.</p>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5">
        <div>
          <label className={labelClass}>Başlık *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Örn. Yeni yıl kampanyası başladı!"
          />
        </div>
        <div>
          <label className={labelClass}>Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Bağlantı (isteğe bağlı)</label>
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className={inputClass}
            placeholder="/isletmeler ya da https://..."
          />
        </div>
        <div>
          <label className={labelClass}>Görsel</label>
          {imagePreview && (
            <div className="relative mb-2 h-32 w-full overflow-hidden rounded-xl border border-line bg-offwhite">
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
          className="rounded-xl bg-bordo px-5 py-3 text-sm font-bold text-white transition hover:bg-bordo-dark disabled:opacity-60"
        >
          {uploading ? "Yükleniyor..." : "Duyuru Ekle"}
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-ink/40">Yükleniyor...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-ink/40">Henüz duyuru yok.</p>
        ) : (
          items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-line bg-white p-3">
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
                <p className="truncate text-sm font-bold text-navy">{item.title}</p>
                {item.description && <p className="truncate text-xs text-ink/50">{item.description}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => move(item, "up")}
                  disabled={i === 0}
                  className="rounded-lg p-1.5 text-ink/40 hover:bg-offwhite disabled:opacity-30"
                  aria-label="Yukarı taşı"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => move(item, "down")}
                  disabled={i === items.length - 1}
                  className="rounded-lg p-1.5 text-ink/40 hover:bg-offwhite disabled:opacity-30"
                  aria-label="Aşağı taşı"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
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
          ))
        )}
      </div>
    </div>
  );
}