import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Phone, Users, Newspaper, Navigation, HelpCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MAHALLELER, getMahalleBySlug, type Mahalle } from "@/data/mahalleler";
import GundemCard, { type GundemCardData } from "@/components/GundemCard";
import FaqAccordion from "@/components/FaqAccordion";
import PopulationTrendCard from "@/components/mahalle/PopulationTrendCard";
import MahalleBusinessGroups, { type MahalleBusinessGroup } from "@/components/mahalle/MahalleBusinessGroups";
import AdSlot from "@/components/AdSlot";
import { buildMahalleFaqs } from "@/lib/mahalleFaq";
import type { Business, Category } from "@/lib/types";

export const revalidate = 60;

const GUNDEM_CARD_COLUMNS =
  "slug, title, summary, cover_image_url, cover_image_alt, published_at, corrected_at, neighborhoods, is_sponsored, is_breaking, breaking_until, category:gundem_categories(*)";

/**
 * Bir mahallede birden fazla işletme türü varsa, en çok ziyaret edilmesi
 * beklenen kategoriler kendi başlığı altında öne çıkarılır; bu listede
 * olmayan her şey "Diğer İşletmeler" altında toplanır (bkz. `groupBusinesses`).
 */
const PRIORITY_CATEGORIES = [
  "Resmi Kurumlar",
  "Restoran & Kafe",
  "Eğitim",
  "Kuaför & Güzellik",
  "Sağlık",
  "Konaklama",
  "Düğün & Etkinlik",
  "Emlak",
];

function groupBusinesses(businesses: Business[], topCategoryNameOf: (categoryId: string) => string | null) {
  const byCategory = new Map<string, Business[]>();
  const diger: Business[] = [];

  businesses.forEach((b) => {
    const topName = topCategoryNameOf(b.category_id);
    if (topName && PRIORITY_CATEGORIES.includes(topName)) {
      const list = byCategory.get(topName) ?? [];
      list.push(b);
      byCategory.set(topName, list);
    } else {
      diger.push(b);
    }
  });

  const groups: MahalleBusinessGroup[] = PRIORITY_CATEGORIES.filter((name) => byCategory.has(name)).map((name) => ({
    key: name,
    label: name,
    businesses: byCategory.get(name)!,
    note:
      name === "Eğitim"
        ? "İlçe genelindeki okul kayıt ve eğitim işlemleri için Gölbaşı İlçe Millî Eğitim Müdürlüğü sayfasına bakabilirsiniz."
        : undefined,
  }));

  if (diger.length > 0) {
    groups.push({ key: "diger", label: "Diğer İşletmeler", businesses: diger });
  }

  return groups;
}

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
    supabase.from("categories").select("id, name, slug, parent_id"),
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

  const categoryById = new Map(
    (categories ?? []).map((c) => [c.id, c as Pick<Category, "id" | "name" | "slug" | "parent_id">])
  );
  function topCategoryNameOf(categoryId: string): string | null {
    let current = categoryById.get(categoryId);
    if (!current) return null;
    while (current.parent_id) {
      const parent = categoryById.get(current.parent_id);
      if (!parent) break;
      current = parent;
    }
    return current.name;
  }

  const businessGroups = groupBusinesses(businesses, topCategoryNameOf);

  return {
    mahalle,
    businesses,
    businessGroups,
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
  const description = mahalle.population2023
    ? `${mahalle.name} Mahallesi hakkında bilgiler: muhtar, işletmeler, eğitim kurumları ve son haberler. ${mahalle.population2023.toLocaleString("tr-TR")} nüfuslu Gölbaşı mahallesi.`
    : `${mahalle.name} Mahallesi hakkında bilgiler: muhtar, işletmeler ve son haberler. Ankara'nın Gölbaşı ilçesine bağlı bir mahalle.`;

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

function mapEmbedSrc(lat: number, lng: number, zoom = 15) {
  return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
}

function directionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function muhtarInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function MahallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) notFound();
  const { mahalle, businesses, businessGroups, gundemPosts } = data;

  const pageUrl = `https://rehbergolbasi.com/mahalle/${slug}`;
  const otherMahalleler = MAHALLELER.filter((m) => m.slug !== slug);

  const topCategoryNames = businessGroups.filter((g) => g.key !== "diger").map((g) => g.label).slice(0, 3);
  const faqs = buildMahalleFaqs(mahalle, businesses.length, topCategoryNames);

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

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-10 sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(circle at 90% 15%, rgba(201,162,75,0.18), transparent 55%)",
          }}
        />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="flex-1">
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
                  {mahalle.population2023 && (
                    <>
                      <Users className="h-3.5 w-3.5" /> {mahalle.population2023.toLocaleString("tr-TR")} nüfus (2023
                      ADNKS)
                      {" · "}
                    </>
                  )}
                  {businesses.length} işletme
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-white/75 sm:text-base">
              {mahalle.intro}
            </p>
          </div>
          <div className="w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 lg:w-80">
            <iframe
              title={`${mahalle.name} Mahallesi konumu`}
              width="100%"
              height="220"
              loading="lazy"
              style={{ border: 0, display: "block" }}
              src={mapEmbedSrc(mahalle.lat, mahalle.lng, 14)}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex flex-col gap-6 lg:flex-1">
          <div>
            <h2 className="mb-4 font-display text-xl font-bold text-navy">
              {`${mahalle.name} Mahallesi'ndeki İşletmeler`}
            </h2>
            <MahalleBusinessGroups groups={businessGroups} totalCount={businesses.length} />
          </div>

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

          <div>
            <h2 className="mb-4 flex items-center gap-1.5 font-display text-xl font-bold text-navy">
              <HelpCircle className="h-5 w-5 text-bordo" /> Sıkça Sorulan Sorular
            </h2>
            <FaqAccordion faqs={faqs} />
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:w-80">
          <MuhtarCard mahalle={mahalle} />
          {mahalle.population2023 && (
            <PopulationTrendCard population2023={mahalle.population2023} history={mahalle.populationHistory ?? []} />
          )}
          <AdSlot placement="mahalle_detail" variant="square" />

          <div className="card-shadow rounded-2xl bg-white p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wide text-ink/40">Diğer Mahalleler</h2>
              <Link href="/mahalle" className="text-xs font-semibold text-bordo hover:underline">
                Tümü
              </Link>
            </div>
            <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
              {otherMahalleler.map((m) => (
                <Link
                  key={m.slug}
                  href={`/mahalle/${m.slug}`}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-navy transition-colors hover:bg-offwhite hover:text-bordo"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-ink/30" /> {m.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MuhtarCard({ mahalle }: { mahalle: Mahalle }) {
  const { muhtar } = mahalle;
  const officeLat = muhtar.officeLat ?? mahalle.lat;
  const officeLng = muhtar.officeLng ?? mahalle.lng;
  return (
    <div className="card-shadow overflow-hidden rounded-2xl bg-white">
      <div className="p-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/40">Mahalle Muhtarı</h2>
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy to-navy-dark font-display text-lg font-bold text-white">
            {muhtarInitials(muhtar.name)}
          </span>
          <div>
            <p className="text-base font-bold text-navy">{muhtar.name}</p>
            <p className="text-xs text-ink/50">{mahalle.name} Mahallesi Muhtarı</p>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-1.5 text-sm text-ink/70">
          {muhtar.phone && (
            <a
              href={`tel:${muhtar.phone.replace(/[^\d+]/g, "")}`}
              className="flex items-center gap-2 hover:text-bordo"
            >
              <Phone className="h-3.5 w-3.5" /> {muhtar.phone} (Muhtarlık)
            </a>
          )}
          <a href={`tel:${muhtar.mobile.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 hover:text-bordo">
            <Phone className="h-3.5 w-3.5" /> {muhtar.mobile} (Cep)
          </a>
        </div>
      </div>
      <div className="overflow-hidden border-t border-line">
        <iframe
          title={`${mahalle.name} Muhtarlığı konumu`}
          width="100%"
          height="140"
          loading="lazy"
          style={{ border: 0, display: "block" }}
          src={mapEmbedSrc(officeLat, officeLng)}
        />
        <a
          href={directionsUrl(officeLat, officeLng)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 border-t border-line bg-offwhite py-2 text-xs font-semibold text-navy hover:text-bordo"
        >
          <Navigation className="h-3.5 w-3.5" /> Muhtarlığa yol tarifi al
        </a>
      </div>
      <p className="border-t border-line px-6 py-2.5 text-[11px] text-ink/40">
        Kaynak: Gölbaşı Belediyesi resmi muhtarlıklar listesi
      </p>
    </div>
  );
}
