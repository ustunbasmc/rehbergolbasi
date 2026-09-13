-- Form huni analitiği (business_form_view/start/submit/... vb.) için,
-- kişisel veri İÇERMEYEN güvenli ek bağlam (başvuru türü, cihaz, form
-- süresi, fotoğraf eklenip eklenmediği, hata kategorisi, terk edilen alan,
-- UTM kaynağı). Var olan `business_events` tablosunun üzerine eklenir,
-- ayrı/paralel bir analytics tablosu oluşturulmaz. Nullable, geriye dönük
-- uyumlu; mevcut satırlar/sorgular etkilenmez.

alter table public.business_events
  add column if not exists meta jsonb;
