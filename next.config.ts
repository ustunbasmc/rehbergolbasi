import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sharp native binary'sini webpack'in yanlış paketlemesini/bozmasını
  // önler. Bu olmadan Vercel'de sharp hata fırlatmadan bozuk/geçersiz
  // görsel çıktısı üretebiliyor (yerelde next dev'de sorun görünmez).
  serverExternalPackages: ["sharp"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hbxvforrcdfcgclkyxmn.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;