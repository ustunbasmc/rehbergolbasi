-- Başvuru fotoğrafları için PRIVATE (herkese açık olmayan) yeni bir Storage
-- bucket'ı. Mevcut "business-photos" bucket'ı public'tir ve dokunulmaz;
-- başvuru görselleri admin onaylayıp bir işletmeye dönüştürene kadar hiç
-- kimseye (anon dahil) açık URL ile görünmemelidir.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-submission-photos',
  'business-submission-photos',
  false,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Herkes bu bucket'a YÜKLEYEBİLİR (kendi başvurusunun fotoğrafını), ama
-- listeleyemez/okuyamaz/silemez/değiştiremez.
drop policy if exists "public can upload submission photos" on storage.objects;
create policy "public can upload submission photos"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'business-submission-photos');

-- Yalnızca admin (authenticated) görüntüleyebilir — bu, admin'in tarayıcı
-- oturumundan doğrudan `createSignedUrl` çağırabilmesini sağlar; service
-- role gerekmez.
drop policy if exists "admin can view submission photos" on storage.objects;
create policy "admin can view submission photos"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'business-submission-photos');

-- Admin, bir başvuruyu işletmeye dönüştürürken fotoğrafı public bucket'a
-- kopyaladıktan sonra artık ihtiyaç duyulmayan private dosyayı silebilsin.
drop policy if exists "admin can delete submission photos" on storage.objects;
create policy "admin can delete submission photos"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'business-submission-photos');
