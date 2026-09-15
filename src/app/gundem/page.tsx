import Link from "next/link";
import type { Metadata } from "next";
import { Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { normalizeForSearch } from "@/lib/taxi";
import GundemCard, { type GundemCardData } from "@/components/GundemCard";
import GundemHeroSlider from "@/components/GundemHeroSlider";
import GundemSearchForm from "@/components/GundemSearchForm";
import GundemTrackedLink from "@/components/GundemTrackedLink";
import GundemListViewTracker from "@/components/GundemListViewTracker";
import type { GundemCategory } from "@/lib/types";

const GUNDEM_CARD_COLUMNS =
  "slug, title, summary, cover_image_url, cover_image_alt, published_at, corrected_at, neighborhoods, is_sponsored, is_breaking, breaking_until, category:gundem_categories(*)";

// Sorgular `published_at <= now()` koşulunu istek anında değerlendirir
// (zamanlanmış bir haberin, cron olmadan, vakti geldiğinde ek bir bekleme
// olmaksızın görünür olması için — bkz. teslim raporu madde 9). Bu yüzden
// Next.js bu sayfayı otomatik olarak dinamik (istek başına) render eder;
// `revalidate` burada etkisizdir ve bilerek eklenmemiştir.

const BASE_URL = "https://rehbergolbasi.com";
const PAGE_SIZE = 12;

interface SearchParamsShape {
  kategori?: string;
  q?: string;
  mahalle?: string;
  sayfa?: string;
}

async function getCategories(): Promise<GundemCategory[]> {
  const { data } = await supabase
    .from("gundem_categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  return data ?? [];
}

async function getNeighborhoods(): Promise<string[]> {
  const { data } = await supabase
    .from("gundem_posts")
    .select("neighborhoods")
    .is("deleted_at", null)
    .in("status", ["scheduled", "published"])
    .lte("published_at", new Date().toISOString());
  const set = new Set<string>();
  (data ?? []).forEach((row) => (row.neighborhoods ?? []).forEach((n: string) => set.add(n)));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
}

async function getBreakingPosts(): Promise<GundemCardData[]> {
  const { data } = await supabase
    .from("gundem_posts")
    .select(GUNDEM_CARD_COLUMNS)
    .is("deleted_at", null)
    .in("status", ["scheduled", "published"])
    .lte("published_at", new Date().toISOString())
    .eq("is_breaking", true)
    .or(`breaking_until.is.null,breaking_until.gt.${new Date().toISOString()}`)
    .order("published_at", { ascending: false })
    .limit(3);
  return (data ?? []) as unknown as GundemCardData[];
}

const HERO_SLIDE_COUNT = 5;

/**
 * Manşet adayları: öne çıkanlar önce, sonra en güncelller. Yalnızca 2+ aday
 * varsa liste sayfası bunu bir slider olarak gösterir; tek adayda düz statik
 * hero'ya, hiç yoksa hiçbir şeye düşer (bkz. GundemPage) — içerik azken asla
 * boş/garip görünen bir slider oluşmaz.
 */
async function getHeroCandidates(): Promise<GundemCardData[]> {
  const { data } = await supabase
    .from("gundem_posts")
    .select(GUNDEM_CARD_COLUMNS)
    .is("deleted_at", null)
    .in("status", ["scheduled", "published"])
    .lte("published_at", new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(HERO_SLIDE_COUNT);
  return (data ?? []) as unknown as GundemCardData[];
}

async function getMostRead(): Promise<GundemCardData[]> {
  const { data } = await supabase
    .from("gundem_posts")
    .select(`${GUNDEM_CARD_COLUMNS}, view_count`)
    .is("deleted_at", null)
    .in("status", ["scheduled", "published"])
    .lte("published_at", new Date().toISOString())
    .gt("view_count", 0)
    .order("view_count", { ascending: false })
    .limit(5);
  const rows = (data ?? []) as unknown as (GundemCardData & { view_count: number })[];
  return rows.length >= 3 ? rows : [];
}

const CATEGORY_SECTION_POOL_SIZE = 60;
const CATEGORY_SECTION_POST_COUNT = 4;

export interface GundemCategorySection {
  category: GundemCategory;
  posts: GundemCardData[];
}

/**
 * Kategori bazlı bölümler için TEK bir sorgu ile son N yayın çekilip
 * kategoriye göre gruplanır (her kategori için ayrı sorgu atıp N+1
 * oluşturmamak için). Yalnızca gerçekten yayında en az 1 içeriği olan
 * kategoriler döner — boş/thin bir kategori bölümü asla gösterilmez.
 */
async function getCategorySections(categories: GundemCategory[]): Promise<GundemCategorySection[]> {
  const { data } = await supabase
    .from("gundem_posts")
    .select(GUNDEM_CARD_COLUMNS)
    .is("deleted_at", null)
    .in("status", ["scheduled", "published"])
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(CATEGORY_SECTION_POOL_SIZE);

  const pool = (data ?? []) as unknown as GundemCardData[];
  const sections: GundemCategorySection[] = [];
  for (const category of categories) {
    const postsInCategory = pool.filter((p) => p.category?.slug === category.slug).slice(0, CATEGORY_SECTION_POST_COUNT);
    if (postsInCategory.length > 0) sections.push({ category, posts: postsInCategory });
  }
  return sections;
}

async function getPosts(params: SearchParamsShape, categories: GundemCategory[]) {
  const page = Math.max(1, Number(params.sayfa) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const nowIso = new Date().toISOString();

  let query = supabase
    .from("gundem_posts")
    .select(GUNDEM_CARD_COLUMNS, { count: "exact" })
    .is("deleted_at", null)
    .in("status", ["scheduled", "published"])
    .lte("published_at", nowIso)
    .order("published_at", { ascending: false });

  const activeCategory = params.kategori ? categories.find((c) => c.slug === params.kategori) : undefined;
  if (activeCategory) query = query.eq("category_id", activeCategory.id);
  if (params.mahalle) query = query.contains("neighborhoods", [params.mahalle]);
  if (params.q?.trim()) {
    query = query.ilike("search_text", `%${normalizeForSearch(params.q.trim())}%`);
  }

  query = query.range(offset, offset + PAGE_SIZE - 1);

  const { data, count } = await query;
  return {
    posts: (data ?? []) as unknown as GundemCardData[],
    total: count ?? 0,
    page,
    activeCategory,
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}): Promise<Metadata> {
  const params = await searchParams;
  const categories = await getCategories();
  const activeCategory = params.kategori ? categories.find((c) => c.slug === params.kategori) : undefined;
  const page = Math.max(1, Number(params.sayfa) || 1);
  const hasSearchOrExtraFilter = Boolean(params.q?.trim() || params.mahalle) || page > 1;

  // Marka adı burada eklenmez — kök layout'taki title.template ("%s |
  // RehberGölbaşı") zaten her sayfada tam olarak bir kez ekliyor. Buraya
  // "| RehberGölbaşı" eklemek başlığın iki kez markalı görünmesine yol açar.
  const title = activeCategory && !hasSearchOrExtraFilter
    ? `${activeCategory.name} Haberleri – Gölbaşı Gündem`
    : "Gölbaşı Haberleri ve Son Dakika Gündemi";
  const description = activeCategory && !hasSearchOrExtraFilter
    ? (activeCategory.meta_description ?? `Gölbaşı'nda ${activeCategory.name.toLocaleLowerCase("tr")} kategorisindeki güncel haberler.`)
    : "Ankara Gölbaşı'ndan güncel haberler, belediye duyuruları, trafik gelişmeleri, etkinlikler ve yerel yaşamdan önemli bilgiler.";

  const canonical = activeCategory && !hasSearchOrExtraFilter
    ? `${BASE_URL}/gundem?kategori=${activeCategory.slug}`
    : `${BASE_URL}/gundem`;

  return {
    title,
    description,
    alternates: { canonical },
    ...(hasSearchOrExtraFilter ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function GundemPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}) {
  const params = await searchParams;
  const categories = await getCategories();
  const isDefaultView = !params.kategori && !params.q?.trim() && !params.mahalle && (!params.sayfa || params.sayfa === "1");

  const [{ posts, total, page, activeCategory }, neighborhoods, breakingPosts, heroCandidates, mostRead, categorySections] = await Promise.all([
    getPosts(params, categories),
    getNeighborhoods(),
    getBreakingPosts(),
    isDefaultView ? getHeroCandidates() : Promise.resolve([]),
    isDefaultView ? getMostRead() : Promise.resolve([]),
    isDefaultView ? getCategorySections(categories) : Promise.resolve([]),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const heroExcludedSlugs = new Set(heroCandidates.map((p) => p.slug));
  const gridPosts = isDefaultView ? posts.filter((p) => !heroExcludedSlugs.has(p.slug)) : posts;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Gölbaşı Gündem", item: `${BASE_URL}/gundem` },
    ],
  };

  const collectionJsonLd = isDefaultView
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Gölbaşı Gündem",
        url: `${BASE_URL}/gundem`,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: posts.slice(0, 20).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${BASE_URL}/gundem/${p.slug}`,
          })),
        },
      }
    : null;

  function buildQuery(overrides: Partial<SearchParamsShape>): string {
    const merged = { ...params, ...overrides };
    const usp = new URLSearchParams();
    if (merged.kategori) usp.set("kategori", merged.kategori);
    if (merged.q) usp.set("q", merged.q);
    if (merged.mahalle) usp.set("mahalle", merged.mahalle);
    if (merged.sayfa && merged.sayfa !== "1") usp.set("sayfa", merged.sayfa);
    const qs = usp.toString();
    return qs ? `/gundem?${qs}` : "/gundem";
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
      <GundemListViewTracker resultCount={total} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {collectionJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      )}

      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm text-ink/50">
        <Link href="/" className="font-semibold transition-colors hover:text-bordo">Anasayfa</Link>
        <span>/</span>
        <span className="font-semibold text-navy">Gölbaşı Gündem</span>
      </nav>

      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">
        Gölbaşı Gündem
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink/60">
        Gölbaşı&apos;ndan güncel haberler, belediye duyuruları, trafik gelişmeleri, etkinlikler ve yerel yaşamdan önemli bilgiler.
      </p>

      {breakingPosts.length > 0 && (
        <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-bordo/20 bg-bordo/5 p-3.5">
          {breakingPosts.map((p) => (
            <Link key={p.slug} href={`/gundem/${p.slug}`} className="flex items-center gap-2 text-sm font-semibold text-bordo hover:underline">
              <Zap className="h-4 w-4 shrink-0 fill-bordo" /> {p.title}
            </Link>
          ))}
        </div>
      )}

      <GundemSearchForm defaultValue={params.q ?? ""} />

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/gundem" className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${!activeCategory ? "border-bordo bg-bordo/10 text-bordo" : "border-line text-ink/60 hover:border-bordo/40"}`}>
          Tümü
        </Link>
        {categories.map((c) => (
          <GundemTrackedLink
            key={c.id}
            href={`/gundem?kategori=${c.slug}`}
            eventType="news_category_click"
            meta={{ category: c.slug }}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${activeCategory?.id === c.id ? "border-bordo bg-bordo/10 text-bordo" : "border-line text-ink/60 hover:border-bordo/40"}`}
          >
            {c.name}
          </GundemTrackedLink>
        ))}
      </div>

      {posts.length === 0 && heroCandidates.length === 0 ? (
        <div className="card-shadow mt-8 rounded-2xl bg-offwhite p-10 text-center">
          <p className="text-sm text-ink/60">
            {params.q?.trim() || params.mahalle || activeCategory
              ? "Bu filtrelere uygun içerik bulunamadı. Farklı bir arama veya kategori deneyebilirsiniz."
              : "Henüz yayımlanmış bir gündem içeriği yok. Yakında burada olacak."}
          </p>
          {(params.q?.trim() || params.mahalle || activeCategory) && (
            <Link href="/gundem" className="mt-3 inline-block text-sm font-bold text-bordo hover:underline">
              Tüm gündemi göster
            </Link>
          )}
        </div>
      ) : (
        <>
          {heroCandidates.length === 1 && (
            <div className="mt-8">
              <GundemCard post={heroCandidates[0]} variant="hero" />
            </div>
          )}
          {heroCandidates.length > 1 && (
            <div className="mt-8">
              <GundemHeroSlider slides={heroCandidates} />
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gridPosts.map((post) => (
              <GundemCard key={post.slug} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                href={buildQuery({ sayfa: String(Math.max(1, page - 1)) })}
                aria-disabled={page <= 1}
                className={`flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm font-semibold ${page <= 1 ? "pointer-events-none opacity-40" : "text-navy hover:bg-offwhite"}`}
              >
                <ChevronLeft className="h-4 w-4" /> Önceki
              </Link>
              <span className="text-sm text-ink/50">{page} / {totalPages}</span>
              <Link
                href={buildQuery({ sayfa: String(Math.min(totalPages, page + 1)) })}
                aria-disabled={page >= totalPages}
                className={`flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm font-semibold ${page >= totalPages ? "pointer-events-none opacity-40" : "text-navy hover:bg-offwhite"}`}
              >
                Sonraki <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </>
      )}

      {isDefaultView && categorySections.length > 0 && (
        <div className="mt-12 flex flex-col gap-10 border-t border-line pt-8">
          {categorySections.map(({ category, posts: sectionPosts }) => (
            <div key={category.id}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-navy">{category.name}</h2>
                <GundemTrackedLink
                  href={`/gundem?kategori=${category.slug}`}
                  eventType="news_category_click"
                  meta={{ category: category.slug }}
                  className="text-sm font-semibold text-bordo hover:underline"
                >
                  Tümünü Gör →
                </GundemTrackedLink>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {sectionPosts.map((post) => (
                  <GundemCard key={post.slug} post={post} variant="compact" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isDefaultView && mostRead.length > 0 && (
        <div className="mt-12 border-t border-line pt-8">
          <h2 className="mb-4 font-display text-xl font-bold text-navy">En Çok Okunanlar</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mostRead.map((post) => (
              <GundemCard key={post.slug} post={post} variant="compact" />
            ))}
          </div>
        </div>
      )}

      {isDefaultView && neighborhoods.length > 0 && (
        <div className="mt-10 border-t border-line pt-8">
          <h2 className="mb-3 font-display text-lg font-bold text-navy">Mahallelere Göre Gündem</h2>
          <div className="flex flex-wrap gap-2">
            {neighborhoods.map((n) => (
              <Link key={n} href={`/gundem?mahalle=${encodeURIComponent(n)}`} className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold text-navy hover:border-bordo/40">
                {n}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
