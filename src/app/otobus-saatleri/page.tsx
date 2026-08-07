import type { Metadata } from "next";
import Link from "next/link";
import { Bus, ChevronDown, ExternalLink, MapPin, Pill, Sparkles } from "lucide-react";
import OtobusHatlariList from "./OtobusHatlariList";

export const metadata: Metadata = {
  title: "Gölbaşı Otobüs Saatleri — Tüm EGO Hatları ve Güzergahları | Rehber Gölbaşı",
  description:
    "Gölbaşı'ndan Kızılay, Ulus, Akköprü, AŞTİ ve İncek'e giden tüm EGO otobüs hatları. Hafta içi, Cumartesi ve Pazar hareket saatleri, güzergahlar ve tüm duraklar — güncel ve eksiksiz.",
  alternates: {
    canonical: "https://rehbergolbasi.com/otobus-saatleri",
  },
  openGraph: {
    title: "Gölbaşı Otobüs Saatleri — Tüm EGO Hatları",
    description:
      "Gölbaşı'ndan Kızılay, Ulus, Akköprü, İncek ve çevre mahallelere giden tüm otobüs hatları, saatleri ve durakları.",
    url: "https://rehbergolbasi.com/otobus-saatleri",
    type: "website",
    locale: "tr_TR",
  },
};

const SSS = [
  {
    soru: "Gölbaşı'ndan Kızılay'a hangi otobüs gider?",
    cevap:
      "Gölbaşı'ndan Kızılay ve Ulus istikametine 105-1, 106-3, 115, 150-1, 195-1 ve 198-1 numaralı EGO hatları çalışır. En kısa süre 105-1 hattı ile yaklaşık 55 dakikadır.",
  },
  {
    soru: "Gölbaşı'ndan Akköprü ve AŞTİ'ye hangi otobüsler gider?",
    cevap:
      "Akköprü ve AŞTİ yönüne 104-1, 104-2, 114, 114-2 ve 165-1 numaralı hatlar hizmet verir. 114 hattı Yurtlar üzerinden en hızlı güzergahtır (yaklaşık 40 dakika).",
  },
  {
    soru: "Gölbaşı'ndan İncek'e otobüsle nasıl gidilir?",
    cevap:
      "İncek, Taşpınar ve Tulumtaş mahallelerine 191, 192-1, 193, 196 ve 197 numaralı hatlarla ulaşılabilir. Bu hatlar Opera ve Kızılay üzerinden de geçer.",
  },
  {
    soru: "Cumartesi ve Pazar günleri Gölbaşı otobüsleri çalışıyor mu?",
    cevap:
      "Şehir merkezine giden ana hatların (105, 106, 195 gibi) çoğu Cumartesi ve Pazar günleri de, daha seyrek seferlerle çalışır. Bazı kırsal mahalle hatları yalnızca hafta içi çalışır — her hattın kartında bu bilgi ayrıca belirtilir.",
  },
  {
    soru: "Dini ve resmi bayramlarda otobüs saatleri değişiyor mu?",
    cevap: "Evet, dini ve resmi bayramlarda tüm hatlarda Cumartesi tarifesi uygulanır.",
  },
];

const POPULER_HATLAR = [
  { no: "105-1", ad: "Kızılay - Ulus" },
  { no: "104-1", ad: "Akköprü" },
  { no: "192-1", ad: "İncek - Tulumtaş" },
  { no: "180", ad: "Karaali Mh." },
  { no: "179", ad: "Örencik - Yurtbeyi" },
];

export default function OtobusSaatleriPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SSS.map((s) => ({
      "@type": "Question",
      name: s.soru,
      acceptedAnswer: { "@type": "Answer", text: s.cevap },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: "https://rehbergolbasi.com" },
      { "@type": "ListItem", position: 2, name: "Otobüs Saatleri", item: "https://rehbergolbasi.com/otobus-saatleri" },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink/50 hover:text-bordo"
      >
        ← Anasayfa
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:gap-12">
        <main className="min-w-0">
          <h1 className="mb-2 flex items-center gap-2 font-display text-3xl font-bold text-navy">
            <Bus className="h-7 w-7 text-bordo" /> Gölbaşı Otobüs Saatleri
          </h1>
          <p className="mb-4 text-sm leading-relaxed text-ink/60">
            Gölbaşı'ndan Kızılay, Ulus, Sıhhiye ve Opera'ya; Akköprü ve AŞTİ'ye; İncek, Taşpınar ve
            Tulumtaş'a; Karagedik, Selametli, Bezirhane gibi kırsal mahallelere giden tüm EGO
            otobüs hatlarını bu sayfada bulabilirsiniz. Her hat kartında güzergah, mesafe, hafta
            içi/Cumartesi/Pazar hareket saatleri ve geçtiği tüm duraklar yer alır.
          </p>

          <a
            href="https://www.ego.gov.tr/otobusnerede"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-8 flex items-center justify-between rounded-2xl border border-line bg-navy/[0.03] p-4"
          >
            <div>
              <p className="text-sm font-semibold text-navy">Canlı otobüs takibi</p>
              <p className="mt-0.5 text-[13px] text-ink/55">EGO Otobüs Nerede sisteminde görüntüle</p>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-ink/40" />
          </a>

          <OtobusHatlariList />

          <section className="mt-10 border-t border-line pt-8">
            <h2 className="mb-4 font-display text-xl font-bold text-navy">Sıkça sorulan sorular</h2>
            <div className="flex flex-col gap-2">
              {SSS.map((s, i) => (
                <details key={i} className="group rounded-xl border border-line bg-white p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[14px] font-semibold text-navy">
                    {s.soru}
                    <ChevronDown className="h-4 w-4 shrink-0 text-ink/40 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink/65">{s.cevap}</p>
                </details>
              ))}
            </div>
          </section>

          <p className="mt-8 text-center text-[12.5px] text-ink/40 lg:text-left">
            Saatler EGO Genel Müdürlüğü verilerine dayanır, resmi bayramlarda Cumartesi tarifesi
            uygulanır. Güncel bilgi için EGO Cep'te uygulamasını kullanabilirsiniz.
          </p>
        </main>

        <aside className="hidden lg:block">
          <div className="sticky top-8 flex flex-col gap-4">
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="mb-3 text-[13px] font-semibold text-navy">Popüler hatlar</p>
              <ul className="flex flex-col gap-2">
                {POPULER_HATLAR.map((h) => (
                  <li key={h.no}>
                    <a
                      href={`#hat-${h.no}`}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-ink/65 hover:bg-navy/5 hover:text-bordo"
                    >
                      <span className="rounded bg-bordo/10 px-1.5 py-0.5 text-[11px] font-bold text-bordo">
                        {h.no}
                      </span>
                      {h.ad}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="mb-3 text-[13px] font-semibold text-navy">Gölbaşı'nda faydalı bilgiler</p>
              <ul className="flex flex-col gap-1">
                <li>
                  <Link
                    href="/nobetci-eczane"
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-ink/65 hover:bg-navy/5 hover:text-bordo"
                  >
                    <Pill className="h-3.5 w-3.5 shrink-0 text-bordo" />
                    Nöbetçi eczane
                  </Link>
                </li>
                <li>
                  <Link
                    href="/resmi-kurumlar"
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-ink/65 hover:bg-navy/5 hover:text-bordo"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-bordo" />
                    Resmi kurumlar
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rehberler"
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-ink/65 hover:bg-navy/5 hover:text-bordo"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-bordo" />
                    Gölbaşı rehberleri
                  </Link>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gold/30 bg-gold/[0.06] p-4">
              <p className="mb-1.5 text-[13px] font-semibold text-navy">İşletmeniz burada olsun</p>
              <p className="mb-3 text-[12.5px] leading-relaxed text-ink/60">
                Gölbaşı'nda işletmenizi ücretsiz ekleyin, binlerce ziyaretçiye ulaşın.
              </p>
              <Link
                href="/isletme-ekle"
                className="block rounded-lg bg-navy px-3 py-2 text-center text-[13px] font-semibold text-white hover:bg-navy/90"
              >
                Ücretsiz ekle
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}