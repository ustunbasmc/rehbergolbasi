import { supabase } from "@/lib/supabase";

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

/**
 * Google News sitemap: yalnızca son 48 saat içinde yayımlanmış, taslak/
 * zamanlanmış/arşivlenmiş olmayan haberleri içerir (Google News'in kendi
 * gereksinimi). Bu, standart sitemap.xml'den TAMAMEN bağımsızdır ve orada
 * kalıcı olarak listelenen tüm haberleri BURAYA doldurmaz. Google News'e
 * kabul veya sıralama garantisi verilmez — bu yalnızca teknik altyapıdır.
 */
export async function GET() {
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const nowIso = new Date().toISOString();

  const { data: posts } = await supabase
    .from("gundem_posts")
    .select("title, slug, published_at, category:gundem_categories(name)")
    .is("deleted_at", null)
    .in("status", ["scheduled", "published"])
    .lte("published_at", nowIso)
    .gte("published_at", twoDaysAgo)
    .order("published_at", { ascending: false });

  const urls = (posts ?? [])
    .map((p) => {
      const url = `${BASE_URL}/gundem/${p.slug}`;
      const category = (p.category as unknown as { name: string } | null)?.name ?? "Gündem";
      return `
  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>RehberGölbaşı</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${new Date(p.published_at as string).toISOString()}</news:publication_date>
      <news:title>${escapeXml(p.title)}</news:title>
      <news:keywords>${escapeXml(category)}</news:keywords>
    </news:news>
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
