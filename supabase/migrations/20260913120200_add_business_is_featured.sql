-- "Öne Çıkan" rozetini ödeme paketinden (tier) bağımsız, gerçek bir alan
-- haline getirir. Şu ana kadar `tier = 'premium'` hem "Plus paketi" hem de
-- "anasayfada öne çıkarma" anlamına geliyordu; bundan böyle bunlar ayrı
-- kavramlardır: tier ödeme/plan seviyesini, is_featured ise görünürlük
-- önceliğini belirtir.
--
-- Geriye dönük uyumluluk için: şu anda tier='premium' olan işletmeler zaten
-- sitede "Öne Çıkan" rozetiyle gösteriliyordu. Bu görünürlüğü aniden
-- kaldırmamak için mevcut premium işletmeler is_featured=true olarak
-- taşınır. Bundan sonra iki alan admin panelinden birbirinden bağımsız
-- yönetilir.

alter table public.businesses
  add column if not exists is_featured boolean not null default false;

update public.businesses
  set is_featured = true
  where tier = 'premium' and is_featured = false;
