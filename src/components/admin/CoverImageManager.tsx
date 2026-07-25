"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Upload, Trash2 } from "lucide-react";

export default function CoverImageManager({
  businessId,
  currentUrl,
  onUpdated,
}: {
  businessId: string;
  currentUrl: string | null;
  onUpdated: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    const file = files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `covers/${businessId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("business-photos")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError("Yükleme hatası: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("business-photos")
      .getPublicUrl(filePath);

    const newUrl = publicUrlData.publicUrl;

    await supabase
      .from("businesses")
      .update({ cover_image_url: newUrl })
      .eq("id", businessId);

    onUpdated(newUrl);
    setUploading(false);
  }

  async function handleRemove() {
    const confirmed = window.confirm("Kapak görselini kaldırmak istediğine emin misin?");
    if (!confirmed) return;

    await supabase
      .from("businesses")
      .update({ cover_image_url: null })
      .eq("id", businessId);

    onUpdated(null);
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-navy">Kapak Görseli</label>

      {currentUrl ? (
        <div className="group relative mb-2 h-40 w-full overflow-hidden rounded-xl bg-offwhite">
          <Image src={currentUrl} alt="Kapak görseli" fill className="object-cover" />
          <button
            onClick={handleRemove}
            className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-bordo px-2.5 py-1.5 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" /> Kaldır
          </button>
        </div>
      ) : (
        <div className="mb-2 flex h-24 items-center justify-center rounded-xl border border-dashed border-line bg-offwhite text-xs text-ink/40">
          Kapak görseli yok
        </div>
      )}

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line px-3 py-2.5 text-sm font-semibold text-ink/60 hover:border-bordo hover:text-bordo">
        <Upload className="h-4 w-4" />
        {uploading ? "Yükleniyor..." : currentUrl ? "Görseli Değiştir" : "Görsel Yükle"}
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
      </label>

      {error && <p className="mt-1 text-xs text-bordo">{error}</p>}
    </div>
  );
}