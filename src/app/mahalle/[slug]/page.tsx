import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Phone, Users, GraduationCap, Newspaper } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MAHALLELER, getMahalleBySlug } from "@/data/mahalleler";
import CategoryResults from "@/components/CategoryResults";
import BusinessCard from "@/components/BusinessCard";
import GundemCard, { type GundemCardData } from "@/components/GundemCard";
import type { Business, Category } from "@/lib/types";

export const revalidate = 60;

const GUNDEM_CARD_COLUMNS =
  "slug, title, summary, cover_image_url, cover_image_alt, published_at, corrected_at, neighborhoods, is_sponsored, is_breaking, breaking_until, category:gundem_categories(*)";

async function getData(slug: string) {
  const mahalle = getMahalleBySlug(slug);
  if (!mahalle) return null;

  const [{ data: allBusinesses }, { data: categories }, { data: gundemPosts }] = await Promise.all([
    supabase
      .from("businesses")
      .select("*, category:categories(name, icon)")
      .eq("status", "approved")
      .eq("is_active", true)
      .in("neighborhood", mahalle.aliases)
      .order("tier", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("id, slug, parent_id"),
    supabase
      .from("gundem_posts")
      .select(GUNDEM_CARD_COLUMNS)
      .is("deleted_at", null)
      .in("status", ["scheduled", "published"])
      .lte("published_at", new Date().toISOString())
      .overlaps("neighborhoods", mahalle.aliases)
      .order("published_at", { ascending: false })
      .limit(6),
  ]);

  const businesses = (allBusinesses ?? []) as Business[];

  const categoryById = new Map((categories ?? []).map((c) => [c.id, c as Pick<Category, "id" | "slug" | "parent_id">]));
  function topSlugOf(categoryId: string): string | null {
    let current = categoryById.get(categoryId);
    if (!current) return null;
    while (current.parent_id) {
      const parent = categoryById.get(current.parent_id);
      if (!parent) break;
      current = parent;
    }
    return current.slug;
  }

  const egitimBusinesses = businesses.filter((b) => topSlugOf(b.category_id) === "egitim");

  return {
    mahalle,
    businesses,
    egitimBusinesses,
    gundemPosts: (gundemPosts ?? []) as unknown as GundemCardData[],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mahalle = getMahalleBySlug(slug);
  if (!mahalle) return { title: "Mahalle Bulunamadı" };

  const title = `${mahalle.name} Mahallesi — Gölbaşı, Ankara`;
  const description = `${mahalle.name} Mahallesi hakkında bilgiler: muhtar, işletmeler, eğitim kurumları ve son haberler. ${mahalle.population2023.toLocaleString("tr-TR")} nüfuslu Gölbaşı mahallesi.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://rehbergolbasi.com/mahalle/${slug}`,
    },
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function MahallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) notFound();
  const { mahalle, businesses, egitimBusinesses, gundemPosts } = data;

  const pageUrl = `https://rehbergolbasi.com/mahalle/${slug}`;
  const otherMahalleler = MAHALLELER.filter((m) => m.slug !== slug);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: "https://rehbergolbasi.com" },
      { "@type": "ListItem", position: 2, name: "Mahalleler", item: "https://rehbergolbasi.com/mahalle" },
      { "@type": "ListItem", position: 3, name: `${mahalle.name} Mahallesi`, item: pageUrl },
    ],
  };

  const itemListJsonLd =
    businesses.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: businesses.map((b, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://rehbergolbasi.com/isletme/${b.slug}`,
            name: b.name,
          })),
        }
      : null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}

      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-10 sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(circle at 90% 15%, rgba(201,162,75,0.18), transparent 55%)",
          }}
        />
        <div className="relative">
          <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs font-semibold text-white/60">
            <Link href="/mahalle" className="transition-colors hover:text-white">
              Mahalleler
            </Link>
            <span>/</span>
            <span className="text-white">{mahalle.name}</span>
          </nav>
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-gold backdrop-blur-sm">
              <MapPin className="h-7 w-7" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {`${mahalle.name} Mahallesi`}
              </h1>
              <p className="flex items-center gap-1.5 text-sm text-white/60">
                <Users className="h-3.5 w-3.5" /> {mahalle.population2023.toLocaleString("tr-TR")} nüfus (2023 ADNKS)
                {" · "}
                {businesses.length} işletme
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-white/75 sm:text-base">
            {mahalle.intro}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex flex-col gap-6 lg:flex-1">
          <div>
            <h2 className="mb-4 font-display text-xl font-bold text-navy">
              {`${mahalle.name} Mahallesi'ndeki İşletmeler`}
            </h2>
            <CategoryResults businesses={businesses} />
          </div>

          {egitimBusinesses.length > 0 && (
            <div className="card-shadow rounded-2xl bg-white p-6">
              <h2 className="mb-4 flex items-center gap-1.5 font-display text-lg font-bold text-navy">
                <GraduationCap className="h-5 w-5 text-bordo" /> Eğitim
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {egitimBusinesses.map((b) => (
                  <BusinessCard key={b.id} business={b} />
                ))}
              </div>
              <p className="mt-4 text-xs text-ink/50">
                İlçe genelindeki okul kayıt ve eğitim işlemleri için{" "}
                <Link href="/isletme/golbasi-ilce-milli-egitim-mudurlugu" className="font-semibold text-bordo hover:underline">
                  Gölbaşı İlçe Millî Eğitim Müdürlüğü
                </Link>{" "}
                sayfasına bakabilirsiniz.
              </p>
            </div>
          )}

          <div className="card-shadow rounded-2xl bg-white p-6">
            <h2 className="mb-4 flex items-center gap-1.5 font-display text-lg font-bold text-navy">
              <Newspaper className="h-5 w-5 text-bordo" /> Mahalleyle İlgili Haberler
            </h2>
            {gundemPosts.length === 0 ? (
              <p className="text-sm text-ink/40">
                Bu mahalleyle ilgili henüz bir gündem haberi yok.{" "}
                <Link href="/gundem" className="font-semibold text-bordo hover:underline">
                  Tüm gündem haberlerini görüntüle
                </Link>
                .
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {gundemPosts.map((post) => (
                  <GundemCard key={post.slug} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:w-80">
          <div className="card-shadow rounded-2xl bg-white p-6">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/40">Mahalle Muhtarı</h2>
            <p className="text-base font-bold text-navy">{mahalle.muhtar.name}</p>
            <div className="mt-2 flex flex-col gap-1.5 text-sm text-ink/70">
              {mahalle.muhtar.phone && (
                <a href={`tel:${mahalle.muhtar.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 hover:text-bordo">
                  <Phone className="h-3.5 w-3.5" /> {mahalle.muhtar.phone} (Muhtarlık)
                </a>
              )}
              <a href={`tel:${mahalle.muhtar.mobile.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 hover:text-bordo">
                <Phone className="h-3.5 w-3.5" /> {mahalle.muhtar.mobile} (Cep)
              </a>
            </div>
            <p className="mt-3 border-t border-line pt-3 text-[11px] text-ink/40">
              Kaynak: Gölbaşı Belediyesi resmi muhtarlıklar listesi
            </p>
          </div>

          <div className="card-shadow rounded-2xl bg-white p-6">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/40">Diğer Mahalleler</h2>
            <div className="flex flex-col gap-2">
              {otherMahalleler.map((m) => (
                <Link
                  key={m.slug}
                  href={`/mahalle/${m.slug}`}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-navy transition-colors hover:bg-offwhite hover:text-bordo"
                >
                  <MapPin className="h-3.5 w-3.5 text-ink/30" /> {m.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
