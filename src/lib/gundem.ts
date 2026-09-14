import { Marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { normalizeForSearch } from "@/lib/taxi";
import type { GundemPost } from "@/lib/types";

/**
 * Gündem içerikleri Markdown olarak kaydedilir. Başlık seviyeleri kasıtlı
 * olarak bir kademe kaydırılır (# -> h2, ## -> h3, ...): sayfanın tek H1'i
 * her zaman haber başlığıdır, editör içinde H1 oluşturulmasına izin verilmez.
 */
const gundemMarked = new Marked({
  breaks: true,
  gfm: true,
  renderer: {
    heading(token) {
      const depth = Math.min(token.depth + 1, 6);
      return `<h${depth}>${this.parser.parseInline(token.tokens)}</h${depth}>\n`;
    },
  },
});

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "em", "b", "i", "u", "s",
    "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "blockquote", "a", "img", "hr",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "width", "height"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
};

/** Markdown gövdesini güvenli (script/iframe/event-handler/javascript: içermeyen) HTML'e çevirir. */
export function renderGundemMarkdown(markdown: string): string {
  const rawHtml = gundemMarked.parse(markdown ?? "", { async: false }) as string;
  return sanitizeGundemHtml(rawHtml);
}

/** Zaten üretilmiş HTML'i render anında ikinci kez sanitize eder (savunma katmanı). */
export function sanitizeGundemHtml(html: string): string {
  const clean = DOMPurify.sanitize(html ?? "", SANITIZE_CONFIG);
  // Dış bağlantılara güvenli rel değerleri ekle.
  return clean.replace(/<a\s+([^>]*href=["']https?:\/\/[^"']*["'][^>]*)>/gi, (match, attrs: string) => {
    if (/\btarget=/.test(attrs)) {
      if (/\brel=/.test(attrs)) return match;
      return `<a ${attrs} rel="noopener noreferrer nofollow">`;
    }
    return `<a ${attrs} target="_blank" rel="noopener noreferrer nofollow">`;
  });
}

export function stripHtmlTags(html: string): string {
  return (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Türkçe metin için makul kelime/dakika hesabıyla okuma süresi (dakika, min 1). */
export function estimateReadingTimeMinutes(markdownOrHtml: string): number {
  const plain = stripHtmlTags(markdownOrHtml ?? "");
  const wordCount = plain.split(/\s+/).filter(Boolean).length;
  if (wordCount === 0) return 1;
  const WORDS_PER_MINUTE = 180;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

const TR_SLUG_MAP: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i", Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u",
};

/** Türkçe karakterleri normalize ederek güvenli, URL uyumlu bir slug üretir. */
export function slugifyTurkish(text: string): string {
  return text
    .split("")
    .map((ch) => TR_SLUG_MAP[ch] ?? ch)
    .join("")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

/** Başlık + özet + gövde + kaynak adı + mahalleler + etiket adlarından arama metni üretir. */
export function buildGundemSearchText(params: {
  title: string;
  summary: string;
  contentMarkdown: string;
  sourceName?: string | null;
  neighborhoods?: string[];
  tagNames?: string[];
}): string {
  const parts = [
    params.title,
    params.summary,
    stripHtmlTags(params.contentMarkdown),
    params.sourceName ?? "",
    ...(params.neighborhoods ?? []),
    ...(params.tagNames ?? []),
  ];
  return normalizeForSearch(parts.join(" "));
}

/** Yalnızca güvenli http/https protokolü kabul eder — javascript:/data: vb. reddedilir. */
export function isSafeExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Public bir sorgu/say fanın koşuluyla birebir aynı görünürlük kuralı (RLS ile tutarlı). */
export function isGundemPostPublic(post: Pick<GundemPost, "status" | "published_at" | "deleted_at">): boolean {
  if (post.deleted_at) return false;
  if (post.status !== "scheduled" && post.status !== "published") return false;
  if (!post.published_at) return false;
  return new Date(post.published_at).getTime() <= Date.now();
}

/** Admin listesinde gösterilecek "gerçek" durum: zamanı gelmiş scheduled kayıt fiilen yayında sayılır. */
export function effectiveGundemStatusLabel(
  post: Pick<GundemPost, "status" | "published_at" | "deleted_at">
): string {
  if (post.deleted_at) return "Silindi";
  if (post.status === "scheduled" && post.published_at && new Date(post.published_at).getTime() <= Date.now()) {
    return "Yayında (zamanı geldi)";
  }
  if (post.status === "draft") return "Taslak";
  if (post.status === "scheduled") return "Zamanlandı";
  if (post.status === "published") return "Yayında";
  return "Arşivlendi";
}

export function isBreakingActive(post: Pick<GundemPost, "is_breaking" | "breaking_until">): boolean {
  if (!post.is_breaking) return false;
  if (!post.breaking_until) return true;
  return new Date(post.breaking_until).getTime() > Date.now();
}
