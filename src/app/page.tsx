import Link from "next/link";
import Image from "next/image";
import NobetciEczaneWidget from "@/components/NobetciEczaneWidget";
import OpenRestaurantsWidget from "@/components/OpenRestaurantsWidget";
import {
  Search,
  MapPin,
  ShieldCheck,
  Zap,
  Sparkles,
  Star,
  BookOpen,
  Building2,
  LayoutGrid,
  Eye,
  Hash,
  Clock,
  Phone,
  MessageCircle,
  UtensilsCrossed,
  Pill,
  Bus,
  Landmark,
  Plus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import CategoryGrid, { type CategoryWithBusinesses } from "@/components/CategoryGrid";
import BusinessCard from "@/components/BusinessCard";
import StatsCounter from "@/components/StatsCounter";
import { getOpenStatus } from "@/lib/openingHours";
import type { OpeningHours } from "@/lib/types";

export const revalidate = 60;

const HIZLI_ERISIM = [
  { href: "/isletmeler", label: "İşletmeler", icon: Building2, bg: "bg-bordo/10", color: "text-bordo" },
  { href: "/nobetci-eczane", label: "Nöbetçi Eczane", icon: Pill, bg: "bg-green-500/10", color: "text-green-600" },
  { href: "/otobus-saatleri", label: "Otobüs Saatleri", icon: Bus, bg: "bg-navy/10", color: "text-navy" },
  { href: "/isletmeler/resmi-kurumlar", label: "Resmi Kurumlar", icon: Landmark, bg: "bg-gold/15", color: "text-gold-dark" },
  { href: "/rehberler", label: "Rehberler", icon: BookOpen, bg: "bg-purple-500/10", color: "text-purple-600" },
  { href: "/isletme-ekle", label: "İşletmeni Ekle", icon: Plus, bg: "bg-bordo/10", color: "text-bordo" },
];

const HERO_GUVEN = [
  { icon: Zap, title: "Hızlı Erişim", desc: "İhtiyacın olana tek tıkla ulaş" },
  { icon: ShieldCheck, title: "Doğrulanmış Kayıtlar", desc: "Güncel, güvenilir işletme bilgisi" },
  { icon: Sparkles, title: "İlk Ay Ücretsiz", desc: "Yeni işletmeler avantajlı başlar" },
];

interface OpenNowBusiness {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  whatsapp: string | null;
  cover_image_url: string | null;
  neighborhood: string | null;
  tier: "basic" | "premium";
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
async function getData() {
  const [{ data: allCategories }, { data: allBusinesses }, { data: featured }, { data: recent }, { data: tagLinks }] =
    await Promise.all([
      supabase.from("categories").select("*").order("display_order", { ascending: true }),
      supabase
        .from("businesses")
        .select("id, name, slug, phone, tier, category_id, neighborhood, view_count")
        .eq("status", "approved")
        .eq("is_active", true)
        .order("tier", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("businesses")
        .select("*")
        .eq("status", "approved")
        .eq("is_active", true)
        .eq("tier", "premium")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("businesses")
        .select("*")
        .eq("status", "approved")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("business_tags")
        .select("tag:tags(id, name, slug), business:businesses(status, is_active)"),
    ]);

  const categories = allCategories ?? [];
  const businesses = allBusinesses ?? [];

  const topLevel = categories.filter((c) => !c.parent_id);
  const resmiKurumlarTop = topLevel.find((c) => c.slug === "resmi-kurumlar");

  const topIdFor = (categoryId: string): string => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return categoryId;
    return cat.parent_id ?? cat.id;
  };
  const isResmiKurum = (categoryId: string) =>
  resmiKurumlarTop ? topIdFor(categoryId) === resmiKurumlarTop.id : false;

const commercialBusinesses = businesses.filter((b) => !isResmiKurum(b.category_id));
const commercialFeatured = (featured ?? []).filter((b) => !isResmiKurum(b.category_id));
const commercialRecent = (recent ?? []).filter((b) => !isResmiKurum(b.category_id));
  const categoriesWithBusinesses: CategoryWithBusinesses[] = topLevel.map((cat) => {
    const inThisCategory = businesses.filter((b) => topIdFor(b.category_id) === cat.id);
    return {
      ...cat,
      count: inThisCategory.length,
      businesses: inThisCategory.slice(0, 2),
    };
  });

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

  const tagCounts = new Map<string, { name: string; slug: string; count: number }>();
  (tagLinks ?? []).forEach((row) => {
    const tag = row.tag as unknown as { id: string; name: string; slug: string } | null;
    const business = row.business as unknown as { status: string; is_active: boolean } | null;
    if (!tag || business?.status !== "approved" || !business?.is_active) return;
    const existing = tagCounts.get(tag.id);
    if (existing) {
      existing.count += 1;
    } else {
      tagCounts.set(tag.id, { name: tag.name, slug: tag.slug, count: 1 });
    }
  });
  const popularTags = Array.from(tagCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

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
      .select("id, name, slug, phone, whatsapp, cover_image_url, neighborhood, tier, opening_hours")
      .eq("status", "approved")
      .eq("is_active", true)
      .in("category_id", foodCategoryIds);

    openNowRestaurants = (foodBusinesses ?? [])
      .filter((b) => getOpenStatus(b.opening_hours as OpeningHours | null)?.isOpen)
      .sort((a, b) => (a.tier === b.tier ? 0 : a.tier === "premium" ? -1 : 1))
      .slice(0, 6);
  }

  return {
  categories: categoriesWithBusinesses,
  featured: commercialFeatured,
  recent: commercialRecent,
  neighborhoods,
  popularTags,
  openNowRestaurants,
  stats: {
    businessCount: commercialBusinesses.length,
    categoryCount: topLevel.length - (resmiKurumlarTop ? 1 : 0),
    neighborhoodCount: neighborhoodCounts.size,
    totalViews,
  },
};
}
async function getNobetciEczaneler() {
  try {
    const res = await fetch(
      "https://eczaneapi.com/api/v1/pharmacies/on-duty?city=ankara&district=golbasi",
      {
        headers: { "X-API-Key": process.env.ECZANE_API_KEY! },
        next: { revalidate: 21600 },
      }
    );
    const data = await res.json();
    const today = new Date().toISOString().slice(0, 10);
    const todayGroup = (data?.data ?? []).find(
      (g: { date: string; pharmacies: unknown[] }) => g.date === today
    );
    return todayGroup?.pharmacies ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const latestGuides = await getLatestGuides();
  const nobetciEczaneler = await getNobetciEczaneler();
  const { categories, featured, recent, neighborhoods, popularTags, openNowRestaurants, stats } =
    await getData();

  return (
    <div>
      {/* Hero — açık zemin, iki sütun (KP düzeni), sağda kendi göl fotoğrafımız */}
      <section className="overflow-hidden bg-offwhite">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
            {/* Sol: başlık + arama */}
            <div>
              <span className="mb-4 inline-block rounded-full bg-bordo/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-bordo">
                Gölbaşı, Ankara
              </span>
              <h1 className="font-display text-4xl font-extrabold leading-[1.1] text-navy sm:text-5xl">
                Gölbaşı&apos;nda ne ararsan,{" "}
                <span className="text-bordo">komşundan komşuna</span> burada.
              </h1>
              <p className="mt-5 max-w-md text-base text-ink/60">
                Restorandan kuaföre, emlakçıdan tesisatçıya — güvenilir işletmeler tek adreste.
              </p>

              <form
                action="/isletmeler"
                className="mt-8 flex max-w-lg flex-col gap-2 rounded-2xl border border-line bg-white p-2 shadow-lg sm:flex-row"
              >
                <div className="flex flex-1 items-center gap-2 px-3 py-2">
                  <Search className="h-5 w-5 text-ink/40" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Restoran, kuaför, emlakçı ara..."
                    className="w-full text-sm text-ink outline-none placeholder:text-ink/40"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-bordo px-6 py-3 text-sm font-semibold text-white transition hover:bg-bordo-dark"
                >
                  Ara
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-ink/50">
                  <Building2 className="h-4 w-4 text-bordo" /> {stats.businessCount}+ işletme
                </span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-ink/50">
                  <ShieldCheck className="h-4 w-4 text-bordo" /> Doğrulanmış kayıtlar
                </span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-ink/50">
                  <Sparkles className="h-4 w-4 text-bordo" /> İlk ay ücretsiz
                </span>
              </div>
            </div>

            {/* Sağ: göl fotoğrafı + taşan bilgi kartı */}
            <div className="relative">
              <div className="overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src="/hero-golbasi.jpg"
                  alt="Gölbaşı Gölü"
                  width={720}
                  height={520}
                  priority
                  className="h-64 w-full object-cover sm:h-80 lg:h-96"
                />
              </div>

              <div className="relative z-10 -mt-12 ml-4 mr-4 rounded-2xl border border-line bg-white p-4 shadow-xl sm:-mt-14 sm:ml-8 sm:mr-8 sm:p-5">
                <div className="flex flex-col gap-3.5">
                  {HERO_GUVEN.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bordo/10">
                          <Icon className="h-4.5 w-4.5 text-bordo" />
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

      {/* Sayılarla RehberGölbaşı */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-10 sm:grid-cols-4">
          {[
            { icon: Building2, label: "İşletme", value: stats.businessCount },
            { icon: LayoutGrid, label: "Kategori", value: stats.categoryCount },
            { icon: MapPin, label: "Mahalle", value: stats.neighborhoodCount },
            { icon: Eye, label: "Görüntülenme", value: stats.totalViews },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex flex-col items-center text-center">
                <Icon className="mb-2 h-5 w-5 text-bordo" />
                <p className="font-display text-3xl font-extrabold text-navy">
                  <StatsCounter value={s.value} />+
                </p>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hızlı Erişim */}
      <section className="border-b border-line bg-offwhite">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
          <h2 className="mb-1 font-display text-xl font-bold text-navy">Hızlı Erişim</h2>
          <p className="mb-5 text-sm text-ink/60">Gölbaşı&apos;nda en çok aranan bilgilere tek tıkla ulaş.</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {HIZLI_ERISIM.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="card-shadow flex flex-col items-center gap-2 rounded-2xl border border-line bg-white p-4 text-center transition hover:-translate-y-0.5 hover:border-bordo hover:shadow-md"
                >
                  <span className={`flex h-12 w-12 items-center justify-center rounded-full ${item.bg}`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </span>
                  <span className="text-xs font-bold leading-tight text-navy">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        <div className="mb-20 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <OpenRestaurantsWidget restaurants={openNowRestaurants} />
          {nobetciEczaneler.length > 0 && (
            <NobetciEczaneWidget eczaneler={nobetciEczaneler} />
          )}
        </div>

        {/* Öne çıkanlar */}
        {featured.length > 0 && (
          <section className="mb-20">
            <div className="mb-5 flex items-center justify-between">
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
              <Link href="/isletmeler" className="text-sm font-semibold text-bordo hover:underline">
                Tümünü Gör →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          </section>
        )}

        {featured.length === 0 && (
          <section className="mb-20 rounded-2xl border border-line bg-offwhite p-10 text-center">
            <MapPin className="mx-auto mb-3 h-8 w-8 text-bordo" />
            <p className="font-display text-lg font-bold text-navy">Henüz onaylanmış işletme yok</p>
            <p className="mt-1 text-sm text-ink/60">Yakında Gölbaşı&apos;nın işletmeleri burada listelenecek.</p>
          </section>
        )}

        {/* Yeni Eklenenler */}
        {recent.length > 0 && (
          <section className="mb-20">
            <div className="mb-5 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-bordo" />
              <h2 className="font-display text-2xl font-bold text-navy">Yeni Eklenenler</h2>
            </div>
            <p className="mb-5 text-sm text-ink/60">Gölbaşı&apos;na en son katılan işletmeler.</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          </section>
        )}

        {/* Kategoriler */}
        <section className="mb-20">
          <h2 className="mb-1 font-display text-2xl font-bold text-navy">Kategoriler</h2>
          <p className="mb-5 text-sm text-ink/60">
            İhtiyacına göre bir kategori seç, örnek işletmeleri hemen ara.
          </p>
          <CategoryGrid categories={categories} />
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
                  className="card-shadow flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-white px-4 py-5 text-center transition-colors hover:border-bordo"
                >
                  <MapPin className="h-5 w-5 text-bordo" />
                  <span className="font-display text-sm font-bold text-navy">{n.name}</span>
                  <span className="text-xs text-ink/50">{n.count} işletme</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Popüler Etiketler */}
        {popularTags.length > 0 && (
          <section className="mb-20">
            <h2 className="mb-1 font-display text-2xl font-bold text-navy">Popüler Etiketler</h2>
            <p className="mb-5 text-sm text-ink/60">Aradığın şeye göre hızlıca filtrele.</p>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/etiket/${tag.slug}`}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-bordo hover:text-bordo"
                >
                  <Hash className="h-3.5 w-3.5 text-ink/40" /> {tag.name}
                </Link>
              ))}
            </div>
          </section>
        )}
        {/* Son Rehberler */}
{latestGuides.length > 0 && (
  <section className="mb-20">
    <div className="mb-6 flex items-center justify-between">
      <div>
        <div className="mb-1 flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-bordo" />
          <span className="text-xs font-bold uppercase tracking-wide text-bordo">
            Rehberler
          </span>
        </div>
        <h2 className="font-display text-2xl font-bold text-navy">
          Gölbaşı Hakkında Her Şey
        </h2>
        <p className="text-sm text-ink/60">
          Gölbaşı'nda yaşamı kolaylaştıran rehber yazıları.
        </p>
      </div>
      <Link
        href="/rehberler"
        className="text-sm font-semibold text-bordo hover:underline"
      >
        Tümünü Gör →
      </Link>
    </div>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {latestGuides.map((guide) => (
        <Link
          key={guide.id}
          href={`/rehberler/${guide.slug}`}
          className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-lg"
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
              <p className="mb-3 flex-1 text-sm text-ink/60 line-clamp-2">
                {guide.excerpt}
              </p>
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
            { title: "Direkt İletişime Geç", desc: "Telefon veya WhatsApp ile hemen ulaş." }
          ].map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-line p-6">
              <span className="font-display text-3xl font-extrabold text-bordo/30">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 font-display text-lg font-bold text-navy">{step.title}</p>
              <p className="mt-1 text-sm text-ink/60">{step.desc}</p>
            </div>
          ))}
        </section>

        {/* İşletme daveti */}
        <section className="rounded-2xl bg-bordo px-8 py-12 text-center text-white">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            İşletmen Gölbaşı&apos;nda mı? İlk ay ücretsiz listelen.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/80">
            Hemen başvur, kısa süre içinde yayında ol. İlk ayın tamamen ücretsiz.
          </p>
          <Link
            href="/isletme-ekle"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-bordo transition hover:bg-white/90"
          >
            İşletmeni Ekle
          </Link>
        </section>
      </div>
    </div>
  );
}