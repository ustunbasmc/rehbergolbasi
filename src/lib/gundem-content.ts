import { Marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

/**
 * Markdown -> güvenli HTML dönüşümü YALNIZCA admin editöründe ve önizleme
 * modalında (ikisi de "use client") kullanılır — bir haber kaydedilirken
 * tarayıcıda üretilip sanitize edilmiş HTML doğrudan `content_html`
 * kolonuna yazılır. Bu ağır bağımlılıkları (marked + isomorphic-dompurify,
 * ki isomorphic-dompurify sunucu tarafında jsdom kullanır) bilerek
 * `lib/gundem.ts`'den AYRI bir dosyada tutuyoruz: server component'ler
 * (ör. /gundem, /gundem/[slug]) yalnızca `lib/gundem.ts`'deki hafif
 * yardımcı fonksiyonları import ediyor ve bu dosyaya hiç dokunmuyor —
 * aksi halde aynı modülü import eden her sunucu sayfası, hiç çağırmasa
 * bile bu bağımlılıkları da yükler.
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
