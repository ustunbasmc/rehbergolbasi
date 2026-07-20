import type { Metadata } from "next";
import { Bitter, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

const bitter = Bitter({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const workSans = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rehbergolbasi.com"),
  title: {
    default: "RehberGölbaşı — Gölbaşı'nın İşletme Rehberi",
    template: "%s | RehberGölbaşı",
  },
  description:
    "Gölbaşı'ndaki restoranlar, kuaförler, emlakçılar ve daha fazlası tek yerde.",
  keywords: ["Gölbaşı", "Ankara", "işletme rehberi", "Gölbaşı esnaf", "Gölbaşı firmalar"],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "RehberGölbaşı",
    title: "RehberGölbaşı — Gölbaşı'nın İşletme Rehberi",
    description:
      "Gölbaşı'ndaki restoranlar, kuaförler, emlakçılar ve daha fazlası tek yerde.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RehberGölbaşı — Gölbaşı'nın İşletme Rehberi",
    description:
      "Gölbaşı'ndaki restoranlar, kuaförler, emlakçılar ve daha fazlası tek yerde.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "RehberGölbaşı",
      url: "https://rehbergolbasi.com",
      logo: "https://rehbergolbasi.com/logo.png",
    },
    {
      "@type": "WebSite",
      name: "RehberGölbaşı",
      url: "https://rehbergolbasi.com",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://rehbergolbasi.com/isletmeler?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${bitter.variable} ${workSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}