import type { Metadata } from "next";
import Link from "next/link";
import { Bus, ExternalLink } from "lucide-react";
import OtobusHatlariList from "./OtobusHatlariList";

export const metadata: Metadata = {
  title: "Gölbaşı Otobüs Saatleri — EGO Hatları ve Güzergahları",
  description:
    "Gölbaşı'ndan Ankara merkeze, Akköprü'ye, İncek'e ve çevre mahallelere giden tüm EGO otobüs hatları, güzergahları ve hareket saatleri.",
  alternates: {
    canonical: "https://rehbergolbasi.com/otobus-saatleri",
  },
};

export default function OtobusSaatleriPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-12">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink/50 hover:text-bordo"
      >
        ← Anasayfa
      </Link>

      <h1 className="mb-2 flex items-center gap-2 font-display text-3xl font-bold text-navy">
        <Bus className="h-7 w-7 text-bordo" /> Gölbaşı Otobüs Saatleri
      </h1>
      <p className="mb-6 text-sm text-ink/60">
        Gölbaşı'ndan Ankara merkeze, Akköprü'ye, İncek'e ve çevre mahallelere giden tüm EGO
        otobüs hatları, güzergahları ve hareket saatleri.
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

      <p className="mt-8 text-center text-[12.5px] text-ink/40">
        Saatler EGO Genel Müdürlüğü verilerine dayanır, resmi bayramlarda Cumartesi tarifesi
        uygulanır. Güncel bilgi için EGO Cep'te uygulamasını kullanabilirsiniz.
      </p>
    </div>
  );
}