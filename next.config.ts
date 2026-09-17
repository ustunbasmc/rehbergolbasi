import type { NextConfig } from "next";

// Sitede fiilen kullanılan tüm dış kaynaklar taranarak çıkarıldı (Google Maps
// embed, Leaflet/OpenStreetMap, Google Analytics, QR kod API'si, Supabase
// depolama). Buradaki her domain kod içinde en az bir yerde kanıtlanmış bir
// kullanıma karşılık gelir - kapsam daraltıldıkça bir şey kırılırsa önce
// buraya bakılmalı.
const csp = [
  "default-src 'self'",
  // next/script ile eklenen GA init script'i (CookieConsent.tsx) inline
  // olduğu için 'unsafe-inline' gerekiyor; JSON-LD <script> etiketleri
  // application/ld+json tipinde olduğundan script-src'den etkilenmez.
  // 'unsafe-eval' yalnızca geliştirme modunda eklenir: React dev modunda
  // hata ayıklama (call stack yeniden oluşturma) için eval() kullanır,
  // production build'de hiç kullanmaz (React'ın kendi belgelediği davranış).
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV !== "production" ? "'unsafe-eval' " : ""}https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://hbxvforrcdfcgclkyxmn.supabase.co https://unpkg.com https://*.tile.openstreetmap.org https://api.qrserver.com https://www.googletagmanager.com",
  "font-src 'self' data:",
  "frame-src 'self' https://www.google.com",
  "connect-src 'self' https://hbxvforrcdfcgclkyxmn.supabase.co wss://hbxvforrcdfcgclkyxmn.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // sharp native binary'sini webpack'in yanlış paketlemesini/bozmasını
  // önler. Bu olmadan Vercel'de sharp hata fırlatmadan bozuk/geçersiz
  // görsel çıktısı üretebiliyor (yerelde next dev'de sorun görünmez).
  serverExternalPackages: ["sharp"],
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hbxvforrcdfcgclkyxmn.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            // Taksi sayfasındaki "Konumumu Kullan" özelliği için geolocation
            // açık bırakıldı; kullanılmayan diğer tüm hassas API'ler kapatıldı.
            value:
              "geolocation=(self), camera=(), microphone=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;