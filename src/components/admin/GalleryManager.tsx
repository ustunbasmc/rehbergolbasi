"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { BusinessPhoto } from "@/lib/types";
import { Trash2, Upload } from "lucide-react";

export default function GalleryManager({ businessId }: { businessId: string }) {
  const [photos, setPhotos] = useState<BusinessPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("business_photos")
      .select("*")
      .eq("business_id", businessId)
      .order("display_order", { ascending: true });
    setPhotos(data ?? []);
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    let nextOrder = photos.length > 0 ? Math.max(...photos.map((p) => p.display_order)) + 1 : 0;

    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("business-photos")
        .upload(filePath, file);

      if (uploadError) {
        setError("Yükleme hatası: " + uploadError.message);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from("business-photos")
        .getPublicUrl(filePath);

      await supabase.from("business_photos").insert({
        business_id: businessId,
        url: publicUrlData.publicUrl,
        display_order: nextOrder,
      });

      nextOrder++;
    }

    setUploading(false);
    loadPhotos();
  }

  async function handleDelete(photoId: string) {
    await supabase.from("business_photos").delete().eq("id", photoId);
    loadPhotos();
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-navy">Galeri Fotoğrafları</label>

      {loading ? (
        <p className="text-sm text-ink/50">Yükleniyor...</p>
      ) : (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative h-20 overflow-hidden rounded-lg bg-offwhite">
              <Image src={photo.url} alt="" fill className="object-cover" />
              <button
                onClick={() => handleDelete(photo.id)}
                className="absolute right-1 top-1 rounded-full bg-bordo p-1 text-white opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line px-3 py-2.5 text-sm font-semibold text-ink/60 hover:border-bordo hover:text-bordo">
        <Upload className="h-4 w-4" />
        {uploading ? "Yükleniyor..." : "Fotoğraf Ekle"}
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
      </label>
      {error && <p className="mt-1 text-xs text-bordo">{error}</p>}
    </div>
  );
}