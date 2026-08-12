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
    console.log(`[upload-photo] Girdi: ${file.name}, ${inputBuffer.length} bayt, tip: ${file.type}`);

    if (inputBuffer.length === 0) {
      console.error("[upload-photo] Girdi buffer boş — dosya tarayıcıdan hiç ulaşmamış olabilir.");
      return NextResponse.json({ error: "Dosya içeriği boş geldi" }, { status: 400 });
    }

    const outputBuffer = await sharp(inputBuffer)
      .rotate() // EXIF yönlendirmesini uygula (telefon fotoğrafları yatarak gelmesin)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    console.log(`[upload-photo] sharp çıktısı: ${outputBuffer.length} bayt`);

    if (outputBuffer.length === 0) {
      console.error("[upload-photo] sharp çıktısı boş — sharp hata fırlatmadan boş buffer üretti.");
      return NextResponse.json({ error: "Görsel işlenemedi (boş çıktı)" }, { status: 500 });
    }

    // sharp'ın ürettiği çıktının GERÇEKTEN geçerli bir görsel olduğunu
    // upload etmeden önce kendi kendine doğrula — bozuk dosyayı sessizce
    // storage'a yazıp "başarılı" dönmek yerine burada yakala.
    try {
      const verifyMeta = await sharp(outputBuffer).metadata();
      console.log(`[upload-photo] doğrulama OK: ${verifyMeta.width}x${verifyMeta.height} ${verifyMeta.format}`);
    } catch (verifyErr) {
      console.error("[upload-photo] Üretilen görsel geçersiz çıktı, upload iptal:", verifyErr);
      return NextResponse.json({ error: "İşlenen görsel doğrulanamadı" }, { status: 500 });
    }

    // Ham Buffer yerine Blob kullanıyoruz — bazı ortamlarda fetch/undici
    // Buffer'ın Content-Length'ini doğru hesaplamayıp Supabase'e eksik/
    // bozuk veri gönderebiliyor. Blob, boyut ve tipi açıkça taşır.
    const blob = new Blob([outputBuffer], { type: "image/webp" });

    const filePath = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

    const { error: uploadError } = await supabase.storage
      .from("business-photos")
      .upload(filePath, blob, {
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

    // Upload sonrası dosyayı geri indirip gerçekten sağlam yazıldığını
    // teyit et — bu, "upload hatasız döndü ama dosya bozuk" ihtimalini
    // (tam da yaşadığımız sorunu) kesin olarak loglar.
    try {
      const verifyRes = await fetch(publicUrlData.publicUrl, { cache: "no-store" });
      const verifyBytes = verifyRes.ok ? (await verifyRes.arrayBuffer()).byteLength : -1;
      console.log(
        `[upload-photo] storage'dan geri okuma: status=${verifyRes.status} bayt=${verifyBytes} (beklenen ${outputBuffer.length})`
      );
      if (!verifyRes.ok || verifyBytes !== outputBuffer.length) {
        console.error("[upload-photo] UYARI: storage'a yazılan dosya beklenen boyutta değil!");
      }
    } catch (fetchBackErr) {
      console.error("[upload-photo] Yükleme sonrası doğrulama isteği başarısız:", fetchBackErr);
    }

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error("[upload-photo] Beklenmeyen hata:", err);
    return NextResponse.json({ error: "Görsel işlenemedi" }, { status: 500 });
  }
}