-- Doğrulama durumlarını ayırmak için: bir işletmenin "doğrulanmamış",
-- "iletişim/adres bilgisi ekip tarafından kontrol edilmiş" ve "işletme sahibi
-- tarafından doğrulanmış" durumları birbirinden farklıdır ve site genelinde
-- karıştırılmamalıdır.
--
-- Güvenli varsayılan: mevcut tüm kayıtlar hangi durumun doğru olduğunu
-- KANITLAMADIĞI için, hepsi en düşük güven seviyesi olan 'unverified' ile
-- başlar. Hiçbir mevcut kayıt otomatik olarak 'owner_verified' yapılmaz.

alter table public.businesses
  add column if not exists verification_status text not null default 'unverified';

alter table public.businesses
  add constraint businesses_verification_status_check
  check (verification_status in ('unverified', 'info_checked', 'owner_verified'));

-- Hafif denetim izi: admin panelinden durum her değiştiğinde bu iki alan
-- güncellenir. Ayrı bir audit tablosu yerine bilinçli olarak bu şekilde
-- tutuluyor çünkü mevcut "businesses" tablosunun admin-only UPDATE RLS
-- politikası bu repoda bulunmuyor (bkz. supabase/migrations/README.md) ve
-- yeni bir tabloya aynı politikayı körü körüne kopyalamak riskli olurdu.
alter table public.businesses
  add column if not exists verification_updated_at timestamptz;

alter table public.businesses
  add column if not exists verification_updated_by text;
