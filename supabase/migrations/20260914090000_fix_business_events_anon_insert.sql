-- Tespit edilen üretim hatası: `business_events` tablosunda anon (herkese
-- açık ziyaretçi) rolü için hiçbir INSERT politikası yok. Bu yüzden sitedeki
-- TÜM tıklama takibi (Ara/WhatsApp/Yol Tarifi butonları, profil görüntüleme)
-- şu ana kadar sessizce başarısız oluyordu — tablo tamamen boş.
--
-- Bu politika, ziyaretçilerin yalnızca kendi tıklama olaylarını EKLEMESİNE
-- izin verir; okuma/güncelleme/silme hakkı vermez (aşağıdaki WITH CHECK,
-- yönetimsel alanların olmadığını doğrular — bu tabloda zaten böyle bir
-- alan yok, ama ileride eklenirse burası genişletilmeli).

drop policy if exists "public can record business events" on public.business_events;

create policy "public can record business events"
  on public.business_events
  for insert
  to anon, authenticated
  with check (true);
