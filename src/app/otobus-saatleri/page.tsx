import type { Metadata } from "next";
import Link from "next/link";
import { Bus, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Gölbaşı Otobüs Saatleri — EGO Hatları",
  description: "Gölbaşı'ndan Ankara merkeze giden EGO otobüs hatları, güzergahları ve canlı takip.",
  alternates: {
    canonical: "https://rehbergolbasi.com/otobus-saatleri",
  },
};

const HATLAR = [
  { no: "104-1", guzergah: "Gölbaşı - Akköprü" },
  { no: "105-1", guzergah: "Gölbaşı - Kızılay" },
  { no: "106-3", guzergah: "Gölbaşı - Akköprü - Ulus" },
  { no: "107-6", guzergah: "Gölbaşı - Toki - Akköprü - Ulus (Gece hattı da mevcut)" },
  { no: "115-3", guzergah: "Gölbaşı - Yurtlar - Milli Kütüphane" },
  { no: "146", guzergah: "Gölbaşı - Gülbağı - Akörençarsak - Derekışla - Berçarsak - Sofular - Karahamzalı" },
  { no: "180", guzergah: "Gölbaşı - Karaoğlan - Oğulbey - Karaali" },
];

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
      <p className="mb-8 text-sm text-ink/60">
        Gölbaşı'ndan Ankara merkeze giden EGO otobüs hatları.
      </p>

      <div className="mb-8 rounded-2xl border border-line bg-white p-5">
        <h2 className="mb-3 text-sm font-bold text-navy">Canlı Otobüs Takibi (Test)</h2>
        <iframe
          src="https://www.ego.gov.tr/otobusnerede"
          className="h-[500px] w-full rounded-lg border border-line"
          title="EGO Otobüs Nerede"
        />
      </div>

      <div className="flex flex-col gap-3">
        {HATLAR.map((hat) => (
          <div
            key={hat.no}
            className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bordo/10 text-sm font-bold text-bordo">
              {hat.no}
            </div>
            <p className="text-sm text-ink/70">{hat.guzergah}</p>
          </div>
        ))}
      </div>
    </div>
  );
}