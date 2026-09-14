import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, ShieldCheck, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getTaxiCategoryIds, normalizeNeighborhoodKey } from "@/lib/taxi";
import TaxiFinder from "@/components/TaxiFinder";
import type { TaxiListing } from "@/components/TaxiCard";

export const revalidate = 60;

const BASE_URL = "https://rehbergolbasi.com";

const FAQS = [
  {
    q: "Gölbaşı'nda en yakın taksiyi nasıl bulabilirim?",
    a: "Sayfanın üstündeki \"Konumumu Kullan\" butonuna basarak size en yakın taksi duraklarını kuş uçuşu mesafeye göre sıralı görebilirsiniz. Konumunuzu paylaşmak istemezseniz mahallenizi seçerek de arayabilirsiniz.",
  },
  {
    q: "Taksi durağını doğrudan arayabilir miyim?",
    a: "Evet. Her durağın kartındaki \"Hemen Ara\" butonu, telefonunuzun arama ekranını doğrudan o taksi durağının numarasıyla açar.",
  },
  {
    q: "Gölbaşı taksi durakları 7/24 hizmet veriyor mu?",
    a: "Bu değişir; her durağın kendi çalışma düzeni farklıdır. Yalnızca ekibimizin doğruladığı duraklarda \"7/24\" rozeti gösterilir. Rozeti olmayan bir durağın çalışma saatini telefonla teyit etmenizi öneririz.",
  },
  {
    q: "Konumumu paylaşmadan taksi bulabilir miyim?",
    a: "Evet. Konum izni vermeden mahallenizi seçerek veya durak adıyla arama yaparak tüm durakları görüntüleyebilir, arayabilir ve yol tarifi alabilirsiniz.",
  },
  {
    q: "Seymenler'de taksi durağı bulabilir miyim?",
    a: "Sistemde Seğmenler Mahallesi'nde hizmet veren kayıtlı bir taksi durağı bulunuyor. Mahalle filtresinden \"Seğmenler\" seçerek güncel telefon numarasına ulaşabilirsiniz.",
  },
  {
    q: "Eymir TOKİ'den taksi nasıl çağırabilirim?",
    a: "Eymir Mahallesi'nde hizmet veren bir taksi durağı sistemde kayıtlı. Mahalle filtresinden \"Eymir\" seçerek durağın telefon numarasına ulaşıp doğrudan arayabilirsiniz.",
  },
  {
    q: "İncek bölgesine taksi çağırabilir miyim?",
    a: "İncek, Gölbaşı taksi duraklarının hizmet alanına girebilir; bir durağın kartındaki \"Hizmet alanı\" bilgisini kontrol edin veya doğrudan durağı arayıp sorun.",
  },
  {
    q: "Taksi ücretini RehberGölbaşı mı belirliyor?",
    a: "Hayır. Ücretlendirme tamamen ilgili taksi durağına aittir. RehberGölbaşı ücret belirlemez, bilgilendirmez veya garanti etmez.",
  },
  {
    q: "RehberGölbaşı üzerinden taksi rezervasyonu yapılıyor mu?",
    a: "Hayır. RehberGölbaşı bir taksi işletmesi veya rezervasyon hizmeti değildir; yalnızca sizi durağın telefon numarasıyla buluşturur. Aracın ne zaman geleceğine ve müsaitliğine durak karar verir.",
  },
  {
    q: "Yanlış telefon numarasını nasıl bildirebilirim?",
    a: "Her taksi kartındaki \"Bilgi hatalı mı?\" bağlantısına tıklayıp birkaç saniyede bildirim gönderebilirsiniz. Ekibimiz bildirimleri kontrol ederek bilgiyi günceller.",
  },
];

interface TaxiRow {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  cover_image_url: string | null;
  is_featured: boolean;
  taxi_service_24_7: boolean;
  taxi_temporarily_unavailable: boolean;
  taxi_phone_verified_at: string | null;
}

function toDisplayNeighborhood(text: string): string {
  return text
    .replace(/\s*mahallesi\s*$/i, "")
    .replace(/\s*mah\.?\s*$/i, "")
    .trim();
}

async function getTaxiData(): Promise<{ taxis: TaxiListing[]; neighborhoods: string[] }> {
  const categoryIds = await getTaxiCategoryIds();
  if (categoryIds.length === 0) return { taxis: [], neighborhoods: [] };

  const { data: rows } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, phone, whatsapp, address, neighborhood, lat, lng, cover_image_url, is_featured, taxi_service_24_7, taxi_temporarily_unavailable, taxi_phone_verified_at"
    )
    .in("category_id", categoryIds)
    .eq("status", "approved")
    .eq("is_active", true)
    .eq("taxi_page_visible", true);

  const taxiRows = (rows ?? []) as TaxiRow[];
  if (taxiRows.length === 0) return { taxis: [], neighborhoods: [] };

  const { data: areaRows } = await supabase
    .from("business_service_areas")
    .select("business_id, neighborhood")
    .in("business_id", taxiRows.map((r) => r.id));

  const areasByBusiness = new Map<string, string[]>();
  (areaRows ?? []).forEach((a) => {
    const list = areasByBusiness.get(a.business_id) ?? [];
    list.push(a.neighborhood);
    areasByBusiness.set(a.business_id, list);
  });

  const taxis: TaxiListing[] = taxiRows.map((r) => ({
    ...r,
    serviceAreas: areasByBusiness.get(r.id) ?? [],
  }));

  const neighborhoodMap = new Map<string, string>();
  taxis.forEach((t) => {
    [t.neighborhood, ...t.serviceAreas].filter(Boolean).forEach((n) => {
      const key = normalizeNeighborhoodKey(n as string);
      if (key && !neighborhoodMap.has(key)) {
        neighborhoodMap.set(key, toDisplayNeighborhood(n as string));
      }
    });
  });
  const neighborhoods = Array.from(neighborhoodMap.values()).sort((a, b) => a.localeCompare(b, "tr"));

  return { taxis, neighborhoods };
}

export const metadata: Metadata = {
  title: "Gölbaşı Taksi Çağır – Taksi Durakları ve Telefonları",
  description:
    "Ankara Gölbaşı'nda yakınınızdaki taksi duraklarını bulun. Güncel telefon numaralarını görüntüleyin, tek dokunuşla arayın ve yol tarifi alın.",
  alternates: { canonical: `${BASE_URL}/taksi` },
  openGraph: {
    title: "Gölbaşı Taksi Çağır – Taksi Durakları ve Telefonları",
    description:
      "Ankara Gölbaşı'nda yakınınızdaki taksi duraklarını bulun. Güncel telefon numaralarını görüntüleyin, tek dokunuşla arayın ve yol tarifi alın.",
    url: `${BASE_URL}/taksi`,
    type: "website",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary",
    title: "Gölbaşı Taksi Çağır – Taksi Durakları ve Telefonları",
    description:
      "Ankara Gölbaşı'nda yakınınızdaki taksi duraklarını bulun. Güncel telefon numaralarını görüntüleyin, tek dokunuşla arayın ve yol tarifi alın.",
  },
};

export default async function TaksiPage() {
  const { taxis, neighborhoods } = await getTaxiData();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Taksi Çağır", item: `${BASE_URL}/taksi` },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: taxis.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TaxiService",
        name: t.name,
        url: `${BASE_URL}/isletme/${t.slug}`,
        ...(t.phone ? { telephone: t.phone } : {}),
        areaServed: "Gölbaşı, Ankara",
        ...(t.address
          ? {
              address: {
                "@type": "PostalAddress",
                streetAddress: t.address,
                addressLocality: "Gölbaşı",
                addressRegion: "Ankara",
                addressCountry: "TR",
              },
            }
          : {}),
        ...(t.lat != null && t.lng != null
          ? { geo: { "@type": "GeoCoordinates", latitude: t.lat, longitude: t.lng } }
          : {}),
      },
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {taxis.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm text-ink/50">
        <Link href="/" className="font-semibold transition-colors hover:text-bordo">Anasayfa</Link>
        <span>/</span>
        <span className="font-semibold text-navy">Taksi Çağır</span>
      </nav>

      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">
        Gölbaşı&apos;nda Taksi Çağır
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink/60">
        Konumuna yakın taksi duraklarını bul, telefonla ara veya yol tarifi al. Üyelik gerekmez.
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-ink/40">
        <ShieldCheck className="h-3.5 w-3.5 text-bordo" />
        {taxis.length} aktif taksi durağı listeleniyor · üyelik gerekmez, doğrudan durağı ararsınız
      </p>

      <div className="mt-6">
        <TaxiFinder initialTaxis={taxis} neighborhoods={neighborhoods} />
      </div>

      {/* Hukuki/güven mesajı */}
      <div className="mt-10 flex items-start gap-2.5 rounded-2xl border border-line bg-offwhite p-4 text-xs leading-relaxed text-ink/60">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink/40" />
        <p>
          RehberGölbaşı bir taksi işletmesi veya yolculuk aracılık hizmeti değildir. Listelenen
          taksi duraklarıyla doğrudan iletişim kurmanızı sağlar. Araç uygunluğu, tahmini varış
          süresi ve ücret bilgisi için ilgili taksi durağıyla görüşünüz.
        </p>
      </div>

      {/* SEO içeriği */}
      <section className="mt-12 flex flex-col gap-8 border-t border-line pt-8">
        <div>
          <h2 className="mb-2 font-display text-xl font-bold text-navy">Gölbaşı&apos;nda Taksi Nasıl Bulunur?</h2>
          <p className="leading-relaxed text-ink/70">
            Bu sayfada Gölbaşı&apos;ndaki kayıtlı taksi duraklarını tek yerde bulabilirsiniz.
            Konumunuzu paylaşırsanız size en yakın durakları mesafeye göre sıralı görürsünüz;
            paylaşmak istemezseniz mahallenizi seçerek veya durak adını yazarak da arayabilirsiniz.
            Her durağı doğrudan telefonla arayabilir, varsa WhatsApp&apos;tan yazabilir veya yol
            tarifi alabilirsiniz.
          </p>
        </div>

        <div>
          <h2 className="mb-2 font-display text-xl font-bold text-navy">Yakındaki Taksi Durağını Bulma</h2>
          <p className="leading-relaxed text-ink/70">
            &quot;Konumumu Kullan&quot; butonu yalnızca siz istediğinizde konum izni ister; sayfa
            açılır açılmaz izin istenmez. İzin verirseniz mesafeler kuş uçuşu (yaklaşık) olarak
            hesaplanır ve gerçek sürüş mesafesini yansıtmaz. Kesin konumunuz hiçbir şekilde
            kaydedilmez veya üçüncü taraflara gönderilmez.
          </p>
        </div>

        {neighborhoods.length > 0 && (
          <div>
            <h2 className="mb-2 font-display text-xl font-bold text-navy">Mahallelere Göre Taksi Durakları</h2>
            <p className="mb-3 leading-relaxed text-ink/70">
              Sistemde şu an aşağıdaki mahallelerde hizmet veren taksi durağı kayıtlı bulunuyor:
            </p>
            <div className="flex flex-wrap gap-2">
              {neighborhoods.map((n) => (
                <span key={n} className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold text-navy">
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="mb-2 font-display text-xl font-bold text-navy">Taksi Telefon Bilgilerinin Güncelliği</h2>
          <p className="leading-relaxed text-ink/70">
            Her durağın kartında telefon numarasının en son ne zaman kontrol edildiği görünür.
            Numaralar zamanla değişebilir; bir numaranın çalışmadığını fark ederseniz kart
            üzerindeki &quot;Bilgi hatalı mı?&quot; bağlantısıyla saniyeler içinde bize
            bildirebilirsiniz. Tek bir bildirim durağı otomatik olarak yayından kaldırmaz —
            ekibimiz kontrol ettikten sonra bilgiyi günceller.
          </p>
        </div>

        <div>
          <h2 className="mb-4 font-display text-xl font-bold text-navy">Gölbaşı Taksi Hakkında Sıkça Sorulan Sorular</h2>
          <div className="flex flex-col gap-2">
            {FAQS.map((faq, i) => (
              <details key={i} className="group rounded-xl border border-line bg-white p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-navy">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-ink/40 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2.5 text-sm leading-relaxed text-ink/65">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
