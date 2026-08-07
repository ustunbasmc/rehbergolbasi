import type { Metadata } from "next";
import { Clock, AlertCircle, ChevronDown } from "lucide-react";
import Link from "next/link";
import PharmacyCard from "@/components/PharmacyCard";

export const revalidate = 3600;

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  phone2: string | null;
  location: { latitude: number; longitude: number } | null;
}

export async function generateMetadata(): Promise<Metadata> {
  const gorselTarih = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return {
    title: `Gölbaşı Nöbetçi Eczane — ${gorselTarih} Bugün Açık Eczaneler`,
    description:
      "Ankara Gölbaşı'nda bugün nöbetçi olan eczanelerin adresi, telefonu ve konumu. Her gece güncellenir.",
    alternates: {
      canonical: "https://rehbergolbasi.com/nobetci-eczane",
    },
    openGraph: {
      title: `Gölbaşı Nöbetçi Eczane — ${gorselTarih}`,
      description: "Ankara Gölbaşı'nda bugün nöbetçi olan eczanelerin adresi, telefonu ve konumu.",
      url: "https://rehbergolbasi.com/nobetci-eczane",
      type: "website",
      locale: "tr_TR",
    },
  };
}

async function getPharmacies(): Promise<Pharmacy[]> {
  try {
    const res = await fetch(
      "https://eczaneapi.com/api/v1/pharmacies/on-duty?city=ankara&district=golbasi",
      {
        headers: { "X-API-Key": process.env.ECZANE_API_KEY! },
        next: { revalidate: 21600 },
      }
    );
    const data = await res.json();

    const today = new Date().toISOString().slice(0, 10);
    const todayGroup = (data?.data ?? []).find(
      (g: { date: string; pharmacies: Pharmacy[] }) => g.date === today
    );
    return todayGroup?.pharmacies ?? [];
  } catch {
    return [];
  }
}

const SSS = [
  {
    soru: "Nöbetçi eczane nedir, nasıl belirlenir?",
    cevap:
      "Nöbetçi eczaneler, mesai saatleri dışında (akşam, gece ve resmi tatillerde) halkın acil ilaç ihtiyacını karşılamak için Eczacı Odası tarafından sırayla görevlendirilir. Her gün farklı eczaneler nöbet tutar.",
  },
  {
    soru: "Gölbaşı'da nöbetçi eczane saatleri nedir?",
    cevap:
      "Nöbetçi eczaneler genellikle akşam 19:00'dan ertesi sabah 09:00'a kadar, hafta sonu ve resmi tatillerde ise 24 saat açık kalır. Kesin saatler eczaneden eczaneye değişebileceğinden gitmeden önce telefonla teyit etmeniz önerilir.",
  },
  {
    soru: "Bu sayfadaki bilgiler ne sıklıkla güncelleniyor?",
    cevap:
      "Nöbetçi eczane listesi her gece 00:00'da güncellenir ve Ankara Eczacılar Odası verilerine dayanır.",
  },
];

export default async function NobetciEczanePage() {
  const pharmacies = await getPharmacies();
  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: "https://rehbergolbasi.com" },
      { "@type": "ListItem", position: 2, name: "Nöbetçi Eczane", item: "https://rehbergolbasi.com/nobetci-eczane" },
    ],
  };

  const pharmacyJsonLd =
    pharmacies.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: pharmacies.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Pharmacy",
              name: p.name,
              address: {
                "@type": "PostalAddress",
                streetAddress: p.address,
                addressLocality: "Gölbaşı",
                addressRegion: "Ankara",
                addressCountry: "TR",
              },
              telephone: p.phone,
              ...(p.location && {
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: p.location.latitude,
                  longitude: p.location.longitude,
                },
              }),
            },
          })),
        }
      : null;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SSS.map((s) => ({
      "@type": "Question",
      name: s.soru,
      acceptedAnswer: { "@type": "Answer", text: s.cevap },
    })),
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {pharmacyJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pharmacyJsonLd) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="mb-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink/50 hover:text-bordo"
        >
          ← Anasayfa
        </Link>
        <h1 className="font-display text-3xl font-bold text-navy">Ankara Gölbaşı Nöbetçi Eczane</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-ink/60">
          <Clock className="h-4 w-4" />
          <span>{today}</span>
        </div>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-4">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
        <p className="text-sm text-ink/70">
          Eczaneye gitmeden önce telefonla açık olduğunu teyit etmeniz önerilir. Bilgiler her gece 00:00'da güncellenir.
        </p>
      </div>

      {pharmacies.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-8 text-center">
          <p className="text-sm text-ink/50">
            Bugün için nöbetçi eczane bilgisi bulunamadı.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-ink/50">
            {pharmacies.length} nöbetçi eczane bulundu
          </p>
          {pharmacies.map((pharmacy) => (
            <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
          ))}
        </div>
      )}

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

      <p className="mt-8 text-center text-xs text-ink/30">
        Veri kaynağı: EczaneAPI — Ankara Eczacılar Odası verileri
      </p>
    </div>
  );
}