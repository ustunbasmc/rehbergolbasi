import { supabase } from "@/lib/supabase";
import { stripHtmlTags } from "@/lib/gundem";

export const revalidate = 300;

const BASE_URL = "https://rehbergolbasi.com";

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { data: posts } = await supabase
    .from("gundem_posts")
    .select("title, slug, summary, cover_image_url, published_at, updated_at, category:gundem_categories(name)")
    .is("deleted_at", null)
    .in("status", ["scheduled", "published"])
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(30);

  const items = (posts ?? [])
    .map((p) => {
      const url = `${BASE_URL}/gundem/${p.slug}`;
      const category = (p.category as unknown as { name: string } | null)?.name;
      return `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.published_at as string).toUTCString()}</pubDate>
      <description>${escapeXml(stripHtmlTags(p.summary))}</description>${category ? `\n      <category>${escapeXml(category)}</category>` : ""}${
        p.cover_image_url ? `\n      <enclosure url="${escapeXml(p.cover_image_url)}" type="image/webp" />` : ""
      }
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Gölbaşı Gündem — RehberGölbaşı</title>
    <link>${BASE_URL}/gundem</link>
    <description>Gölbaşı'ndan güncel haberler, belediye duyuruları, trafik gelişmeleri ve yerel yaşamdan önemli bilgiler.</description>
    <language>tr-TR</language>${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
