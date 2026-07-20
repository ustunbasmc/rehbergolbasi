import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  ShieldCheck,
  Users,
  Sparkles,
  Star,
  Building2,
  LayoutGrid,
  Eye,
  Hash,
  Clock,
  Phone,
  MessageCircle,
  UtensilsCrossed,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import CategoryGrid, { type CategoryWithBusinesses } from "@/components/CategoryGrid";
import BusinessCard from "@/components/BusinessCard";
import StatsCounter from "@/components/StatsCounter";
import { getOpenStatus } from "@/lib/openingHours";
import type { OpeningHours } from "@/lib/types";

export const revalidate = 60;

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

async function getData() {
  const [{ data: allCategories }, { data: allBusinesses }, { data: featured }, { data: recent }, { data: tagLinks }] =
    await Promise.all([
      supabase.from("categories").select("*").order("display_order", { ascending: true }),
      supabase
        .from("businesses")
        .select("id, name, slug, phone, tier, category_id, neighborhood, view_count")
        .eq("status", "approved")
        .order("tier", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("businesses")
        .select("*")
        .eq("status", "approved")
        .eq("tier", "premium")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("businesses")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("business_tags")
        .select("tag:tags(id, name, slug), business:businesses(status)"),
    ]);

  const categories = allCategories ?? [];
  const businesses = allBusinesses ?? [];

  const topLevel = categories.filter((c) => !c.parent_id);

  const topIdFor = (categoryId: string): string => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return categoryId;
    return cat.parent_id ?? cat.id;
  };

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
    const business = row.business as unknown as { status: string } | null;
    if (!tag || business?.status !== "approved") return;
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
      .in("category_id", foodCategoryIds);

    openNowRestaurants = (foodBusinesses ?? [])
      .filter((b) => getOpenStatus(b.opening_hours as OpeningHours | null)?.isOpen)
      .sort((a, b) => (a.tier === b.tier ? 0 : a.tier === "premium" ? -1 : 1))
      .slice(0, 6);
  }

  return {
    categories: categoriesWithBusinesses,
    featured: featured ?? [],
    recent: recent ?? [],
    neighborhoods,
    popularTags,
    openNowRestaurants,
    stats: {
      businessCount: businesses.length,
      categoryCount: topLevel.length,
      neighborhoodCount: neighborhoodCounts.size,
      totalViews,
    },
  };
}

export default async function HomePage() {
  const { categories, featured, recent, neighborhoods, popularTags, openNowRestaurants, stats } =
    await getData();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-5 py-28 text-center text-white sm:py-32">
        <Image
          src="/hero-golbasi.jpg"
          alt="Gölbaşı Gölü"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,21,38,0.55) 0%, rgba(11,21,38,0.82) 55%, rgba(11,21,38,0.95) 100%)",
          }}
        />
        <div className="relative">
          <p className="mb-3 font-mono text-sm uppercase tracking-widest text-white/70">
            Gölbaşı, Ankara
          </p>
          <h1 className="mx-auto max-w-2xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Gölbaşı&apos;nda ne ararsan,{" "}
            <span className="text-bordo-dark bg-white rounded px-2">komşundan komşuna</span> burada.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-white/80">
            Restorandan kuaföre, emlakçıdan tesisatçıya — güvenilir işletmeler tek adreste.
          </p>

          <form
            action="/isletmeler"
            className="mx-auto mt-8 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row"
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

          <div className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/80">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-white/60" /> {stats.businessCount}+ işletme
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-white/60" /> Doğrulanmış kayıtlar
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-white/60" /> Şu an ücretsiz
            </span>
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

      <div className="mx-auto max-w-6xl px-5 py-16">
        {/* Karnın mı acıktı? */}
        {openNowRestaurants.length > 0 && (
          <section className="mb-20 overflow-hidden rounded-3xl bg-navy px-6 py-10 sm:px-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-xs font-bold uppercase tracking-wide text-green-300">
                    Şu an açık
                  </span>
                </div>
                <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-white">
                  <UtensilsCrossed className="h-5 w-5 text-gold" /> Karnın mı Acıktı?
                </h2>
                <p className="text-sm text-white/60">
                  Şu an açık olan restoranlar — tek tuşla ara, paketini söyle.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {openNowRestaurants.map((b) => (
                <div
                  key={b.id}
                  className={`flex items-center gap-3 rounded-2xl bg-white p-3 ${
                    b.tier === "premium" ? "ring-2 ring-gold" : ""
                  }`}
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-offwhite">
                    {b.cover_image_url ? (
                      <Image
                        src={b.cover_image_url}
                        alt={b.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-display text-lg font-bold text-navy/20">
                        {b.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/isletme/${b.slug}`}
                      className="flex items-center gap-1 truncate text-sm font-bold text-navy hover:text-bordo"
                    >
                      {b.tier === "premium" && <Star className="h-3 w-3 shrink-0 fill-gold text-gold" />}
                      <span className="truncate">{b.name}</span>
                    </Link>
                    {b.neighborhood && <p className="truncate text-xs text-ink/50">{b.neighborhood}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {b.phone && (
                      <a
                        href={`tel:${b.phone}`}
                        aria-label={`${b.name} işletmesini ara`}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-bordo text-white transition-colors hover:bg-bordo-dark"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                    {b.whatsapp && (
                      <a
                        href={`https://wa.me/${b.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${b.name} işletmesine WhatsApp'tan yaz`}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/10 text-navy transition-colors hover:bg-navy hover:text-white"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
            İşletmen Gölbaşı&apos;nda mı? Ücretsiz listelen.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/80">
            Şu an tüm kayıtlar ücretsiz. Hemen başvur, kısa süre içinde yayında ol.
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