-- "Taksi Çağır" modülü (/taksi). Taksi durakları için ikinci/bağımsız bir
-- veri kaynağı OLUŞTURULMAZ — mevcut "Taksi Durağı" kategorisi (slug:
-- taksi-duragi) zaten güvenilir ve %100 doğru bir sınıflandırma sağlıyor
-- (doğrulandı: bu kategorideki 4 işletmenin hepsi gerçek taksi durağı,
-- kategori dışında isim bazlı yanlış eşleşme yok). Bu yüzden ayrı bir
-- `is_taxi_service` alanı eklenmedi; "taksi mi" sorusu her zaman
-- `category_id` üzerinden (taksi-duragi kategorisi ve varsa alt
-- kategorileri) sorgu zamanında belirlenir.
--
-- Burada eklenenler yalnızca OPERASYONEL/GÖRÜNÜRLÜK alanları — kategori
-- sınıflandırmasının kapsamadığı, admin tarafından elle onaylanması
-- gereken bilgiler.

alter table public.businesses
  add column if not exists taxi_page_visible boolean not null default true;

alter table public.businesses
  add column if not exists taxi_service_24_7 boolean not null default false;

alter table public.businesses
  add column if not exists taxi_temporarily_unavailable boolean not null default false;

alter table public.businesses
  add column if not exists taxi_phone_verified_at timestamptz;

comment on column public.businesses.taxi_page_visible is
  '/taksi sayfasında gösterilsin mi. Varsayılan true: Taksi Durağı kategorisine eklenen bir işletme otomatik görünür; admin sorunlu bir kaydı burada gizleyebilir.';
comment on column public.businesses.taxi_service_24_7 is
  '7/24 hizmet iddiası yalnızca admin açıkça onayladıysa true olur. Açıklama metninden veya etiketlerden ASLA otomatik çıkarılmaz.';
comment on column public.businesses.taxi_phone_verified_at is
  'Telefon numarasının admin tarafından en son ne zaman arandığı/doğrulandığı. NULL = hiç doğrulanmadı.';

-- Koordinat alanları zaten mevcut (lat, lng) — yalnızca geçerli aralık
-- garantisi ekleniyor. Mevcut satırlarda (Gölbaşı/Ankara civarı) bu aralığı
-- aşan bir değer olması beklenmez; varsa migration bunu bilinçli olarak
-- görünür kılıp durduracaktır (sessizce yutmak yerine).
alter table public.businesses
  add constraint businesses_lat_range_check check (lat is null or (lat >= -90 and lat <= 90));

alter table public.businesses
  add constraint businesses_lng_range_check check (lng is null or (lng >= -180 and lng <= 180));

-- /taksi sayfasının ana sorgusunu (status=approved, is_active=true,
-- taxi_page_visible=true) hızlandıran hafif kısmi indeks. Veri hacmi çok
-- küçük olduğundan (şu an 4 kayıt) burada fazladan indeks eklenmedi.
create index if not exists businesses_taxi_visible_idx
  on public.businesses (status, is_active)
  where taxi_page_visible = true;

-- Bir işletmenin kendi mahallesi dışında hizmet verdiği ek mahalleler.
-- Mevcut `businesses.neighborhood` serbest metin alanı işletmenin KENDİ
-- konumunu ifade eder; bu tablo ek hizmet alanlarını normalize bir
-- ilişki olarak tutar (kontrolsüz dizi/serbest metin yerine).
create table public.business_service_areas (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  neighborhood text not null check (char_length(trim(neighborhood)) > 0),
  created_at timestamptz not null default now(),
  unique (business_id, neighborhood)
);

create index business_service_areas_business_idx on public.business_service_areas (business_id);
create index business_service_areas_neighborhood_idx on public.business_service_areas (neighborhood);

alter table public.business_service_areas enable row level security;

-- Hizmet alanı bilgisi hassas değildir — mevcut business_photos/
-- business_features gibi genel görüntüleme tablolarıyla aynı model:
-- herkes okuyabilir, yalnızca admin (authenticated) yazabilir.
create policy "public can view service areas"
  on public.business_service_areas
  for select
  to anon, authenticated
  using (true);

create policy "admin can manage service areas"
  on public.business_service_areas
  for all
  to authenticated
  using (true)
  with check (true);
