-- Kart ve liste görünümlerinde gösterilecek gerçek bir "kısa açıklama" alanı.
-- Nullable: mevcut işletmeler için görüntüleme sırasında uzun açıklamadan
-- güvenli bir fallback özet üretilir (bkz. src/lib/businessDescription.ts).
-- Mevcut `description` (uzun açıklama) alanına DOKUNULMAZ.

alter table public.businesses
  add column if not exists short_description text;

-- İdeal sınır 160, sert üst sınır 180 karakter (uygulama tarafında da uygulanır).
alter table public.businesses
  add constraint businesses_short_description_length
  check (short_description is null or char_length(short_description) <= 180);
