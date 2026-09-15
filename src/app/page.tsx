import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import OpenRestaurantsWidget from "@/components/OpenRestaurantsWidget";
import AnnouncementSlider from "@/components/AnnouncementSlider";
import WeatherWidget from "@/components/WeatherWidget";
import EzanVakitleriCard from "@/components/EzanVakitleriCard";
import NobetciEczaneMiniCard, { type MiniPharmacy } from "@/components/NobetciEczaneMiniCard";
import HeroSearchArea from "@/components/HeroSearchArea";
import AdSlot from "@/components/AdSlot";
import {
  MapPin,
  ShieldCheck,
  Zap,
  Sparkles,
  Star,
  BookOpen,
  Clock,
  Newspaper,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import CategoryGrid, { type CategoryWithBusinesses } from "@/components/CategoryGrid";
import BusinessCard from "@/components/BusinessCard";
import GundemCard, { type GundemCardData } from "@/components/GundemCard";
import { getOpenStatus } from "@/lib/openingHours";
import type { Business, OpeningHours } from "@/lib/types";
import { computeExcludedCategoryIds } from "@/lib/businessStats";
import { getIstanbulDateString } from "@/lib/timezone";

export const revalidate = 60;

// Site genelindeki diğer sayfalar (nobetci-eczane, isletmeler vb.) da apex
// (www'siz) domaine canonical veriyor; ana sayfada bu hiç ayarlanmamıştı —
// diğer sayfalarla tutarlı olacak şekilde ekleniyor.
export const metadata: Metadata = {
  alternates: { canonical: "https://rehbergolbasi.com" },
  openGraph: { url: "https://rehbergolbasi.com" },
};

const HERO_GUVEN = [
  { icon: Zap, title: "Hızlı Erişim", desc: "İhtiyacın olana tek tıkla ulaş" },
  { icon: ShieldCheck, title: "Kontrol Edilen Bilgiler", desc: "İletişim bilgileri ekip tarafından kontrol edilir" },
  { icon: Sparkles, title: "Temel Kayıt Ücretsiz", desc: "İşletmeni süresiz ücretsiz ekle" },
];

const HOMEPAGE_DISCOVERY_COUNT = 6;
const HOMEPAGE_CATEGORY_COUNT = 6;

interface OpenNowBusiness {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  whatsapp: string | null;
  cover_image_url: string | null;
  neighborhood: string | null;
  tier: "basic" | "premium";
  is_featured: boolean;
}

/**
 * Basit, hızlı, deterministik string hash (FNV-1a). Math.random() KULLANILMAZ —
 * aynı gün içinde her istekte aynı "çeşitlilik" seçimi çıksın diye (SSR
 * tutarlılığı, hydration hatası riski yok; her gün farklı işletmeler öne çıkar).
 */
function stableHash(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

async function getLatestGuides() {
  const { data } = await supabase
    .from("guides")
    .select("id, title, slug, excerpt, cover_image_url, read_time, featured, created_at")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3);
  return data ?? [];
}

const HOMEPAGE_GUNDEM_COUNT = 4;

async function getLatestGundemPosts(): Promise<GundemCardData[]> {
  const { data } = await supabase
    .from("gundem_posts")
    .select("slug, title, summary, cover_image_url, cover_image_alt, published_at, corrected_at, neighborhoods, is_sponsored, is_breaking, breaking_until, category:gundem_categories(*)")
    .is("deleted_at", null)
    .in("status", ["scheduled", "published"])
    .lte("published_at", new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(HOMEPAGE_GUNDEM_COUNT);
  return (data ?? []) as unknown as GundemCardData[];
}

async function getData() {
  const [{ data: allCategories }, { data: allBusinesses }, { data: featured }] = await Promise.all([
    supabase.from("categories").select("*").order("display_order", { ascending: true }),
    supabase
      .from("businesses")
      .select(
        "id, name, slug, phone, whatsapp, lat, lng, tier, category_id, neighborhood, view_count, description, short_description, cover_image_url, is_featured, category:categories(name, icon)"
      )
      .eq("status", "approved")
      .eq("is_active", true)
      .order("tier", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("businesses")
      .select("*, category:categories(name, icon)")
      .eq("status", "approved")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const categories = allCategories ?? [];
  const businesses = (allBusinesses ?? []) as unknown as Business[];

  const topLevel = categories.filter((c) => !c.parent_id);
  const resmiKurumlarTop = topLevel.find((c) => c.slug === "resmi-kurumlar");
  const excludedCategoryIds = new Set(computeExcludedCategoryIds(categories));

  const topIdFor = (categoryId: string): string => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return categoryId;
    return cat.parent_id ?? cat.id;
  };
  const isResmiKurum = (categoryId: string) => excludedCategoryIds.has(categoryId);

  const commercialBusinesses = businesses.filter((b) => !isResmiKurum(b.category_id));
  const commercialFeatured = (featured ?? []).filter((b) => !isResmiKurum(b.category_id));

  const categoriesWithBusinesses: CategoryWithBusinesses[] = topLevel
    .map((cat) => {
      const inThisCategory = businesses.filter((b) => topIdFor(b.category_id) === cat.id);
      return {
        ...cat,
        count: inThisCategory.length,
        businesses: inThisCategory.slice(0, 2),
      };
    })
    // Ana sayfada yalnızca en az bir yayında işletmesi olan kategoriler görünür,
    // ve en kalabalık (en faydalı) 6 tanesi — tam liste /isletmeler'de filtrelerle.
    .filter((cat) => cat.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, HOMEPAGE_CATEGORY_COUNT);

  // Ana sayfa "Gölbaşı'nda Keşfet" — her üst kategoriden (en kalabalıktan başlayarak)
  // güne göre kararlı, deterministik olarak seçilmiş TEK işletme; zaten "Öne Çıkan"
  // bölümünde görünen işletmeler burada tekrar edilmez. Math.random() kullanılmaz.
  const daySeed = getIstanbulDateString();
  const featuredIds = new Set(commercialFeatured.map((b) => b.id));
  const categoriesByCount = topLevel
    .map((cat) => ({
      cat,
      count: commercialBusinesses.filter((b) => topIdFor(b.category_id) === cat.id).length,
    }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  const discoveryBusinesses: Business[] = [];
  for (const { cat } of categoriesByCount) {
    if (discoveryBusinesses.length >= HOMEPAGE_DISCOVERY_COUNT) break;
    const candidates = commercialBusinesses.filter(
      (b) => topIdFor(b.category_id) === cat.id && !featuredIds.has(b.id)
    );
    if (candidates.length === 0) continue;
    const pick = [...candidates].sort(
      (a, b) => stableHash(daySeed + a.id) - stableHash(daySeed + b.id)
    )[0];
    discoveryBusinesses.push(pick);
  }

  const neighborhoodCounts = new Map<string, number>();
  businesses.forEach((b) => {
    if (b.neighborhood) {
      neighborhoodCounts.set(b.neighborhood, (neighborhoodCounts.get(b.neighborhood) ?? 0) + 1);
    }
  });
  const neighborhoods = Array.from(neighborhoodCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const totalViews = businesses.reduce((sum, b) => sum + (b.view_count ?? 0), 0);

  const foodCategory = topLevel.find((c) => /yeme|içme|restoran|kafe|yemek/i.test(c.name));
  let openNowRestaurants: OpenNowBusiness[] = [];

  if (foodCategory) {
    const foodCategoryIds = [
      foodCategory.id,
      ...categories.filter((c) => c.parent_id === foodCategory.id).map((c) => c.id),
    ];

    const { data: foodBusinesses } = await supabase
      .from("businesses")
      .select(
        "id, name, slug, phone, whatsapp, cover_image_url, neighborhood, tier, is_featured, opening_hours"
      )
      .eq("status", "approved")
      .eq("is_active", true)
      .in("category_id", foodCategoryIds);

    // 3'e sınırlandırıldı — ana sayfada bu kart, yanındaki duyuru alanıyla
    // (16:9 görsel oranı) aynı yükseklikte kalması için (bkz. OpenRestaurantsWidget).
    openNowRestaurants = (foodBusinesses ?? [])
      .filter((b) => getOpenStatus(b.opening_hours as OpeningHours | null)?.isOpen)
      .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
      .slice(0, 3);
  }

  return {
    categories: categoriesWithBusinesses,
    featured: commercialFeatured,
    discoveryBusinesses,
    neighborhoods,
    openNowRestaurants,
    stats: {
      businessCount: commercialBusinesses.length,
      categoryCount: topLevel.length - (resmiKurumlarTop ? 1 : 0),
      neighborhoodCount: neighborhoodCounts.size,
      totalViews,
    },
  };
}

async function getAnnouncements() {
  const { data } = await supabase
    .from("announcements")
    .select("id, title, description, image_url, link_url")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  return data ?? [];
}

interface RawPharmacy {
  id: string;
  name: string;
  phone: string;
}

async function getNobetciEczaneler(): Promise<MiniPharmacy[]> {
  try {
    const res = await fetch(
      "https://eczaneapi.com/api/v1/pharmacies/on-duty?city=ankara&district=golbasi",
      {
        headers: { "X-API-Key": process.env.ECZANE_API_KEY! },
        next: { revalidate: 21600 },
      }
    );
    const data = await res.json();
    // Türkiye takvim gününe göre eşleştir — `toISOString().slice(0,10)` UTC
    // kullandığı için gece 00:00–02:59 arası "bugün" grubu bulunamıyordu
    // (bkz. teslim raporu, aynı kök neden /nobetci-eczane sayfasında da düzeltildi).
    const today = getIstanbulDateString();
    const todayGroup = (data?.data ?? []).find(
      (g: { date: string; pharmacies: RawPharmacy[] }) => g.date === today
    );
    const rawPharmacies: RawPharmacy[] = todayGroup?.pharmacies ?? [];
    // Ana sayfadaki mini kart adres alanını hiç göstermiyor (kaynak API'de şu
    // anda tüm adresler doğrulanamıyor/bozuk — bkz. teslim raporu), bu yüzden
    // yalnızca isim + telefon eşleniyor.
    return rawPharmacies.map((p) => ({ id: p.id, name: p.name, phone: p.phone || null }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const latestGuides = await getLatestGuides();
  const nobetciEczaneler = await getNobetciEczaneler();
  const announcements = await getAnnouncements();
  const latestGundemPosts = await getLatestGundemPosts();
  const { categories, featured, discoveryBusinesses, neighborhoods, openNowRestaurants } =
    await getData();

  const hasEczaneMini = nobetciEczaneler.length > 0;

  return (
    <div>
      {/* Hero — kısa ve etkili: tek H1, öne çıkan arama, mobilde ilk ekranda arama+4 eylem */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-bordo/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 pb-8 pt-6 sm:px-6 sm:pb-14 sm:pt-12">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
            {/* Sol: başlık + arama + hızlı eylemler (mobilde ilk viewport bu) */}
            <div>
              <span className="mb-2 inline-block rounded-full bg-white/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-gold sm:mb-3">
                Gölbaşı, Ankara
              </span>
              <h1 className="font-display text-2xl font-extrabold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
                Gölbaşı&apos;nda ne ararsan,{" "}
                <span className="text-gold">komşundan komşuna</span> burada.
              </h1>
              <p className="mt-2 max-w-md text-xs text-white/60 sm:mt-3 sm:text-base">
                Restorandan kuaföre, taksiden nöbetçi eczaneye — ihtiyacın olan her şey tek adreste.
              </p>

              <HeroSearchArea />
            </div>

            {/* Sağ: göl fotoğrafı + güven kartı — yalnızca masaüstünde (mobilde eylemleri aşağı itmesin) */}
            <div className="relative hidden lg:block">
              <div className="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
                <Image
                  src="/hero-golbasi.jpg"
                  alt="Gölbaşı Gölü"
                  width={720}
                  height={520}
                  priority
                  className="h-96 w-full object-cover"
                />
              </div>

              <div className="relative z-10 -mt-14 ml-8 mr-8 rounded-2xl bg-white p-5 shadow-2xl">
                <div className="flex flex-col gap-3.5">
                  {HERO_GUVEN.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-bordo to-bordo-dark shadow-sm">
                          <Icon className="h-4.5 w-4.5 text-white" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-navy">{item.title}</p>
                          <p className="text-xs text-ink/50">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gölbaşı Gündem — kompakt akış, yalnızca küçük kartlar (büyük manşet yok) */}
      {latestGundemPosts.length > 0 && (
        <section className="border-b border-line bg-white">
          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <Newspaper className="h-4 w-4 text-bordo" />
                <h2 className="font-display text-lg font-bold text-navy">Gölbaşı Gündem</h2>
              </div>
              <Link href="/gundem" className="shrink-0 whitespace-nowrap text-sm font-semibold text-bordo hover:underline">
                Tümü →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {latestGundemPosts.map((post) => (
                <GundemCard key={post.slug} post={post} variant="compact" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gölbaşı'nda Bugün — nöbetçi eczane, hava durumu, ezan vakitleri: tutarlı 3 mini kart */}
      <section className="border-b border-line bg-offwhite">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
          <div className="mb-5">
            <span className="text-xs font-bold uppercase tracking-wide text-bordo">Güncel</span>
            <h2 className="font-display text-2xl font-bold text-navy">Gölbaşı&apos;nda Bugün</h2>
            <p className="text-sm text-ink/60">Nöbetçi eczane, hava durumu ve ezan vakitleri tek bakışta.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {hasEczaneMini && <NobetciEczaneMiniCard pharmacies={nobetciEczaneler} />}
            <WeatherWidget />
            <EzanVakitleriCard />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        <AdSlot placement="home" variant="horizontal" className="mb-20" />

        {/* Öne çıkanlar — ücretli öne çıkarma paketi, açıkça etiketli */}
        {featured.length > 0 && (
          <section className="mb-20">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="text-xs font-bold uppercase tracking-wide text-gold-dark">
                    Öne çıkarma paketi
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold text-navy">Öne Çıkan İşletmeler</h2>
                <p className="text-sm text-ink/60">Gölbaşı&apos;nın öne çıkan işletmeleri.</p>
              </div>
              <Link href="/isletmeler" className="shrink-0 whitespace-nowrap text-sm font-semibold text-bordo hover:underline">
                Tümünü Gör →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((b) => (
                <BusinessCard key={b.id} business={b} source="home" />
              ))}
            </div>
          </section>
        )}

        {featured.length === 0 && discoveryBusinesses.length === 0 && (
          <section className="card-shadow mb-20 rounded-2xl bg-offwhite p-10 text-center">
            <MapPin className="mx-auto mb-3 h-8 w-8 text-bordo" />
            <p className="font-display text-lg font-bold text-navy">Henüz onaylanmış işletme yok</p>
            <p className="mt-1 text-sm text-ink/60">Yakında Gölbaşı&apos;nın işletmeleri burada listelenecek.</p>
          </section>
        )}

        {/* Gölbaşı'nda Keşfet — farklı kategorilerden çeşitli, kaliteli işletmeler (konum kullanılmadığı için "yakınında" değil) */}
        {discoveryBusinesses.length > 0 && (
          <section className="mb-20">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-navy">Gölbaşı&apos;nda Keşfet</h2>
                <p className="text-sm text-ink/60">Farklı kategorilerden öne çıkan işletmeler.</p>
              </div>
              <Link href="/isletmeler" className="hidden text-sm font-semibold text-bordo hover:underline sm:block">
                Tüm İşletmeleri Gör →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {discoveryBusinesses.map((b) => (
                <BusinessCard key={b.id} business={b} source="home" />
              ))}
            </div>
            <Link href="/isletmeler" className="mt-5 block text-center text-sm font-semibold text-bordo hover:underline sm:hidden">
              Tüm İşletmeleri Gör →
            </Link>
          </section>
        )}

        {/* Duyurular + Şu an açık restoranlar — duyuru 2 birim, restoranlar 1 birim genişlikte yan yana.
            Grid satırı her iki sütunu da eşit yükseklikte gerer (items-stretch); duyuru görseli kendi
            en-boy oranıyla dikeyde ortalanır, restoran kartı ise iç boşluklarıyla o yüksekliği doldurur
            (bkz. OpenRestaurantsWidget) — böylece sayı/oran ne olursa olsun ikisi de aynı yükseklikte görünür. */}
        {(announcements.length > 0 || openNowRestaurants.length > 0) && (
          <div className="mb-20 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
            {announcements.length > 0 && (
              <div
                className={`flex h-full flex-col justify-center ${
                  openNowRestaurants.length > 0 ? "lg:col-span-2" : "lg:col-span-3"
                }`}
              >
                <AnnouncementSlider announcements={announcements} />
              </div>
            )}
            {/* Yalnızca gerçekten açık olanlar (getOpenStatus zaten eksik/geçersiz saatleri hariç tutar) */}
            {openNowRestaurants.length > 0 && (
              <div className={`h-full ${announcements.length > 0 ? "lg:col-span-1" : "lg:col-span-3"}`}>
                <OpenRestaurantsWidget restaurants={openNowRestaurants} />
              </div>
            )}
          </div>
        )}

        {/* Kategoriler */}
        <section className="mb-20">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy">Kategoriler</h2>
              <p className="text-sm text-ink/60">İhtiyacına göre bir kategori seç, örnek işletmeleri hemen ara.</p>
            </div>
            <Link href="/isletmeler" className="hidden items-center gap-1 text-sm font-semibold text-bordo hover:underline sm:flex">
              Tüm Kategorileri Gör <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <CategoryGrid categories={categories} />
          <Link
            href="/isletmeler"
            className="mt-5 flex items-center justify-center gap-1 text-sm font-semibold text-bordo hover:underline sm:hidden"
          >
            Tüm Kategorileri Gör <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>

        {/* Mahallelere Göre Gözat */}
        {neighborhoods.length > 0 && (
          <section className="mb-20">
            <h2 className="mb-1 font-display text-2xl font-bold text-navy">Mahallelere Göre Gözat</h2>
            <p className="mb-5 text-sm text-ink/60">Yaşadığın mahalledeki işletmeleri keşfet.</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {neighborhoods.map((n) => (
                <Link
                  key={n.name}
                  href={`/isletmeler?q=${encodeURIComponent(n.name)}`}
                  className="card-shadow card-shadow-hover flex flex-col items-center gap-1.5 rounded-2xl bg-white px-4 py-5 text-center transition"
                >
                  <MapPin className="h-5 w-5 text-bordo" />
                  <span className="font-display text-sm font-bold text-navy">{n.name}</span>
                  <span className="text-xs text-ink/50">{n.count} işletme</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Son Rehberler */}
        {latestGuides.length > 0 && (
          <section className="mb-20">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-bordo" />
                  <span className="text-xs font-bold uppercase tracking-wide text-bordo">Rehberler</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-navy">Gölbaşı Hakkında Her Şey</h2>
                <p className="text-sm text-ink/60">Gölbaşı&apos;nda yaşamı kolaylaştıran rehber yazıları.</p>
              </div>
              <Link href="/rehberler" className="shrink-0 whitespace-nowrap text-sm font-semibold text-bordo hover:underline">
                Tümünü Gör →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latestGuides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/rehberler/${guide.slug}`}
                  className="card-shadow card-shadow-hover group flex flex-col overflow-hidden rounded-2xl bg-white transition"
                >
                  <div className="relative h-44 w-full bg-offwhite">
                    {guide.cover_image_url ? (
                      <Image
                        src={guide.cover_image_url}
                        alt={guide.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-8 w-8 text-ink/10" />
                      </div>
                    )}
                    {guide.featured && (
                      <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-gold-dark">
                        Öne Çıkan
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="mb-2 font-display text-base font-bold text-navy transition-colors group-hover:text-bordo line-clamp-2">
                      {guide.title}
                    </h3>
                    {guide.excerpt && (
                      <p className="mb-3 flex-1 text-sm text-ink/60 line-clamp-2">{guide.excerpt}</p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-ink/40">
                      <Clock className="h-3.5 w-3.5" />
                      {guide.read_time} dk okuma
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Nasıl çalışır */}
        <section className="mb-20 grid gap-6 sm:grid-cols-3">
          {[
            { title: "Kategori Seç", desc: "İhtiyacına uygun kategoriyi bul." },
            { title: "İşletmeyi İncele", desc: "Fotoğraf, konum ve iletişim bilgilerine bak." },
            { title: "Direkt İletişime Geç", desc: "Telefon veya WhatsApp ile hemen ulaş." },
          ].map((step, i) => (
            <div key={step.title} className="card-shadow rounded-2xl bg-white p-6">
              <span className="font-display text-3xl font-extrabold text-bordo/30">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 font-display text-lg font-bold text-navy">{step.title}</p>
              <p className="mt-1 text-sm text-ink/60">{step.desc}</p>
            </div>
          ))}
        </section>

        {/* İşletme daveti — sayfada tek CTA */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-bordo to-bordo-dark px-8 py-12 text-center text-white shadow-2xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
          <h2 className="relative font-display text-2xl font-bold sm:text-3xl">
            İşletmen Gölbaşı&apos;nda mı? Ücretsiz listelen.
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-white/80">
            Temel işletme kaydı ücretsizdir. Dilersen RehberGölbaşı Plus&apos;a geçebilirsin —
            ilk 30 gün ücretsiz, sonra aylık 360 TL.
          </p>
          <Link
            href="/isletme-ekle"
            className="relative mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-bordo shadow-lg transition hover:shadow-xl hover:brightness-95 active:scale-[0.98]"
          >
            İşletmeni gönder, profilini biz hazırlayalım
          </Link>
        </section>
      </div>
    </div>
  );
}
