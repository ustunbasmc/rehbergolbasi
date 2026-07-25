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

      <div className="mb-8 rounded-2xl border border-line bg-bordo p-6 text-center">
        <Bus className="mx-auto mb-3 h-8 w-8 text-white" />
        <h2 className="mb-2 font-display text-lg font-bold text-white">
          Otobüsünüz Nerede?
        </h2>
        <p className="mb-4 text-sm text-white/80">
          Hat veya durak numaranızı girerek otobüsünüzün anlık konumunu EGO'nun resmi sisteminden takip edin.
        </p>
        <Link
          href="https://www.ego.gov.tr/otobusnerede"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-bordo hover:bg-white/90"
        >
          <ExternalLink className="h-4 w-4" /> Canlı Takip Et
        </Link>
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