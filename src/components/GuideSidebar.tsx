import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Star, Sparkles, BookOpen, ArrowRight, Clock as ClockIcon,
  Bus, Landmark, Pill, Share2, Shuffle, MapPin,
} from "lucide-react";
import GuideShareButtons from "@/components/GuideShareButtons";

interface BizCard {
  id: string;
  name: string;
  slug: string;
  neighborhood: string | null;
  cover_image_url: string | null;
  category: { name: string } | null;
}

interface OtherGuide {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  read_time: number;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function getSidebarData(currentGuideId: string) {
  const [{ data: featured }, { data: pool }, { data: otherGuides }] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, name, slug, neighborhood, cover_image_url, category:categories(name)")
      .eq("status", "approved")
      .eq("is_active", true)
      .eq("tier", "premium")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("businesses")
      .select("id, name, slug, neighborhood, cover_image_url, category:categories(name)")
      .eq("status", "approved")
      .eq("is_active", true)
      .limit(30),
    supabase
      .from("guides")
      .select("id, title, slug, cover_image_url, read_time")
      .eq("published", true)
      .neq("id", currentGuideId)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const featuredList = (featured ?? []) as unknown as BizCard[];
  const featuredIds = new Set(featuredList.map((b) => b.id));
  const restPool = ((pool ?? []) as unknown as BizCard[]).filter((b) => !featuredIds.has(b.id));
  const discover = shuffle(restPool).slice(0, 3);

  return {
    featured: featuredList,
    discover,
    otherGuides: otherGuides ?? [],
  };
}

function BusinessRow({ b }: { b: BizCard }) {
  return (
    <Link
      href={`/isletme/${b.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-line p-2 transition hover:border-bordo hover:shadow-sm"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-offwhite">
        {b.cover_image_url ? (
          <Image src={b.cover_image_url} alt={b.name} fill sizes="48px" className="object-cover transition duration-300 group-hover:scale-110" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-sm font-bold text-navy/20">
            {b.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-navy group-hover:text-bordo">{b.name}</p>
        <div className="flex items-center gap-1 text-[11px] text-ink/40">
          {b.neighborhood ? (
            <>
              <MapPin className="h-2.5 w-2.5" />
              <span className="truncate">{b.neighborhood}</span>
            </>
          ) : (
            b.category?.name && <span className="truncate">{b.category.name}</span>
          )}
        </div>
      </div>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink/0 transition group-hover:text-bordo" />
    </Link>
  );
}

export default async function GuideSidebar({
  currentGuideId,
  guideTitle,
  guideSlug,
}: {
  currentGuideId: string;
  guideTitle: string;
  guideSlug: string;
}) {
  const { featured, discover, otherGuides } = await getSidebarData(currentGuideId);

  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:w-80 lg:self-start">
      {/* Öne Çıkan İşletmeler */}
      {featured.length > 0 && (
        <div className="card-shadow overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex items-center gap-1.5 border-b border-line bg-gradient-to-r from-gold/10 to-transparent px-5 py-3.5">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <h3 className="text-sm font-bold text-navy">Öne Çıkan İşletmeler</h3>
          </div>
          <div className="flex flex-col gap-2.5 p-4">
            {featured.map((b) => (
              <BusinessRow key={b.id} b={b} />
            ))}
          </div>
        </div>
      )}

      {/* Keşfet — Rastgele İşletmeler */}
      {discover.length > 0 && (
        <div className="card-shadow overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <div className="flex items-center gap-1.5">
              <Shuffle className="h-4 w-4 text-bordo" />
              <h3 className="text-sm font-bold text-navy">Keşfet</h3>
            </div>
            <Link href="/isletmeler" className="text-[11px] font-semibold text-bordo hover:underline">
              Tümü →
            </Link>
          </div>
          <div className="flex flex-col gap-2.5 p-4">
            {discover.map((b) => (
              <BusinessRow key={b.id} b={b} />
            ))}
          </div>
        </div>
      )}

      {/* İşletmeni Ekle CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-bordo p-5 text-center text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 80% 0%, rgba(201,162,75,0.25), transparent 60%)" }}
        />
        <div className="relative">
          <Sparkles className="mx-auto mb-2 h-6 w-6 text-gold" />
          <p className="mb-1 font-display text-base font-bold">İşletmeniz Gölbaşı'nda mı?</p>
          <p className="mb-4 text-xs leading-relaxed text-white/70">
            İlk ay tamamen ücretsiz, hemen Gölbaşı'nda görünür olun.
          </p>
          <Link
            href="/isletme-ekle"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-bordo transition hover:bg-white/90"
          >
            Hemen Başvur <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Paylaş */}
      <div className="card-shadow rounded-2xl border border-line bg-white p-5">
        <div className="mb-3 flex items-center gap-1.5">
          <Share2 className="h-4 w-4 text-bordo" />
          <h3 className="text-sm font-bold text-navy">Bu Rehberi Paylaş</h3>
        </div>
        <GuideShareButtons title={guideTitle} slug={guideSlug} />
      </div>

      {/* Faydalı Bağlantılar */}
      <div className="card-shadow rounded-2xl border border-line bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-navy">Faydalı Bağlantılar</h3>
        <div className="flex flex-col gap-1">
          <Link
            href="/nobetci-eczane"
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-ink/70 transition hover:bg-offwhite hover:text-bordo"
          >
            <Pill className="h-4 w-4 text-bordo" /> Nöbetçi Eczane
          </Link>
          <Link
            href="/otobus-saatleri"
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-ink/70 transition hover:bg-offwhite hover:text-bordo"
          >
            <Bus className="h-4 w-4 text-bordo" /> Otobüs Saatleri
          </Link>
          <Link
            href="/isletmeler/resmi-kurumlar"
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-ink/70 transition hover:bg-offwhite hover:text-bordo"
          >
            <Landmark className="h-4 w-4 text-bordo" /> Resmi Kurumlar
          </Link>
        </div>
      </div>

      {/* Diğer Rehberler */}
      {otherGuides.length > 0 && (
        <div className="card-shadow rounded-2xl border border-line bg-white p-5">
          <div className="mb-3 flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-bordo" />
            <h3 className="text-sm font-bold text-navy">Diğer Rehberler</h3>
          </div>
          <div className="flex flex-col gap-3">
            {otherGuides.map((g) => (
              <Link key={g.id} href={`/rehberler/${g.slug}`} className="group flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-offwhite">
                  {g.cover_image_url ? (
                    <Image src={g.cover_image_url} alt={g.title} fill sizes="48px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-4 w-4 text-ink/20" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-bold text-navy group-hover:text-bordo">{g.title}</p>
                  <p className="flex items-center gap-1 text-[11px] text-ink/40">
                    <ClockIcon className="h-3 w-3" /> {g.read_time} dk
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}