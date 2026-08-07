"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  GraduationCap,
  Landmark,
  MapPin,
  MapPinned,
  Route,
  Search,
  TreePine,
} from "lucide-react";
import { KATEGORILER, OTOBUS_HATLARI, type HatKategori, type OtobusHatti } from "@/data/otobus-hatlari";

type Gun = "haftaici" | "cumartesi" | "pazar";

const GUN_LABEL: Record<Gun, string> = {
  haftaici: "Hafta içi",
  cumartesi: "Cumartesi",
  pazar: "Pazar",
};

const KATEGORI_STIL: Record<HatKategori, { icon: typeof Landmark; renk: string; bg: string }> = {
  "sehir-merkezi": { icon: Landmark, renk: "text-bordo", bg: "bg-bordo" },
  "akkopru-asti": { icon: Building2, renk: "text-navy", bg: "bg-navy" },
  "incek-cankaya": { icon: GraduationCap, renk: "text-navy", bg: "bg-navy" },
  kirsal: { icon: TreePine, renk: "text-green-700", bg: "bg-green-700" },
  "golbasi-ici": { icon: MapPinned, renk: "text-gold", bg: "bg-gold" },
};

function bugununGunu(): Gun {
  const g = new Date().getDay(); // 0 Pazar, 6 Cumartesi
  if (g === 0) return "pazar";
  if (g === 6) return "cumartesi";
  return "haftaici";
}

function HatKarti({ hat }: { hat: OtobusHatti }) {
  const [gun, setGun] = useState<Gun>("haftaici");
  const stil = KATEGORI_STIL[hat.kategori];
  const Icon = stil.icon;

  useEffect(() => {
    setGun(bugununGunu());
  }, []);

  return (
    <article id={`hat-${hat.no}`} className="scroll-mt-20 rounded-2xl border border-line bg-white p-4 transition hover:border-bordo/30 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 rounded-lg ${stil.bg} px-2.5 py-1.5 text-sm font-bold text-white`}>
            {hat.no}
          </div>
          <div>
            <h3 className="text-[15px] font-semibold leading-snug text-navy">{hat.ad}</h3>
            <p className="mt-1 flex items-center gap-1 text-[13px] text-ink/60">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {hat.kalkis} → {hat.varis}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Icon className={`h-4 w-4 ${stil.renk}`} />
          <p className="whitespace-nowrap text-right text-[12.5px] text-ink/45">
            {hat.mesafeKm} km · {hat.sureDk} dk
          </p>
        </div>
      </div>

      {hat.notlar && (
        <p className="mt-3 rounded-lg bg-gold/10 px-3 py-1.5 text-[12.5px] text-navy/80">{hat.notlar}</p>
      )}

      <div className="mt-4 flex gap-1 border-b border-line">
        {(Object.keys(GUN_LABEL) as Gun[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGun(g)}
            className={`-mb-px border-b-2 px-2 py-1.5 text-[12.5px] font-medium transition ${
              gun === g ? "border-bordo text-bordo" : "border-transparent text-ink/45 hover:text-ink/70"
            }`}
          >
            {GUN_LABEL[g]}
          </button>
        ))}
      </div>

      {/* Üç günün de saatleri her zaman DOM'da — arama motorları tüm sefer saatlerini görür,
          sadece görsel olarak seçili gün gösterilir. */}
      {(Object.keys(GUN_LABEL) as Gun[]).map((g) => {
        const saatler = hat.saatler[g];
        return (
          <div key={g} className={gun === g ? "mt-3" : "hidden"}>
            {saatler.length === 0 ? (
              <p className="text-[13px] text-ink/45">{GUN_LABEL[g]} için sefer bulunmuyor.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {saatler.map((s, i) => (
                  <span key={i} className="rounded-md bg-navy/5 px-2 py-1 text-[12.5px] font-medium text-navy">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <details className="group mt-4 border-t border-line pt-3">
        <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-medium text-bordo">
          <span className="flex items-center gap-1.5">
            <Route className="h-3.5 w-3.5" />
            Tüm durakları gör ({hat.duraklar.length} durak)
          </span>
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
        </summary>
        <ol className="mt-3 max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {hat.duraklar.map((durak, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] text-ink/70">
              <span className="w-5 shrink-0 text-ink/35">{i + 1}</span>
              {durak}
            </li>
          ))}
        </ol>
      </details>
    </article>
  );
}

export default function OtobusHatlariList() {
  const [kategori, setKategori] = useState<HatKategori | "tumu">("tumu");
  const [arama, setArama] = useState("");

  const filtreliHatlar = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr");
    return OTOBUS_HATLARI.filter((hat) => {
      const kategoriUyuyor = kategori === "tumu" || hat.kategori === kategori;
      if (!kategoriUyuyor) return false;
      if (!q) return true;
      return (
        hat.no.toLocaleLowerCase("tr").includes(q) ||
        hat.ad.toLocaleLowerCase("tr").includes(q) ||
        hat.duraklar.some((d) => d.toLocaleLowerCase("tr").includes(q))
      );
    });
  }, [kategori, arama]);

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-5 bg-white/95 px-5 pb-3 pt-2 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input
            type="text"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Hat no veya mahalle ara (örn: 105, İncek, Ballıkpınar)"
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-bordo"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setKategori("tumu")}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
              kategori === "tumu" ? "bg-bordo text-white" : "border border-line text-ink/60"
            }`}
          >
            Tümü
          </button>
          {KATEGORILER.map((k) => (
            <button
              key={k.key}
              type="button"
              onClick={() => setKategori(k.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                kategori === k.key ? "bg-bordo text-white" : "border border-line text-ink/60"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      {filtreliHatlar.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink/45">Aramanızla eşleşen bir hat bulunamadı.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {filtreliHatlar.map((hat) => (
            <HatKarti key={hat.no} hat={hat} />
          ))}
        </div>
      )}
    </div>
  );
}