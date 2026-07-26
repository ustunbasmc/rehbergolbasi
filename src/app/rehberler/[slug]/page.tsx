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
    alternates: { canonical: `https://rehbergolbasi.com/rehberler/${slug}` },
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

function slugifyHeading(text: string) {
  const trMap: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return text.split("").map((ch) => trMap[ch] ?? ch).join("")
    .toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim()
    .replace(/\s+/g, "-");
}

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

function parseTable(block: string): string {
  const lines = block.trim().split("\n").filter((l) => l.trim());
  if (lines.length < 2) return block;

  const isHeader = lines[1].replace(/\|/g, "").trim().match(/^[-\s]+$/);
  if (!isHeader) return block;

  const parseRow = (line: string) =>
    line.split("|").map((c) => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);

  const headers = parseRow(lines[0]);
  const rows = lines.slice(2).map(parseRow);

  const headerHtml = headers.map((h) => `<th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-ink/50 bg-offwhite border-b border-line">${h}</th>`).join("");
  const rowsHtml = rows.map((row) =>
    `<tr class="border-b border-line hover:bg-offwhite/50 transition">${row.map((cell) => `<td class="px-4 py-3 text-sm text-ink/80">${cell}</td>`).join("")}</tr>`
  ).join("");

  return `<div class="my-6 overflow-x-auto rounded-xl border border-line shadow-sm"><table class="w-full text-sm"><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table></div>`;
}

function markdownToHtml(content: string): string {
  // Önce tablo bloklarını bul ve dönüştür
  const tableBlockRegex = /(\|.+\|\n\|[-|\s]+\|\n(?:\|.+\|\n?)*)/g;
  let result = content.replace(tableBlockRegex, (match) => parseTable(match));

  // Blockquote (> ile başlayan satırlar)
  result = result.replace(
    /^> (.+)$/gm,
    `<div class="my-4 flex gap-3 rounded-xl border border-gold/30 bg-gold/5 p-4"><span class="mt-0.5 text-gold-dark">💡</span><p class="text-sm text-ink/70 leading-relaxed">$1</p></div>`
  );

  // ⚠️ işaretli blockquote'lar
  result = result.replace(
    /^> ⚠️ (.+)$/gm,
    `<div class="my-4 flex gap-3 rounded-xl border border-bordo/30 bg-bordo/5 p-4"><span class="mt-0.5">⚠️</span><p class="text-sm text-ink/70 leading-relaxed">$1</p></div>`
  );

  result = result
    .replace(/^### (.+)$/gm, (_, t) => `<h3 id="${slugifyHeading(t)}" class="font-display text-xl font-bold text-navy mt-8 mb-3">${t}</h3>`)
    .replace(/^## (.+)$/gm, (_, t) => `<h2 id="${slugifyHeading(t)}" class="font-display text-2xl font-bold text-navy mt-12 mb-4 pb-2 border-b border-line">${t}</h2>`)
    .replace(/^# (.+)$/gm, (_, t) => `<h1 class="font-display text-3xl font-bold text-navy mb-4">${t}</h1>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong class="font-bold text-navy">$1</strong>`)
    .replace(/\*(.+?)\*/g, `<em class="italic">$1</em>`)
    .replace(/\[(.+?)\]\((.+?)\)/g, `<a href="$2" class="text-bordo font-semibold hover:underline" rel="noopener noreferrer">$1</a>`)
    .replace(/^- (.+)$/gm, `<li class="mb-1.5 text-ink/80">$1</li>`)
    .replace(/(<li.*<\/li>\n?)+/g, (m) => `<ul class="list-disc pl-5 my-4 space-y-1">${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, `<li class="mb-1.5 text-ink/80">$1</li>`)
    .replace(/^(?!<[hudiop]).+$/gm, (line) => line.trim() ? `<p class="text-ink/80 leading-relaxed mb-4">${line}</p>` : "")
    .replace(/\n{3,}/g, "\n\n");

  return result;
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
    author: { "@type": "Organization", name: "RehberGölbaşı", url: "https://rehbergolbasi.com" },
    publisher: { "@type": "Organization", name: "RehberGölbaşı", url: "https://rehbergolbasi.com" },
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
        <div className="relative h-72 w-full sm:h-[480px]">
          <Image
            src={guide.cover_image_url}
            alt={guide.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-10 sm:px-12">
            <div className="mx-auto max-w-4xl">
              <div className="mb-3 flex items-center gap-3 text-xs text-white/70">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {guide.read_time} dk okuma
                </span>
                <span>·</span>
                <span>{publishDate}</span>
              </div>
              <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
                {guide.title}
              </h1>
              {guide.excerpt && (
                <p className="mt-3 max-w-2xl text-base text-white/80 leading-relaxed">{guide.excerpt}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-12">
        {/* Kapak görseli yoksa başlık burada */}
        {!guide.cover_image_url && (
          <div className="mb-8">
            <Link
              href="/rehberler"
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink/50 hover:text-bordo"
            >
              <ArrowLeft className="h-4 w-4" /> Tüm Rehberler
            </Link>
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
        )}

        {/* Kapak görseli varsa geri link */}
        {guide.cover_image_url && (
          <Link
            href="/rehberler"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-ink/50 hover:text-bordo"
          >
            <ArrowLeft className="h-4 w-4" /> Tüm Rehberler
          </Link>
        )}

        {/* İçindekiler */}
        {headings.length > 2 && (
          <div className="mb-10 rounded-2xl border border-line bg-offwhite p-6">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-bordo" />
              <p className="text-sm font-bold text-navy">İçindekiler</p>
            </div>
            <ul className="flex flex-col gap-2">
              {headings.map((h) => (
                <li key={h.id} className={h.level === 3 ? "ml-5" : ""}>
                  <Link
                    href={`#${h.id}`}
                    className={`text-sm hover:underline ${h.level === 2 ? "font-semibold text-navy" : "text-bordo"}`}
                  >
                    {h.level === 2 ? "→ " : "· "}{h.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* İçerik */}
        <article
          className="min-w-0"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Alt bilgi */}
        <div className="mt-16 border-t border-line pt-8">
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