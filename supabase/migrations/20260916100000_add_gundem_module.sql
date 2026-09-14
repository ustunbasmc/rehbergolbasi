-- "Gölbaşı Gündem" modülü (/gundem, /gundem/[slug]).
--
-- Mevcut `guides` (rehberler) tablosu farklı bir amaca hizmet ediyor (uzun
-- ömürlü, editoryal rehber içerikleri) ve günlük 1-2 haber/duyuru akışının
-- ihtiyaç duyduğu durum makinesini (taslak/zamanlanmış/yayında/arşiv),
-- kaynak/doğruluk alanlarını, düzeltme geçmişini, son dakika ve sponsorlu
-- içerik alanlarını desteklemiyor. Bu yüzden ayrı ve açık isimlendirilmiş
-- `gundem_*` tabloları oluşturuluyor — mevcut `businesses`, `categories`,
-- `tags`, `guides`, `announcements`, `listing_reports` tablolarına
-- DOKUNULMUYOR. Etiketleme için YENİ bir etiket sistemi kurulmuyor; mevcut
-- `tags` tablosu bir junction (`gundem_post_tags`) üzerinden yeniden
-- kullanılıyor. İlişkili işletmeler için de mevcut `businesses` tablosu
-- bir junction (`gundem_post_businesses`) ile referans alınıyor.
--
-- Admin yetkilendirme modeli bu depodaki her tabloyla birebir aynı: ayrı bir
-- `admin_users` tablosu yok, "admin" = başarıyla giriş yapmış herhangi bir
-- Supabase Auth (authenticated) kullanıcısı. Bu yüzden yazma politikaları
-- `to authenticated using (true) with check (true)` şeklinde, tıpkı
-- `business_submissions`, `business_service_areas` vb. tablolarda olduğu gibi.

-- ============================================================================
-- 1) Kategoriler
-- ============================================================================
create table public.gundem_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  slug text not null unique check (char_length(trim(slug)) > 0),
  description text,
  color text,
  display_order int not null default 0,
  is_active boolean not null default true,
  seo_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Aynı ada (büyük/küçük harf farkı olsa da) sahip mükerrer kategori
-- oluşmasını engeller; slug zaten yukarıda unique.
create unique index gundem_categories_name_lower_idx on public.gundem_categories (lower(name));
create index gundem_categories_display_order_idx on public.gundem_categories (display_order);

create or replace function public.gundem_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_gundem_categories_touch
  before update on public.gundem_categories
  for each row execute function public.gundem_touch_updated_at();

-- Başlangıç kategorileri — idempotent seed (slug üzerinden çakışırsa
-- hiçbir şey yapmaz, tekrar çalıştırılması güvenlidir, mevcut kategori
-- verisini asla silmez/değiştirmez).
insert into public.gundem_categories (name, slug, description, color, display_order)
values
  ('Gündem', 'gundem', 'Gölbaşı''dan genel gündem haberleri.', 'navy', 10),
  ('Belediye', 'belediye', 'Belediye ve resmî kurum açıklamaları.', 'bordo', 20),
  ('Trafik & Ulaşım', 'trafik-ulasim', 'Trafik, ulaşım ve yol çalışması gelişmeleri.', 'gold', 30),
  ('Yaşam', 'yasam', 'Gölbaşı''da yerel yaşamdan haberler.', 'navy', 40),
  ('Etkinlik', 'etkinlik', 'Gölbaşı''ndaki etkinlik duyuruları.', 'bordo', 50),
  ('Esnaf', 'esnaf', 'Esnaf ve yerel ekonomiden gelişmeler.', 'gold', 60),
  ('Duyurular', 'duyurular', 'Resmî duyurular, kesintiler, sosyal destek ve taziye duyuruları.', 'navy', 70)
on conflict (slug) do nothing;

-- ============================================================================
-- 2) Haber/gündem içerikleri
-- ============================================================================
create table public.gundem_posts (
  id uuid primary key default gen_random_uuid(),

  title text not null check (char_length(trim(title)) > 0),
  slug text not null unique check (char_length(trim(slug)) > 0),
  summary text not null check (char_length(trim(summary)) > 0),

  -- İçerik editörden Markdown olarak gelir; `content_html` kaydetme anında
  -- (marked + DOMPurify ile) üretilip sanitize edilmiş HALİYLE önbelleğe
  -- alınır. Public render aşamasında yine sanitize edilir (savunma
  -- katmanları — bkz. src/lib/gundem-content.ts).
  content_markdown text not null check (char_length(trim(content_markdown)) > 0),
  content_html text not null default '',

  cover_image_url text,
  cover_image_alt text,
  cover_image_caption text,
  image_source text,

  category_id uuid references public.gundem_categories(id),
  neighborhoods text[] not null default '{}',

  source_type text not null default 'original'
    check (source_type in ('original', 'official', 'third_party', 'field_report', 'business_submission')),
  source_name text,
  source_url text check (source_url is null or source_url ~* '^https://'),

  author text not null default 'RehberGölbaşı Haber Merkezi' check (char_length(trim(author)) > 0),

  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'archived')),
  published_at timestamptz,

  is_featured boolean not null default false,
  is_breaking boolean not null default false,
  breaking_until timestamptz,

  is_sponsored boolean not null default false,
  sponsor_name text,
  sponsor_description text,
  sponsor_url text check (sponsor_url is null or sponsor_url ~* '^https://'),

  seo_title text,
  meta_description text,
  canonical_override text check (canonical_override is null or canonical_override ~* '^https://'),
  og_image_url text,

  view_count bigint not null default 0,

  correction_note text,
  corrected_at timestamptz,
  corrected_by text,

  -- Aranabilir alanların (başlık, özet, gövde metni, kaynak adı, mahalleler,
  -- kaydetme anında ayrıca eklenen etiket adları) admin tarafında Türkçe
  -- karakter normalizasyonu uygulanarak birleştirilmiş hali. Postgres
  -- locale/unaccent varsayımı yapmamak için normalizasyon DB'de değil,
  -- uygulama katmanında (src/lib/search-text.ts, taksi modülündeki
  -- normalizeForSearch ile aynı mantık) yapılıp burada saklanır.
  search_text text not null default '',

  archived_at timestamptz,
  deleted_at timestamptz,

  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Yayına alınan/zamanlanan bir haberde kategori ve yayın tarihi zorunlu.
  constraint gundem_posts_publish_requires_category
    check (status not in ('scheduled', 'published') or category_id is not null),
  constraint gundem_posts_publish_requires_published_at
    check (status not in ('scheduled', 'published') or published_at is not null),
  -- Kapak görseli ve alt metni yalnızca yayına/zamanlamaya alınırken zorunlu
  -- (taslak aşamasında görsel henüz yüklenmemiş olabilir).
  constraint gundem_posts_publish_requires_cover
    check (
      status not in ('scheduled', 'published')
      or (cover_image_url is not null and coalesce(trim(cover_image_alt), '') <> '')
    ),
  -- Özgün olmayan içerikte kaynak adı ve bağlantısı zorunlu.
  constraint gundem_posts_source_required_when_not_original
    check (
      source_type = 'original'
      or (coalesce(trim(source_name), '') <> '' and coalesce(trim(source_url), '') <> '')
    ),
  -- Sponsorlu içerikte sponsor adı zorunlu.
  constraint gundem_posts_sponsor_name_required
    check (not is_sponsored or coalesce(trim(sponsor_name), '') <> '')
);

create index gundem_posts_public_idx
  on public.gundem_posts (published_at desc)
  where status in ('scheduled', 'published') and deleted_at is null;
create index gundem_posts_status_idx on public.gundem_posts (status);
create index gundem_posts_category_idx on public.gundem_posts (category_id);
create index gundem_posts_featured_idx on public.gundem_posts (is_featured) where is_featured = true;
create index gundem_posts_breaking_idx on public.gundem_posts (is_breaking) where is_breaking = true;
create index gundem_posts_neighborhoods_gin_idx on public.gundem_posts using gin (neighborhoods);
create index gundem_posts_deleted_idx on public.gundem_posts (deleted_at);

create trigger trg_gundem_posts_touch
  before update on public.gundem_posts
  for each row execute function public.gundem_touch_updated_at();

-- Görüntülenme sayısı yalnızca sunucu tarafından (API route üzerinden),
-- yalnızca gerçekten public görünür olan bir kayıt için artırılabilir.
-- SECURITY DEFINER: anon rolünün UPDATE yetkisi olmadan bu fonksiyon
-- üzerinden güvenli biçimde çalışır.
create or replace function public.increment_gundem_view_count(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.gundem_posts
    set view_count = view_count + 1
    where slug = p_slug
      and deleted_at is null
      and status in ('scheduled', 'published')
      and published_at is not null
      and published_at <= now();
end;
$$;

-- ============================================================================
-- 3) Etiket ve işletme ilişkileri (mevcut tags/businesses tabloları yeniden
--    kullanılıyor — ikinci bir etiket veya işletme sistemi kurulmuyor)
-- ============================================================================
create table public.gundem_post_tags (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.gundem_posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, tag_id)
);

create index gundem_post_tags_post_idx on public.gundem_post_tags (post_id);
create index gundem_post_tags_tag_idx on public.gundem_post_tags (tag_id);

create table public.gundem_post_businesses (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.gundem_posts(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, business_id)
);

create index gundem_post_businesses_post_idx on public.gundem_post_businesses (post_id);
create index gundem_post_businesses_business_idx on public.gundem_post_businesses (business_id);

-- ============================================================================
-- 4) Düzeltme/audit geçmişi — yalnızca haberin ANLAMINI değiştiren önemli
--    düzeltmeler için (basit yazım hatası düzeltmesi burada kayıt oluşturmaz;
--    bu ayrım admin editöründe UI seviyesinde yapılır). Mevcut projede genel
--    bir audit log altyapısı bulunmadığından, yalnızca gündem içerikleri için
--    sade ve amaca özel bir geçmiş tablosu oluşturuluyor.
-- ============================================================================
create table public.gundem_post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.gundem_posts(id) on delete cascade,
  changed_by text,
  changed_at timestamptz not null default now(),
  correction_note text not null check (char_length(trim(correction_note)) > 0),
  previous_snapshot jsonb not null,
  new_snapshot jsonb not null
);

create index gundem_post_revisions_post_idx on public.gundem_post_revisions (post_id);

-- ============================================================================
-- 5) Düzeltme/yanlış bilgi bildirimleri — mevcut `listing_reports` tablosu
--    yalnızca `business_id`ye bağlı olduğu ve NOT NULL olduğu için gündem
--    içerikleri için kullanılamıyor; taksi modülündeki
--    "TaxiReportModal + rate-limit trigger" deseni burada da aynen
--    uygulanıyor, ama kendi tablosunda (business_id yerine post_id).
-- ============================================================================
create table public.gundem_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.gundem_posts(id) on delete cascade,
  reason text not null check (
    reason in ('yanlis_bilgi', 'guncelligini_yitirmis', 'gorsel_telif', 'kisisel_veri', 'yazim_hatasi', 'diger')
  ),
  detail text,
  contact_info text,
  status text not null default 'yeni' check (status in ('yeni', 'inceleniyor', 'duzeltildi', 'reddedildi', 'kapatildi')),
  admin_note text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index gundem_reports_post_idx on public.gundem_reports (post_id);
create index gundem_reports_status_idx on public.gundem_reports (status);

create or replace function public.gundem_reports_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
begin
  select count(*) into recent_count
    from public.gundem_reports
    where post_id = new.post_id
      and created_at > now() - interval '10 minutes';
  if recent_count >= 5 then
    raise exception 'RATE_LIMITED: bu haber için çok sık bildirim' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger trg_gundem_reports_rate_limit
  before insert on public.gundem_reports
  for each row execute function public.gundem_reports_rate_limit();

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.gundem_categories enable row level security;
alter table public.gundem_posts enable row level security;
alter table public.gundem_post_tags enable row level security;
alter table public.gundem_post_businesses enable row level security;
alter table public.gundem_post_revisions enable row level security;
alter table public.gundem_reports enable row level security;

-- Kategoriler hassas değil: herkes okuyabilir (aktif/pasif filtresi
-- uygulama katmanında yapılır), yalnızca admin yazabilir.
create policy "public can view gundem categories"
  on public.gundem_categories for select
  to anon, authenticated
  using (true);

create policy "admin can manage gundem categories"
  on public.gundem_categories for all
  to authenticated
  using (true)
  with check (true);

-- Public yalnızca: silinmemiş, arşivlenmemiş, durumu scheduled/published
-- olan VE yayın zamanı geçmiş kayıtları görebilir. "scheduled" durumundaki
-- bir haberin yayın zamanı geldiğinde cron olmadan otomatik olarak public
-- hale gelmesi tam olarak bu koşulla sağlanır (published_at <= now()).
create policy "public can view published gundem posts"
  on public.gundem_posts for select
  to anon, authenticated
  using (
    deleted_at is null
    and status in ('scheduled', 'published')
    and published_at is not null
    and published_at <= now()
  );

-- Admin (authenticated) taslak, zamanlanmış, arşivlenmiş ve silinmiş
-- kayıtlar dahil HER ŞEYİ görebilir (liste ekranı, önizleme, düzenleme).
-- Postgres'te aynı komut için birden fazla permissive policy OR'lanır, bu
-- yüzden yukarıdaki public policy ile çakışmaz.
create policy "admin can view all gundem posts"
  on public.gundem_posts for select
  to authenticated
  using (true);

create policy "admin can insert gundem posts"
  on public.gundem_posts for insert
  to authenticated
  with check (true);

create policy "admin can update gundem posts"
  on public.gundem_posts for update
  to authenticated
  using (true)
  with check (true);

create policy "admin can delete gundem posts"
  on public.gundem_posts for delete
  to authenticated
  using (true);

-- Etiket/işletme ilişkileri: mevcut business_tags ile aynı güven modeli —
-- hassas veri taşımadıkları için okuma herkese açık, yazma yalnızca admin.
create policy "public can view gundem post tags"
  on public.gundem_post_tags for select
  to anon, authenticated
  using (true);

create policy "admin can manage gundem post tags"
  on public.gundem_post_tags for all
  to authenticated
  using (true)
  with check (true);

create policy "public can view gundem post businesses"
  on public.gundem_post_businesses for select
  to anon, authenticated
  using (true);

create policy "admin can manage gundem post businesses"
  on public.gundem_post_businesses for all
  to authenticated
  using (true)
  with check (true);

-- Düzeltme geçmişi tamamen admin-only, public hiçbir şekilde okuyamaz.
create policy "admin can view gundem revisions"
  on public.gundem_post_revisions for select
  to authenticated
  using (true);

create policy "admin can insert gundem revisions"
  on public.gundem_post_revisions for insert
  to authenticated
  with check (true);

-- Yanlış bilgi bildirimi: herkes oluşturabilir ama yalnızca yayında/
-- zamanlaması geçmiş, silinmemiş bir habere; yönetimsel alanlar güvenli
-- varsayılanlarında olmalı (business_submissions'daki aynı desen).
create policy "public can submit gundem report"
  on public.gundem_reports for insert
  to anon, authenticated
  with check (
    status = 'yeni'
    and admin_note is null
    and reviewed_by is null
    and reviewed_at is null
    and exists (
      select 1 from public.gundem_posts p
      where p.id = post_id
        and p.deleted_at is null
        and p.status in ('scheduled', 'published')
        and p.published_at is not null
        and p.published_at <= now()
    )
  );

create policy "admin can view gundem reports"
  on public.gundem_reports for select
  to authenticated
  using (true);

create policy "admin can update gundem reports"
  on public.gundem_reports for update
  to authenticated
  using (true)
  with check (true);
