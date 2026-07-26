import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Clock, ArrowLeft, BookOpen } from "lucide-react";

export const revalidate = 60;

interface Guide {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  read_time: number;
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
  featured: boolean;
  created_at: string;
}

async function getGuide(slug: string): Promise<Guide | null> {
  const { data } = await supabase
    .from("guides")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return { title: "Rehber Bulunamadı" };

  const title = guide.seo_title ?? guide.title;
  const description = guide.seo_description ?? guide.excerpt ?? `${guide.title} — Gölbaşı Rehberi`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://rehbergolbasi.com/rehberler/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: guide.cover_image_url ? [guide.cover_image_url] : undefined,
    },
    twitter: {
      title,
      description,
      images: guide.cover_image_url ? [guide.cover_image_url] : undefined,
    },
  };
}

// Markdown'dan içindekiler çıkar
function extractHeadings(content: string) {
  const lines = content.split("\n");
  const headings: { level: number; text: string; id: string }[] = [];
  for (const line of lines) {
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    if (h2) {
      const text = h2[1].trim();
      headings.push({ level: 2, text, id: slugifyHeading(text) });
    } else if (h3) {
      const text = h3[1].trim();
      headings.push({ level: 3, text, id: slugifyHeading(text) });
    }
  }
  return headings;
}

function slugifyHeading(text: string) {
  const trMap: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return text.split("").map((ch) => trMap[ch] ?? ch).join("")
    .toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim()
    .replace(/\s+/g, "-");
}

// Basit markdown → HTML dönüştürücü
function markdownToHtml(content: string): string {
  return content
    .replace(/^### (.+)$/gm, (_, t) => `<h3 id="${slugifyHeading(t)}" class="font-display text-xl font-bold text-navy mt-8 mb-3">${t}</h3>`)
    .replace(/^## (.+)$/gm, (_, t) => `<h2 id="${slugifyHeading(t)}" class="font-display text-2xl font-bold text-navy mt-10 mb-4 pb-2 border-b border-line">${t}</h2>`)
    .replace(/^# (.+)$/gm, (_, t) => `<h1 class="font-display text-3xl font-bold text-navy mb-4">${t}</h1>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-bordo font-semibold hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^- (.+)$/gm, "<li class=\"mb-1\">$1</li>")
    .replace(/(<li.*<\/li>\n?)+/g, (m) => `<ul class="list-disc pl-5 my-4 text-ink/70 space-y-1">${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, "<li class=\"mb-1\">$1</li>")
    .replace(/^(?!<[h|u|o|l]).+$/gm, (line) => line.trim() ? `<p class="text-ink/80 leading-relaxed mb-4">${line}</p>` : "")
    .replace(/\n{3,}/g, "\n\n");
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) notFound();

  const headings = extractHeadings(guide.content);
  const htmlContent = markdownToHtml(guide.content);
  const publishDate = new Date(guide.created_at).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.seo_title ?? guide.title,
    description: guide.seo_description ?? guide.excerpt ?? undefined,
    image: guide.cover_image_url ?? undefined,
    datePublished: guide.created_at,
    author: {
      "@type": "Organization",
      name: "RehberGölbaşı",
      url: "https://rehbergolbasi.com",
    },
    publisher: {
      "@type": "Organization",
      name: "RehberGölbaşı",
      url: "https://rehbergolbasi.com",
    },
    url: `https://rehbergolbasi.com/rehberler/${slug}`,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Kapak görseli */}
      {guide.cover_image_url && (
        <div className="relative h-64 w-full sm:h-96">
          <Image
            src={guide.cover_image_url}
            alt={guide.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-12">
        {/* Geri link */}
        <Link
          href="/rehberler"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink/50 hover:text-bordo"
        >
          <ArrowLeft className="h-4 w-4" /> Tüm Rehberler
        </Link>

        {/* Başlık & meta */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3 text-xs text-ink/40">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {guide.read_time} dk okuma
            </span>
            <span>·</span>
            <span>{publishDate}</span>
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight text-navy sm:text-4xl">
            {guide.title}
          </h1>
          {guide.excerpt && (
            <p className="mt-4 text-lg text-ink/60 leading-relaxed">{guide.excerpt}</p>
          )}
        </div>

        {/* İçindekiler */}
        {headings.length > 2 && (
          <div className="mb-8 rounded-2xl border border-line bg-offwhite p-5">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-bordo" />
              <p className="text-sm font-bold text-navy">İçindekiler</p>
            </div>
            <ul className="flex flex-col gap-1.5">
              {headings.map((h) => (
  <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
    <Link
      href={`#${h.id}`}
      className="text-sm text-bordo hover:underline"
    >
      {h.text}
    </Link>
  </li>
))}
            </ul>
          </div>
        )}

        {/* İçerik */}
        <article
          className="prose-rehber"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Alt bilgi */}
        <div className="mt-12 border-t border-line pt-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-navy">RehberGölbaşı</p>
              <p className="text-xs text-ink/50">Gölbaşı'nın dijital rehberi</p>
            </div>
            <Link
              href="/rehberler"
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-navy hover:border-bordo hover:text-bordo"
            >
              Diğer Rehberler →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}