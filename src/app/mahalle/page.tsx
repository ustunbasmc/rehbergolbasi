import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Users, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MAHALLELER } from "@/data/mahalleler";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gölbaşı Mahalleleri",
  description:
    "Gölbaşı'nın mahalleleri hakkında bilgi al: muhtar iletişim bilgileri, mahalledeki işletmeler, eğitim kurumları ve son haberler.",
  alternates: {
    canonical: "https://rehbergolbasi.com/mahalle",
  },
};

async function getBusinessCounts() {
  const { data } = await supabase
    .from("businesses")
    .select("neighborhood")
    .eq("status", "approved")
    .eq("is_active", true);

  const counts = new Map<string, number>();
  MAHALLELER.forEach((m) => {
    const count = (data ?? []).filter((b) => b.neighborhood && m.aliases.includes(b.neighborhood.trim())).length;
    counts.set(m.slug, count);
  });
  return counts;
}

export default async function MahallelerPage() {
  const counts = await getBusinessCounts();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: "https://rehbergolbasi.com" },
      { "@type": "ListItem", position: 2, name: "Mahalleler", item: "https://rehbergolbasi.com/mahalle" },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-10 sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(circle at 90% 15%, rgba(201,162,75,0.18), transparent 55%)",
          }}
        />
        <div className="relative">
          <nav className="mb-4 text-xs font-semibold text-white/60">
            <span className="text-white">Mahalleler</span>
          </nav>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Gölbaşı Mahalleleri
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            Gölbaşı&apos;nın mahalleleri hakkında muhtar iletişim bilgileri, işletmeler, eğitim kurumları ve son
            haberleri buradan bulabilirsin.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[...MAHALLELER].sort((a, b) => b.population - a.population).map((m) => (
          <Link
            key={m.slug}
            href={`/mahalle/${m.slug}`}
            className="card-shadow card-shadow-hover flex flex-col gap-3 rounded-2xl bg-white p-6 transition"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5 text-bordo">
              <MapPin className="h-5 w-5" />
            </span>
            <h2 className="font-display text-lg font-bold text-navy">{`${m.name} Mahallesi`}</h2>
            <p className="line-clamp-2 text-sm text-ink/60">{m.intro.split("\n\n")[0]}</p>
            <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-xs font-semibold text-ink/50">
              <span className="flex items-center gap-1.5 truncate">
                <Users className="h-3.5 w-3.5 shrink-0" />
                {m.population.toLocaleString("tr-TR")} nüfus
              </span>
              <span className="flex shrink-0 items-center gap-1 text-bordo">
                {counts.get(m.slug) ?? 0} işletme <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
