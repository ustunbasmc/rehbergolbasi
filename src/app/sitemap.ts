import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://rehbergolbasi.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: categories }, { data: businesses }, { data: tags }] = await Promise.all([
    supabase.from("categories").select("slug"),
    supabase.from("businesses").select("slug, created_at").eq("status", "approved"),
    supabase.from("tags").select("slug"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/isletmeler`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/isletme-ekle`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${BASE_URL}/isletmeler/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const tagRoutes: MetadataRoute.Sitemap = (tags ?? []).map((t) => ({
    url: `${BASE_URL}/etiket/${t.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const businessRoutes: MetadataRoute.Sitemap = (businesses ?? []).map((b) => ({
    url: `${BASE_URL}/isletme/${b.slug}`,
    lastModified: b.created_at ? new Date(b.created_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...tagRoutes, ...businessRoutes];
}