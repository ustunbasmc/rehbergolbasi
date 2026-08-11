import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

// Her yüklenen görsel, formatı/boyutu ne olursa olsun burada
// max 1920px genişlik + WebP + %80 kaliteye sıkıştırılır, sonra
// Supabase Storage'a yazılır. Bu, hem Vercel'in görsel dönüştürme
// kotasını (402 hatası) hem de büyük dosya boyutu sorununu ortadan kaldırır.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const prefix = (formData.get("prefix") as string | null) ?? "";

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const outputBuffer = await sharp(inputBuffer)
      .rotate() // EXIF yönlendirmesini uygula (telefon fotoğrafları yatarak gelmesin)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const filePath = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

    const { error: uploadError } = await supabase.storage
      .from("business-photos")
      .upload(filePath, outputBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError) {
      console.error("[upload-photo] Supabase upload hatası:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from("business-photos")
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error("[upload-photo] Beklenmeyen hata:", err);
    return NextResponse.json({ error: "Görsel işlenemedi" }, { status: 500 });
  }
}