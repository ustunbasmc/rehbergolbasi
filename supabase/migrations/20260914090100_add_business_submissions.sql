-- İşletme başvuru akışının yeniden tasarımı: /isletme-ekle artık uzun bir
-- profil formu değil, ~60 saniyelik hafif bir "başvuru" formu. Kullanıcı
-- yalnızca temel iletişim/kimlik bilgilerini gönderir; kategori, uzun
-- açıklama, SEO, etiket, özellik, SSS gibi her şeyi ekip admin panelinden
-- hazırlar.
--
-- Bunu doğrudan `businesses` tablosuna eksik/taslak kayıt olarak yazmak
-- yerine (categori zorunlu NOT NULL olduğu ve public sayfalarda göründüğü
-- için) ayrı bir `business_submissions` tablosunda tutuyoruz. Mevcut
-- `businesses`, `business_photos`, `business_owner_info` tablolarına
-- DOKUNULMAZ.

create extension if not exists pgcrypto;

create table public.business_submissions (
  -- İstemci tarafında (crypto.randomUUID) üretilir ve gönderilir; böylece
  -- INSERT sonrası RETURNING/SELECT RLS'ine ihtiyaç duymadan istemci kendi
  -- id'sini ve referans kodunu zaten bilir (anon rolüne SELECT hakkı
  -- VERİLMEZ — aşağıya bakın).
  id uuid primary key default gen_random_uuid(),

  -- Kullanıcıya gösterilen, tahmin edilmesi zor referans kodu. İstemci
  -- üretir; boş/eksik gelirse trigger güvenli bir tane üretir.
  reference_code text not null unique,

  applicant_type text not null check (applicant_type in ('owner', 'employee', 'recommendation')),

  business_name text not null check (char_length(trim(business_name)) > 0),
  applicant_name text not null check (char_length(trim(applicant_name)) > 0),

  contact_phone text not null,
  contact_phone_normalized text,
  contact_is_public boolean not null default false,
  business_phone text,

  address text,
  maps_url text,
  instagram_url text,
  website_url text,
  note text,

  kvkk_accepted boolean not null default false,

  status text not null default 'new' check (
    status in ('new', 'information_requested', 'preparing', 'pending_approval', 'published', 'rejected', 'duplicate')
  ),
  admin_note text,
  possible_duplicate boolean not null default false,

  business_id uuid references public.businesses(id) on delete set null,
  converted_at timestamptz,
  reviewed_by text,

  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  device text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- En az bir konum/kaynak bilgisi zorunlu: adres, Maps linki veya Instagram.
  constraint business_submissions_location_source_check
    check (
      coalesce(trim(address), '') <> ''
      or coalesce(trim(maps_url), '') <> ''
      or coalesce(trim(instagram_url), '') <> ''
    ),

  -- KVKK onayı olmadan başvuru kabul edilmez.
  constraint business_submissions_kvkk_check check (kvkk_accepted = true),

  -- Yönetimsel alanlar yalnızca dönüşüm tamamlandığında birlikte dolu olmalı.
  constraint business_submissions_conversion_consistency_check
    check (
      (business_id is null and converted_at is null)
      or (business_id is not null and converted_at is not null)
    )
);

create index business_submissions_status_idx on public.business_submissions (status);
create index business_submissions_created_at_idx on public.business_submissions (created_at desc);
create index business_submissions_phone_idx on public.business_submissions (contact_phone_normalized);

create table public.business_submission_photos (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.business_submissions(id) on delete cascade,
  storage_path text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index business_submission_photos_submission_idx on public.business_submission_photos (submission_id);

create table public.business_submission_status_history (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.business_submissions(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by text,
  note text,
  changed_at timestamptz not null default now()
);

create index business_submission_status_history_submission_idx
  on public.business_submission_status_history (submission_id);

-- ============================================================================
-- Trigger: normalize telefon, güvenli referans kodu üret (gerekirse),
-- basit oran sınırlama ve olası mükerrer işaretleme.
-- SECURITY DEFINER: RLS'ten bağımsız çalışır (anon INSERT ile tetiklense
-- bile, fonksiyon sahibi ayrıcalıklarıyla mevcut kayıtları karşılaştırabilir).
-- ============================================================================
create or replace function public.business_submissions_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  digits text;
  recent_count int;
  candidate text;
  tries int := 0;
begin
  -- Referans kodu boşsa (istemci üretmediyse) güvenli bir tane üret.
  if coalesce(trim(new.reference_code), '') = '' then
    loop
      candidate := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
      exit when not exists (select 1 from public.business_submissions where reference_code = candidate);
      tries := tries + 1;
      exit when tries > 8;
    end loop;
    new.reference_code := candidate;
  end if;

  -- Telefonu normalize et: yalnızca rakamlar, mümkünse 90XXXXXXXXXX (12 hane).
  digits := regexp_replace(coalesce(new.contact_phone, ''), '\D', '', 'g');
  if length(digits) = 10 then
    digits := '90' || digits;
  elsif length(digits) = 11 and left(digits, 1) = '0' then
    digits := '90' || substr(digits, 2);
  end if;
  new.contact_phone_normalized := digits;

  -- Basit oran sınırlama: aynı normalize numaradan 30 dakikada 3'ten fazla
  -- başvuru varsa reddet. Gerçek kullanıcıyı değil, otomatik kötüye
  -- kullanımı hedefler.
  if new.contact_phone_normalized <> '' then
    select count(*) into recent_count
      from public.business_submissions
      where contact_phone_normalized = new.contact_phone_normalized
        and created_at > now() - interval '30 minutes';
    if recent_count >= 3 then
      raise exception 'RATE_LIMITED: çok sık başvuru' using errcode = 'P0001';
    end if;
  end if;

  -- Olası mükerrer: aynı normalize telefonla önceki bir başvuru ya da
  -- mevcut bir işletme var mı? Yalnızca İŞARETLER, asla engellemez/silmez.
  if new.contact_phone_normalized <> '' and (
    exists (
      select 1 from public.business_submissions
      where contact_phone_normalized = new.contact_phone_normalized
    )
    or exists (
      select 1 from public.businesses
      where length(new.contact_phone_normalized) >= 10
        and (
          regexp_replace(coalesce(phone, ''), '\D', '', 'g') like '%' || right(new.contact_phone_normalized, 10)
          or regexp_replace(coalesce(whatsapp, ''), '\D', '', 'g') like '%' || right(new.contact_phone_normalized, 10)
        )
    )
  ) then
    new.possible_duplicate := true;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_business_submissions_before_insert
  before insert on public.business_submissions
  for each row execute function public.business_submissions_before_insert();

-- Durum geçmişi: her status değişikliğinde otomatik kayıt.
create or replace function public.business_submissions_log_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.business_submission_status_history
      (submission_id, old_status, new_status, changed_by, note)
    values
      (new.id, old.status, new.status, new.reviewed_by, new.admin_note);
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_business_submissions_log_status
  before update on public.business_submissions
  for each row execute function public.business_submissions_log_status_change();

-- Fotoğraf başına en fazla 5 dosya sınırı (istemci tarafında da uygulanır,
-- burada ikinci bir güvenlik katmanı olarak DB seviyesinde de zorlanır).
create or replace function public.business_submission_photos_limit_check()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  photo_count int;
begin
  select count(*) into photo_count
    from public.business_submission_photos
    where submission_id = new.submission_id;
  if photo_count >= 5 then
    raise exception 'PHOTO_LIMIT: en fazla 5 fotoğraf yüklenebilir' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger trg_business_submission_photos_limit
  before insert on public.business_submission_photos
  for each row execute function public.business_submission_photos_limit_check();

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.business_submissions enable row level security;
alter table public.business_submission_photos enable row level security;
alter table public.business_submission_status_history enable row level security;

-- Herkes başvuru gönderebilir — ama yalnızca yönetimsel alanlar güvenli
-- varsayılanlarındayken. `status`/`business_id`/`converted_at`/`admin_note`/
-- `reviewed_by`/`possible_duplicate` istemciden farklı bir değerle
-- gönderilirse INSERT tamamen reddedilir.
create policy "public can submit business application"
  on public.business_submissions
  for insert
  to anon, authenticated
  with check (
    status = 'new'
    and business_id is null
    and converted_at is null
    and admin_note is null
    and reviewed_by is null
    and possible_duplicate = false
  );

-- Public hiçbir başvuruyu okuyamaz/güncelleyemez/silemez. Bu depodaki
-- mevcut admin panelinin tamamı, girişli (authenticated) Supabase Auth
-- oturumunu "admin" olarak kabul eden aynı modele dayanır (ör.
-- EditBusinessModal, PendingList) — burada da aynı model kullanılıyor.
create policy "admin can view submissions"
  on public.business_submissions
  for select
  to authenticated
  using (true);

create policy "admin can update submissions"
  on public.business_submissions
  for update
  to authenticated
  using (true)
  with check (true);

-- Fotoğraflar: public yalnızca ekleyebilir (kendi başvurusuna, id tahmin
-- edilemez bir UUID olduğu için pratikte güvenli — mevcut `business_photos`
-- tablosundaki aynı güven modeliyle tutarlı). Okuma/silme yalnızca admin.
create policy "public can attach submission photos"
  on public.business_submission_photos
  for insert
  to anon, authenticated
  with check (true);

create policy "admin can view submission photos"
  on public.business_submission_photos
  for select
  to authenticated
  using (true);

create policy "admin can delete submission photos"
  on public.business_submission_photos
  for delete
  to authenticated
  using (true);

create policy "admin can view submission history"
  on public.business_submission_status_history
  for select
  to authenticated
  using (true);
