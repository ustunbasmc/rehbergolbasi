import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Clock, MapPin, Megaphone, Zap, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSafeExternalUrl, estimateReadingTimeMinutes } from "@/lib/gundem";
import GundemCard, { type GundemCardData } from "@/components/GundemCard";
import GundemShareButtons from "@/components/GundemShareButtons";
import GundemCorrectionButton from "@/components/GundemCorrectionButton";
import GundemViewCounter from "@/components/GundemViewCounter";
import GundemTrackedLink from "@/components/GundemTrackedLink";
import GundemSourceLink from "@/components/GundemSourceLink";
import GundemClickTrack from "@/components/GundemClickTrack";
import GundemSidebarBusinessCard from "@/components/GundemSidebarBusinessCard";
import { getGundemSidebarBusinesses } from "@/lib/gundemSidebar";
import type { GundemCategory, GundemPost, Tag } from "@/lib/types";
import { GUNDEM_SOURCE_TYPE_LABELS } from "@/lib/types";

// Sorgular `published_at <= now()` koşulunu istek anında değerlendirir —
// zamanlanmış bir haber vakti geldiğinde cron olmadan hemen görünür olsun
// diye (bkz. teslim raporu madde 9). Next.js bu yüzden sayfayı otomatik
// dinamik render eder; `revalidate` burada etkisizdir ve eklenmemiştir.

const BASE_URL = "https://rehbergolbasi.com";

type PostRow = GundemPost & { category: GundemCategory | null };

async function getPost(slug: string): Promise<PostRow | null> {
  const { data } = await supabase
    .from("gundem_posts")
    .select("*, category:gundem_categories(*)")
    .eq("slug", slug)
    .is("deleted_at", null)
    .in("status", ["scheduled", "published"])
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  return (data as PostRow) ?? null;
}

async function getTags(postId: string): Promise<Tag[]> {
  const { data } = await supabase.from("gundem_post_tags").select("tag:tags(*)").eq("post_id", postId);
  return (data ?? []).map((r) => r.tag as unknown as Tag).filter(Boolean);
}

async function getRelatedPosts(post: PostRow, tagIds: string[]): Promise<GundemCardData[]> {
  const nowIso = new Date().toISOString();
  const orParts: string[] = [];
  if (post.category_id) orParts.push(`category_id.eq.${post.category_id}`);
  if (post.neighborhoods.length > 0) orParts.push(`neighborhoods.ov.{${post.neighborhoods.map((n) => `"${n}"`).join(",")}}`);

  let query = supabase
    .from("gundem_posts")
    .select("slug, title, summary, cover_image_url, cover_image_alt, published_at, corrected_at, neighborhoods, is_sponsored, is_breaking, breaking_until, category:gundem_categories(*)")
    .is("deleted_at", null)
    .in("status", ["scheduled", "published"])
    .lte("published_at", nowIso)
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(4);

  if (orParts.length > 0) query = query.or(orParts.join(","));

  const { data } = await query;
  const results = (data ?? []) as unknown as GundemCardData[];

  if (results.length < 4 && tagIds.length > 0) {
    const { data: tagLinked } = await supabase
      .from("gundem_post_tags")
      .select("post:gundem_posts(slug, title, summary, cover_image_url, cover_image_alt, published_at, corrected_at, neighborhoods, is_sponsored, is_breaking, breaking_until, status, deleted_at, published_at, category:gundem_categories(*))")
      .in("tag_id", tagIds);
    const extra = (tagLinked ?? [])
      .map((r) => r.post as unknown as (GundemCardData & { status: string; deleted_at: string | null }) | null)
      .filter((p): p is GundemCardData & { status: string; deleted_at: string | null } =>
        !!p && p.status !== "draft" && !p.deleted_at && !!p.published_at && new Date(p.published_at) <= new Date() && p.slug !== post.slug
      );
    const existingSlugs = new Set(results.map((r) => r.slug));
    for (const p of extra) {
      if (!existingSlugs.has(p.slug) && results.length < 4) {
        results.push(p);
        existingSlugs.add(p.slug);
      }
    }
  }

  return results.slice(0, 4);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Haber Bulunamadı" };

  const title = post.seo_title || post.title;
  const description = post.meta_description || post.summary;
  const canonical = post.canonical_override && isSafeExternalUrl(post.canonical_override)
    ? post.canonical_override
    : `${BASE_URL}/gundem/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: [post.author],
      section: post.category?.name,
      images: post.og_image_url || post.cover_image_url ? [post.og_image_url || post.cover_image_url!] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.og_image_url || post.cover_image_url ? [post.og_image_url || post.cover_image_url!] : undefined,
    },
  };
}

export default async function GundemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const tags = await getTags(post.id);
  const tagIds = tags.map((tag) => tag.id);
  const [sidebarBusinesses, relatedPosts] = await Promise.all([
    getGundemSidebarBusinesses(post.id, tagIds),
    getRelatedPosts(post, tagIds),
  ]);

  const publicUrl = `${BASE_URL}/gundem/${post.slug}`;
  const readingTime = estimateReadingTimeMinutes(post.content_markdown);
  // Yalnızca admin bilinçli olarak "önemli düzeltme" işaretlediğinde
  // (corrected_at dolu) "güncellendi" gösterilir — otomatik taslak kaydı
  // her düzenlemede updated_at'i değiştirdiği için ham updated_at farkı
  // kullanılmaz (madde 5: yazım hatası "haber güncellendi" göstermemeli).
  const wasUpdated = Boolean(post.corrected_at);
  const breakingActive = post.is_breaking && (!post.breaking_until || new Date(post.breaking_until) > new Date());

  const publishedDateLabel = post.published_at
    ? new Date(post.published_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;
  const updatedDateLabel = post.corrected_at
    ? new Date(post.corrected_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Gölbaşı Gündem", item: `${BASE_URL}/gundem` },
      { "@type": "ListItem", position: 3, name: post.title, item: publicUrl },
    ],
  };

  const newsArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.summary,
    image: post.cover_image_url ? [post.cover_image_url] : undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: post.author, url: BASE_URL },
    publisher: {
      "@type": "Organization",
      name: "RehberGölbaşı",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": publicUrl },
    articleSection: post.category?.name ?? undefined,
  };

  const hasSidebarContent = sidebarBusinesses.length > 0 || relatedPosts.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
      <GundemViewCounter slug={post.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }} />

      <div
        className={
          hasSidebarContent
            ? "lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-10 [grid-template-areas:'content'_'sidebar'] lg:[grid-template-areas:'content_sidebar']"
            : undefined
        }
      >
      <article className={hasSidebarContent ? "min-w-0 lg:max-w-[740px] [grid-area:content]" : undefined}>
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-ink/50">
        <Link href="/" className="font-semibold transition-colors hover:text-bordo">Anasayfa</Link>
        <span>/</span>
        <Link href="/gundem" className="font-semibold transition-colors hover:text-bordo">Gölbaşı Gündem</Link>
        {post.category && (
          <>
            <span>/</span>
            <GundemTrackedLink href={`/gundem?kategori=${post.category.slug}`} eventType="news_category_click" meta={{ category: post.category.slug }} className="font-semibold text-navy hover:text-bordo">
              {post.category.name}
            </GundemTrackedLink>
          </>
        )}
      </nav>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {breakingActive && (
          <span className="flex items-center gap-1 rounded-full bg-bordo px-2.5 py-1 text-[11px] font-bold text-white">
            <Zap className="h-3 w-3 fill-white" /> SON DAKİKA
          </span>
        )}
        {post.is_sponsored && (
          <span className="flex items-center gap-1 rounded-full bg-ink/10 px-2.5 py-1 text-[11px] font-bold text-ink/60">
            <Megaphone className="h-3 w-3" /> Sponsorlu İçerik
          </span>
        )}
      </div>

      <h1 className="font-display text-2xl font-bold leading-tight text-navy sm:text-3xl">{post.title}</h1>
      <p className="mt-3 text-lg leading-relaxed text-ink/60">{post.summary}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-y border-line py-3 text-xs text-ink/50">
        <span className="font-semibold text-navy">{post.author}</span>
        {publishedDateLabel && (
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {publishedDateLabel}</span>
        )}
        {wasUpdated && <span>Güncellendi: {updatedDateLabel}</span>}
        <span>{readingTime} dk okuma</span>
        {post.neighborhoods.length > 0 && (
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {post.neighborhoods.join(", ")}</span>
        )}
      </div>

      {post.cover_image_url && (
        <figure className="mt-5">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-offwhite">
            <Image src={post.cover_image_url} alt={post.cover_image_alt ?? post.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority />
          </div>
          {(post.cover_image_caption || post.image_source) && (
            <figcaption className="mt-1.5 text-xs text-ink/40">
              {post.cover_image_caption}
              {post.cover_image_caption && post.image_source && " · "}
              {post.image_source && `Görsel: ${post.image_source}`}
            </figcaption>
          )}
        </figure>
      )}

      <div className="gundem-article mt-6" dangerouslySetInnerHTML={{ __html: post.content_html }} />

      {tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Link key={tag.id} href={`/etiket/${tag.slug}`} className="rounded-full bg-offwhite px-3 py-1 text-xs font-semibold text-navy hover:bg-navy/10">
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {post.source_type !== "original" && post.source_name && (
        <div className="mt-6 rounded-xl border border-line bg-offwhite p-4 text-sm text-ink/70">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/40">
            {GUNDEM_SOURCE_TYPE_LABELS[post.source_type]}
          </p>
          {post.source_url && isSafeExternalUrl(post.source_url) ? (
            <GundemSourceLink url={post.source_url} label={post.source_name} postSlug={post.slug} />
          ) : (
            <span className="font-semibold text-navy">{post.source_name}</span>
          )}
        </div>
      )}

      {post.correction_note && (
        <div className="mt-6 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm text-ink/70">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gold-dark">Düzeltme</p>
          <p>{post.correction_note}</p>
          {post.corrected_at && (
            <p className="mt-1 text-xs text-ink/40">
              {new Date(post.corrected_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} tarihinde güncellenmiştir.
            </p>
          )}
        </div>
      )}

      {post.is_sponsored && (
        <div className="mt-6 rounded-xl border border-navy/20 bg-navy/5 p-4 text-sm text-ink/70">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-navy/60">
            <Megaphone className="h-3.5 w-3.5" /> Sponsorlu İçerik{post.sponsor_name ? ` · ${post.sponsor_name}` : ""}
          </p>
          {post.sponsor_description && <p>{post.sponsor_description}</p>}
          {post.sponsor_url && isSafeExternalUrl(post.sponsor_url) && (
            <a href={post.sponsor_url} target="_blank" rel="noopener noreferrer sponsored" className="mt-1 inline-block font-semibold text-navy hover:underline">
              {post.sponsor_name ?? "Sponsor bağlantısı"} →
            </a>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <GundemShareButtons url={publicUrl} title={post.title} postSlug={post.slug} />
        <GundemCorrectionButton postId={post.id} postSlug={post.slug} postTitle={post.title} />
      </div>
      </article>

      {hasSidebarContent && (
        <aside className="mt-10 lg:mt-0 lg:sticky lg:top-24 lg:self-start [grid-area:sidebar]">
          {sidebarBusinesses.length > 0 && (
            <div className="rounded-2xl border border-line bg-offwhite/60 p-4">
              <h2 className="mb-3 font-display text-base font-bold text-navy">Gölbaşı&apos;nda Keşfet</h2>
              <div className="flex flex-col gap-2">
                {sidebarBusinesses.map((b) => (
                  <GundemSidebarBusinessCard key={b.id} business={b} />
                ))}
              </div>
              <Link
                href="/isletmeler"
                className="mt-3 flex items-center justify-center gap-1 text-xs font-bold text-bordo hover:underline"
              >
                Tüm İşletmeleri Gör <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {relatedPosts.length > 0 && (
            <div className={sidebarBusinesses.length > 0 ? "mt-6" : ""}>
              <h2 className="mb-3 font-display text-base font-bold text-navy">Gündemden Diğer Yazılar</h2>
              <div className="flex flex-col gap-3">
                {relatedPosts.map((p) => (
                  <GundemClickTrack key={p.slug} eventType="news_related_article_click" meta={{ postSlug: post.slug }}>
                    <GundemCard post={p} variant="compact" />
                  </GundemClickTrack>
                ))}
              </div>
            </div>
          )}
        </aside>
      )}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-line pt-6 text-sm">
        <Link href="/gundem" className="flex items-center gap-1 font-semibold text-bordo hover:underline">
          <ChevronRight className="h-4 w-4 rotate-180" /> Tüm Gündem
        </Link>
      </div>
    </div>
  );
}
