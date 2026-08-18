// Tek seferlik migration: Storage'daki tüm eski (sıkıştırılmamış) görselleri
// sharp ile max 1920px + WebP + %80 kaliteye çevirir, veritabanındaki
// URL'leri günceller. /api/upload-photo eklenmeden önce yüklenmiş tüm
// fotoğraflar için gerekli — onlar hâlâ ham/büyük boyutta duruyor.
//
// Çalıştırma (proje kök dizininde):
//   node --env-file=.env.local scripts/backfill-images.mjs
//
// Gereken ortam değişkenleri:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY  (Supabase Dashboard → Settings → API → service_role)
//   Not: service_role anahtarı RLS'i bypass eder, sadece bu script gibi
//   güvenli/lokal ortamlarda kullanılmalı, asla client tarafına eklenmemeli.

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Eksik ortam değişkeni. NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const BUCKET = "business-photos";
const STORAGE_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

let processed = 0;
let skipped = 0;
let failed = 0;

function alreadyOptimized(url) {
  return (
    url.includes("/backfill-") ||
    url.includes("/gallery-") ||
    url.includes("covers/") ||
    url.includes("/duyuru-")
  );
}

async function compressAndReupload(url) {
  if (!url || !url.startsWith(STORAGE_PREFIX)) return null;
  if (alreadyOptimized(url)) return null;

  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  ⚠ indirilemedi (${res.status}): ${url}`);
    failed++;
    return null;
  }

  const inputBuffer = Buffer.from(await res.arrayBuffer());
  const originalKB = Math.round(inputBuffer.length / 1024);

  let outputBuffer;
  try {
    outputBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (err) {
    console.warn(`  ⚠ sharp işleyemedi (muhtemelen bozuk kaynak dosya): ${err.message}`);
    failed++;
    return null;
  }

  const newKB = Math.round(outputBuffer.length / 1024);
  const newPath = `backfill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

  // Ham Buffer yerine Blob — Supabase'e bazı ortamlarda eksik/bozuk
  // dosya yazılmasına sebep olan sorunun düzeltmesi.
  const blob = new Blob([outputBuffer], { type: "image/webp" });

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(newPath, blob, { contentType: "image/webp" });

  if (uploadError) {
    console.warn(`  ⚠ yüklenemedi: ${uploadError.message}`);
    failed++;
    return null;
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(newPath);
  console.log(`  ✓ ${originalKB}KB → ${newKB}KB`);
  processed++;
  return publicUrlData.publicUrl;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function migrateCoverImages() {
  console.log("\n--- businesses.cover_image_url ---");
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, cover_image_url")
    .not("cover_image_url", "is", null);

  if (error) {
    console.error("businesses okunamadı:", error.message);
    return;
  }

  for (const b of businesses) {
    if (!b.cover_image_url || alreadyOptimized(b.cover_image_url)) {
      skipped++;
      continue;
    }
    console.log(`${b.name} (${b.id})`);
    const newUrl = await compressAndReupload(b.cover_image_url);
    if (newUrl) {
      await supabase.from("businesses").update({ cover_image_url: newUrl }).eq("id", b.id);
    }
    await sleep(200);
  }
}

async function migrateGalleryPhotos() {
  console.log("\n--- business_photos.url ---");
  const { data: photos, error } = await supabase.from("business_photos").select("id, url");

  if (error) {
    console.error("business_photos okunamadı:", error.message);
    return;
  }

  for (const p of photos) {
    if (!p.url || alreadyOptimized(p.url)) {
      skipped++;
      continue;
    }
    console.log(`fotoğraf ${p.id}`);
    const newUrl = await compressAndReupload(p.url);
    if (newUrl) {
      await supabase.from("business_photos").update({ url: newUrl }).eq("id", p.id);
    }
    await sleep(200);
  }
}

async function migrateMenuImages() {
  console.log("\n--- business_menu_items.url (sadece file_type = image) ---");
  const { data: items, error } = await supabase
    .from("business_menu_items")
    .select("id, url, file_type")
    .eq("file_type", "image");

  if (error) {
    console.error("business_menu_items okunamadı:", error.message);
    return;
  }

  for (const m of items) {
    if (!m.url || alreadyOptimized(m.url)) {
      skipped++;
      continue;
    }
    console.log(`menü görseli ${m.id}`);
    const newUrl = await compressAndReupload(m.url);
    if (newUrl) {
      await supabase.from("business_menu_items").update({ url: newUrl }).eq("id", m.id);
    }
    await sleep(200);
  }
}

async function main() {
  console.log("Görsel sıkıştırma migration'ı başlıyor...");
  await migrateCoverImages();
  await migrateGalleryPhotos();
  await migrateMenuImages();
  console.log(`\nBitti. İşlenen: ${processed}, atlanan (zaten optimize): ${skipped}, hata: ${failed}`);
  console.log("\nNot: Eski dosyalar Storage'dan otomatik silinmedi (veri kaybı riskine karşı).");
  console.log("Birkaç gün sorun çıkmadığını doğruladıktan sonra Supabase Storage'da");
  console.log("isimleri 'backfill-', 'gallery-', 'covers/' ve 'duyuru-' ile BAŞLAMAYAN");
  console.log("eski dosyaları elle silebilirsin.");
}

main();
