import { supabase } from "@/lib/supabase";

export const revalidate = 300;

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { data: businesses } = await supabase
    .from("businesses")
    .select("name, slug, description, created_at, category:categories(name)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(30);

  const items = (businesses ?? [])
    .map((b) => {
      const url = `https://rehbergolbasi.com/isletme/${b.slug}`;
      const category = (b.category as unknown as { name: string } | null)?.name ?? "";
      const description = b.description
        ? escapeXml(b.description)
        : `Gölbaşı'nda ${category.toLowerCase()}`;
      return `
    <item>
      <title>${escapeXml(b.name)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(b.created_at).toUTCString()}</pubDate>
      <description>${description}</description>
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>RehberGölbaşı — Yeni İşletmeler</title>
    <link>https://rehbergolbasi.com</link>
    <description>Gölbaşı'nda yeni eklenen işletmeler</description>
    <language>tr-TR</language>${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}