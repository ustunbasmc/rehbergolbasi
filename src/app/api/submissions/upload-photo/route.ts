import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function randomFileName(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.webp`;
}

/**
 * Başvuru fotoğraflarını private "business-submission-photos" bucket'ına
 * yükler. /api/upload-photo ile aynı sharp tabanlı doğrulama/sıkıştırma
 * desenini kullanır, ama:
 *  - herkese açık bucket yerine PRIVATE bucket'a yazar,
 *  - dosya türünü yalnızca MIME'dan değil, sharp'ın gerçekten
 *    decode edebildiğinden (dosya içeriği) de doğrular,
 *  - başvuru başına en fazla 5 fotoğraf sınırını DB trigger'ı zaten
 *    zorluyor (business_submission_photos_limit_check).
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const submissionId = formData.get("submissionId") as string | null;

    if (!submissionId || !UUID_RE.test(submissionId)) {
      return NextResponse.json({ error: "Geçersiz başvuru kimliği" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Yalnızca JPG, PNG veya WebP görselleri kabul edilir" },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Dosya çok büyük (maksimum 5 MB)" }, { status: 413 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    if (inputBuffer.length === 0) {
      return NextResponse.json({ error: "Dosya içeriği boş geldi" }, { status: 400 });
    }

    // Dosya içeriğinin gerçekten bir görsel olduğunu doğrula (uzantı/MIME
    // sahte olsa bile sharp decode edemeyen bir dosyayı burada eler) ve
    // EXIF/GPS gibi meta verileri temizleyerek yeniden kodla.
    let outputBuffer: Buffer;
    try {
      outputBuffer = await sharp(inputBuffer)
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
    } catch {
      return NextResponse.json({ error: "Geçersiz veya bozuk görsel dosyası" }, { status: 400 });
    }

    if (outputBuffer.length === 0) {
      return NextResponse.json({ error: "Görsel işlenemedi" }, { status: 500 });
    }

    const filePath = `submissions/${submissionId}/${randomFileName()}`;
    const blob = new Blob([new Uint8Array(outputBuffer)], { type: "image/webp" });

    const { error: uploadError } = await supabase.storage
      .from("business-submission-photos")
      .upload(filePath, blob, { contentType: "image/webp", upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: "Yükleme başarısız oldu" }, { status: 500 });
    }

    const { error: insertError } = await supabase.from("business_submission_photos").insert({
      submission_id: submissionId,
      storage_path: filePath,
    });

    if (insertError) {
      // Kayıt eklenemedi (ör. 5 fotoğraf sınırı aşıldı) — yetim dosya
      // bırakmamak için storage'dan da geri al.
      await supabase.storage.from("business-submission-photos").remove([filePath]);
      const message = insertError.message?.includes("PHOTO_LIMIT")
        ? "En fazla 5 fotoğraf yükleyebilirsiniz"
        : "Fotoğraf kaydedilemedi";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, path: filePath });
  } catch {
    return NextResponse.json({ error: "Görsel işlenemedi" }, { status: 500 });
  }
}
