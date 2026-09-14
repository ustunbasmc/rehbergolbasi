-- "Yanlış bilgi bildir" mevcut `listing_reports` tablosu (ClaimButton,
-- ReportButton) taksi sayfasında da aynen yeniden kullanılıyor — ikinci bir
-- bildirim tablosu OLUŞTURULMADI. Burada yalnızca ek bir koruma katmanı
-- ekleniyor: aynı işletme için kısa sürede çok fazla bildirim gelmesini
-- engelleyen basit bir oran sınırlaması (spam/kötüye kullanım koruması).
-- Mevcut sütunlara/politikalara dokunulmuyor.

create or replace function public.listing_reports_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
begin
  select count(*) into recent_count
    from public.listing_reports
    where business_id = new.business_id
      and created_at > now() - interval '10 minutes';
  if recent_count >= 5 then
    raise exception 'RATE_LIMITED: bu işletme için çok sık bildirim' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_listing_reports_rate_limit on public.listing_reports;
create trigger trg_listing_reports_rate_limit
  before insert on public.listing_reports
  for each row execute function public.listing_reports_rate_limit();
