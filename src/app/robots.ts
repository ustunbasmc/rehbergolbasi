import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/isletme-ekle/tesekkurler"],
    },
    sitemap: "https://rehbergolbasi.com/sitemap.xml",
  };
}